
---

# AttenFlow: Machine Learning and EEG Data to Assess Attention Patterns in Children

## Overview

**AttenFlow** is a research project aimed at analyzing attention patterns in children using **Electroencephalography (EEG)** data and **machine learning techniques**.


Our goal is to identify and classify attention levels based on EEG features using unsupervised machine learning algorithms.

---

## Dataset

The EEG dataset used in this research was provided by:

* Department of Child and Adolescent Psychiatry
* Technical University of Dresden
* Made publicly accessible by **Professor Christian Beste**

---

* Dataset includes EEG recordings of **144 children**
* Age group: **10–12 years**
* Conditions: **Control group(n=44), ADD group(n=52), ADHD group(n=48)**
* Trial Duration: **1.5 seconds each**
* Sampling Rate: **256 Hz**
* EEG Channels: **56**
* Data Format: `.mat`
* Data Shape: **Timepoints × Channels × Trials**

🔗 **Dataset Link (OSF)**: [https://osf.io/6594x/](https://osf.io/6594x/)

---


## Project Structure

```
ADHD_EEG/
├── backend/
│   ├── model/               # Clustering model
│   ├── test_segments/       # EEG test segments
│   └── app.py               # Server file
│   └── requirements.txt     # List of required Python packages
├── eeg/
│   ├── erp/                 # Colab notebooks for ERP clustering
│   ├── frequency/           # Colab notebooks for Frequency features clustering
├── frontend/                # React Native project files
├── README.md                # Project overview and setup guide
```

## Getting Started

This project has **two main parts**:

* 🟦 **Backend**: Python-based WebSocket Server for EEG Processing & ML
* 🟩 **Frontend**: React Native mobile app for real-time attention monitoring

Follow the steps below to set up both.

---
### 🟦 Backend Setup (Python - WebSocket Server for EEG Processing & ML)
### 1. **Clone the repository:**

```bash
git clone https://github.com/Sewmi1216/ADHD_EEG
cd ADHD_EEG/backend
```
2. **Create and Activate Virtual Environment:**

```bash
python -m venv venv
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. Start Backend Server

```bash
python app.py
```
### 🟩 Frontend Setup (React Native - Mobile App)

#### 1. Navigate to Frontend Folder

```bash
cd ../frontend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Start Development Server

```bash
expo start
```

* Scan the QR code with **Expo Go** app
* Or run on emulator (Android/iOS)

---
## Methodology

The analysis workflow consists of the following key steps:

1. **Preprocessing**

✅ Note: Basic preprocessing is already performed in the public dataset.

The available data is preprocessed with the following steps applied by the dataset providers:

   * Bandpass filtering (0.5–20 Hz)
   * ICA-based artifact removal
   * Downsampling to 256 Hz
   * Baseline correction
   * Epoch segmentation (1.5s trials)
     
For our analysis, out of the 56 EEG channels, we selected the most relevant 15 channels.

2. **Feature Extraction**

   * Relative power in Delta, Theta, Alpha, and Beta bands
   * Theta-Beta Ratio (TBR), Theta-Alpha Ratio (TAR), Theta-Beta-Alpha Ratio (TBAR)
   * ERP features (e.g., P3, P1, N1)

3. **Modeling**

   * Clustering (e.g., K-means) for attention-level discovery
   * Evaluation using Elbow Method, Silhouette Score, and Davies-Bouldin Index

4. **Interpretation**

   * Clusters interpreted as high, medium, and low attention levels
   * Comparison across control and ADHD groups

---



