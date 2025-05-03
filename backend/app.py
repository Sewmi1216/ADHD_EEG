import asyncio
from collections import defaultdict
import websockets
import json
import numpy as np
import joblib
import pywt

# --- Config ---
scaler_path = "model/Kmeans_TLBR_Scaler.pkl"
model_path = "model/Kmeans_TLBR_Model.pkl"

# --- Load Model and scaler ---
scaler = joblib.load(scaler_path)
kmeans = joblib.load(model_path)

# --- EEG Settings ---
sampling_rate = 256

theta_band = (4, 8)
low_beta_band = (13, 20)
wavelet = 'cmor1.0-0.5'

# --- Power via CWT ---
def compute_power_cwt(signal, scales, wavelet):
    coefficients, _ = pywt.cwt(signal, scales, wavelet, sampling_period=1.0/sampling_rate)
    return np.abs(coefficients) ** 2

# --- Feature Extraction ---
def extract_features(eeg_data):
    window_duration = 5
    window_length = window_duration * sampling_rate
    overlap = 0.5
    step_size = int(window_length * (1 - overlap))

    scales_theta = pywt.frequency2scale(wavelet, np.array(theta_band) / sampling_rate)
    scales_low_beta = pywt.frequency2scale(wavelet, np.array(low_beta_band) / sampling_rate)

    all_theta_low_beta_features = []

    for i in range(0, len(eeg_data) - window_length + 1, step_size):
        window_signal = eeg_data[i:i + window_length, :]

        window_theta_low_beta = []

        for ch in range(window_signal.shape[1]):
            theta_power = compute_power_cwt(window_signal[:, ch], scales_theta, wavelet).mean(axis=0)
            low_beta_power = compute_power_cwt(window_signal[:, ch], scales_low_beta, wavelet).mean(axis=0)

            theta_low_beta_ratio = theta_power / low_beta_power
            window_theta_low_beta.append(theta_low_beta_ratio.mean())

        all_theta_low_beta_features.append(np.mean(window_theta_low_beta))

    return np.array(all_theta_low_beta_features).reshape(-1, 1)

# Global states
current_attention_states = defaultdict(lambda: "Mid")
connected_clients = set()
child_eeg_data = dict()
client_profile_tasks = dict()
active_tasks = dict()
paused_children = set()
child_window_indices = defaultdict(int)  # {child_id: current_window_index}
last_profile_sent = defaultdict(lambda: -1)  # {child_id: last_sent_window_index}
profile_streaming_child = None  # Track which child's profile is being streamed

# Broadcast helper
async def broadcast(message):
    for client in connected_clients:
        try:
            await client.send(message)
        except:
            pass

async def process_child(child_id, eeg_data):
    features = extract_features(eeg_data)

    # Ensure features are 2D before scaling
    if features.ndim == 1:
        features = features.reshape(-1, 1)

    normalized = scaler.transform(features).astype(np.float32)
    cluster_labels = kmeans.predict(normalized)

    attention_states_map = {0: "Mid", 1: "High", 2: "Low"}
    total_windows = len(features)

    while child_window_indices[child_id] < total_windows:
        i = child_window_indices[child_id]

        state = attention_states_map[cluster_labels[i]]
        current_attention_states[child_id] = state

       # Only send dashboard update if not in profile view for this child
        if child_id not in paused_children and profile_streaming_child != child_id:
            print(f"📊🧠 Child {child_id} ➡️ Window {i+1} ({i*5}-{(i+1)*5}s) ➡️ Attention: {state}")
            broadcast_message = {
                "type": "dashboard_update",
                "child_id": child_id,
                "attention_level": state
            }
            await broadcast(json.dumps(broadcast_message))

        last_profile_sent[child_id] = i
        child_window_indices[child_id] += 1
        await asyncio.sleep(5)

    print(f"✅ EEG processing completed for Child {child_id}.")

# Start processing all children
async def start_processing_all_children():
    for child_id, eeg_data in child_eeg_data.items():
        if child_id not in active_tasks:
            task = asyncio.create_task(process_child(child_id, eeg_data))
            active_tasks[child_id] = task

