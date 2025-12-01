# Limelight Device Dashboard

A single-page dashboard that reads a live **1 Hz device stream**, visualizes trends, computes KPIs, and generates automatic insights.  
This project was built as the assignment for Limelight.

---

## 📝 Notes

I’ve slightly tweaked the live SSE server file and made it npm-friendly by adding a script in `package.json`. This allows the backend to run and deploy properly.

---

## 🚀 Features

### 📡 Live Data Streaming
- Connects to the provided **SSE stream** (`/stream`) sending **1 JSON record per second**.
- Automatically updates UI: KPIs, charts, insights.

### ⏱️ Time Window Selector
Select **5 min**, **15 min**, or **30 min**.  
All calculations (KPIs, charts, insights, CSV export) are based on the **visible window**.

### 📊 KPIs (computed in real time)
- **Uptime / Idle / Off (%)**
- **Average kW**
- **Energy (kWh)** using `kwh_total`
- **Average PF** (ignoring OFF samples)
- **Throughput (units/min)** using `count_total`
- **Phase Imbalance (%)**

### 📈 Charts
- **kW vs Time** line chart (live-updating)
- Adapted to the selected window

### 🔍 Automatic Insights  
All insights are computed based on the **currently visible time window** and aim to surface meaningful electrical and operational patterns.

1. **Low PF Period**  
   The dashboard scans for any continuous duration where the power factor stays below the threshold. Low PF can impact power quality and lead to billing penalties, so even short low-PF periods help highlight inefficiencies. Because the dataset is only ~20 minutes long, the duration threshold is adjusted proportionally while keeping the logic realistic.

2. **Phase Imbalance Event**  
   The system detects windows where phase imbalance exceeds 15% for a sustained period. Phase imbalance can damage motors, reduce efficiency, and cause overheating, so catching these periods early gives operators clear visibility into potential electrical issues.

3. **Peak 15-Minute Demand Window** 
   A rolling 15-minute average of kW is computed, and the window with the highest demand is highlighted along with its timestamp. Peak demand plays a major role in industrial energy costs, so finding the highest load period—even in a short dataset—helps reveal meaningful machine behavior.


### 📥 CSV Export
- Export **only the visible window** as a CSV file  
- Includes all JSON fields from the stream

### ⚠️ Data Gap Detection
Shows warning if **no data is received for &gt; 10 seconds**.

---

## 🖥️ How to Run Locally

### 0️⃣ Clone the repository
```bash
git clone https://github.com/Goutamsahu23/Limelight-Dashboard.git
cd Limelight-Dashboard

### 1️⃣ Start the backend (SSE stream)
```bash
cd backend

# Option 1: Using npm script
npm start

# Option 2: Running the file directly
node live_sse_server.js
```

This starts the stream at:  
http://localhost:8080/stream

### 2️⃣ Start the React frontend
```bash
cd frontend
npm install
npm start
```

Frontend runs at:  
👉 http://localhost:3000


---

## 📝 Notes

- All calculations follow the provided JSON schema (v2).
- All insights are computed only on the **visible time window**.
- The dashboard gracefully handles missing fields and irregular timestamps.
- The UI is responsive and works on mobile.

---

## ✔️ Tech Stack

### Frontend
- React (Create React App)
- Recharts (charts)
- Custom hooks, utils

### Backend (provided)
- Node.js SSE server from Limelight
- JSONL sample stream

