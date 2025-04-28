import asyncio
import websockets
import json
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import pywt

# --- Config ---
segment_path = "participant_4/segment_1.npy"
scaler_path = "model/KmeansScaler.pkl"
model_path = "model/Kmeans_Model.pkl"

# --- Load Model and scaler ---
scaler = joblib.load(scaler_path)
kmeans = joblib.load(model_path)

# --- EEG Settings ---
sampling_rate = 256
alpha_band = (8, 13)
theta_band = (4, 8)
low_beta_band = (13, 20)
wavelet = 'cmor1.0-0.5'

# --- Power via CWT ---
def compute_power_cwt(signal, scales, wavelet):
    coefficients, _ = pywt.cwt(signal, scales, wavelet, sampling_period=1.0/sampling_rate)
    return np.abs(coefficients) ** 2

# --- Feature Extraction---
def extract_features(eeg_data):
    window_duration = 5
    window_length = window_duration * sampling_rate
    overlap = 0.5
    step_size = int(window_length * (1 - overlap))

    scales_alpha = pywt.frequency2scale(wavelet, np.array(alpha_band) / sampling_rate)
    scales_theta = pywt.frequency2scale(wavelet, np.array(theta_band) / sampling_rate)
    scales_low_beta = pywt.frequency2scale(wavelet, np.array(low_beta_band) / sampling_rate)

    all_alpha_low_beta_features = []
    all_theta_low_beta_features = []

    for i in range(0, len(eeg_data) - window_length + 1, step_size):
        window_signal = eeg_data[i:i + window_length, :] 

        window_alpha_low_beta = []
        window_theta_low_beta = []

        for ch in range(window_signal.shape[1]):
            # Compute power using CWT
            alpha_power = compute_power_cwt(window_signal[:, ch], scales_alpha, wavelet).mean(axis=0)
            theta_power = compute_power_cwt(window_signal[:, ch], scales_theta, wavelet).mean(axis=0)
            low_beta_power = compute_power_cwt(window_signal[:, ch], scales_low_beta, wavelet).mean(axis=0)

            # Compute ratios
            alpha_low_beta_ratio = alpha_power / low_beta_power
            theta_low_beta_ratio = theta_power / low_beta_power

            # Store mean ratio for the channel
            window_alpha_low_beta.append(alpha_low_beta_ratio.mean())
            window_theta_low_beta.append(theta_low_beta_ratio.mean())

        # Average ratios across all selected channels
        all_alpha_low_beta_features.append(np.mean(window_alpha_low_beta))
        all_theta_low_beta_features.append(np.mean(window_theta_low_beta))

    features = np.column_stack((all_alpha_low_beta_features, all_theta_low_beta_features))
    return features


# --- WebSocket Handler ---
async def handle_connection(websocket, path):
    print("Client connected")

    try:
        eeg_data = np.load(segment_path)
        features = extract_features(eeg_data)
        
        normalized = scaler.transform(features)
        normalized = normalized.astype(np.float32)
 
        cluster_labels = kmeans.predict(normalized)

        print("Successful predictions:", cluster_labels)

        cluster_labels = kmeans.predict(normalized)
        
        attention_states = {0: "Low", 1: "High", 2: "Mid"}

        for i, (alpha, theta) in enumerate(features):
            
            state = attention_states[cluster_labels[i]]

            response = {
                "window": i + 1,
                "time": f"{i*5}-{(i+1)*5}s",
                "attention_level": state,
            }

            print(json.dumps(response))
            await websocket.send(json.dumps(response))

            await asyncio.sleep(5)  # Simulate real-time 5-second window delay

    except Exception as e:
        print("Error:", e)


# --- Start Server ---
async def main():
    server = await websockets.serve(handle_connection, "192.168.24.250", 8765)
    print("WebSocket server started at ws://192.168.24.250:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