# WebSocket handler
async def handler(websocket):
    print("✅ New client connected")
    connected_clients.add(websocket)

    if not active_tasks:
        asyncio.create_task(start_processing_all_children())
        print("🚀 Started EEG processing task")

    try:
        async for message in websocket:
            data = json.loads(message)

            if data.get("type") == "dashboard":
                print("📊 Dashboard client identified")

                # Resume all children (un-pause)
                paused_children.clear()

                # Send current states immediately
                for child_id, state in current_attention_states.items():
                    response = {
                        "type": "dashboard_update",
                        "child_id": child_id,
                        "attention_level": state
                    }
                    await websocket.send(json.dumps(response))

            elif data.get("type") == "start_stream":
                child_id = data.get("child_id")
                print(f"🎯 Start profile stream for ➡️ Child {child_id}")

                global profile_streaming_child
                profile_streaming_child = child_id

                # Pause all except selected child
                paused_children.clear()
                paused_children.update(child_eeg_data.keys())
                paused_children.remove(child_id)

                # Cancel previous profile stream if exists
                task = client_profile_tasks.get(websocket)
                if task:
                    task.cancel()

                # Start streaming profile details (with time window)
                task = asyncio.create_task(stream_profile(child_id, websocket))
                client_profile_tasks[websocket] = task

            elif data.get("type") == "stop_stream":

                print("🛑 Stop profile stream ➡️ Resume dashboard")

                # Resume updates for all children
                for child_id in paused_children:
                    # Force sync their window index to the profile child's index
                    child_window_indices[child_id] = child_window_indices[profile_streaming_child]

                paused_children.clear()
                profile_streaming_child = None


            else:
                print("⚠️ Unknown message type received:", data)

    except websockets.exceptions.ConnectionClosed:
        print("🔌 Client disconnected")

    finally:
        connected_clients.remove(websocket)

        # Clean up profile streaming task
        task = client_profile_tasks.get(websocket)
        if task:
            task.cancel()
            del client_profile_tasks[websocket]

# Stream profile details (window + attention state)
async def stream_profile(child_id, websocket):
    attention_states = {0: "Mid", 1: "High", 2: "Low"}
    eeg_data = child_eeg_data[child_id]
    features = extract_features(eeg_data)
    # Ensure features are 2D before scaling
    if features.ndim == 1:
        features = features.reshape(-1, 1)

    normalized = scaler.transform(features).astype(np.float32)
    cluster_labels = kmeans.predict(normalized)

    total_windows = len(features)

    i = last_profile_sent.get(child_id, -1) + 1
    
    while i < total_windows:
        state = attention_states[cluster_labels[i]]
        print(f"👤🧠 Child {child_id} ➡️ Window {i+1} ({i*5}-{(i+1)*5}s) ➡️ Attention: {state}")

        response = {
            "type": "profile_data",
            "child_id": child_id,
            "window": i + 1,
            "time": f"{i*5}-{(i+1)*5}s",
            "attention_level": state,
        }
        #print("📤 Sending to client:", json.dumps(response))

        try:
            await websocket.send(json.dumps(response))
            last_profile_sent[child_id] = i
            i += 1  # Only increment after successful send
        except Exception as e:
            print(f"Error sending data: {e}")
            break  # or handle reconnection

        await asyncio.sleep(5)  # 5-second delay between windows

    print(f"✅ Profile stream completed for Child {child_id}.")


# Load EEG
def preload_eeg_data():
    for child_id in range(1, 11):  # child IDs 1 to 10
        segment_path = f"test_segments/child_{child_id}.npy"
        eeg_data = np.load(segment_path)
        child_eeg_data[child_id] = eeg_data
        #print(f"✅ Preloaded EEG for Child {child_id}")

# Main
async def main():
    server = await websockets.serve(handler, "192.168.135.250", 8765)
    print("🚀 WebSocket server started...")
    preload_eeg_data()
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
