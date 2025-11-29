// src/App.js
import React, { useMemo, useState, useEffect } from 'react';
import './App.css';
import { useDeviceStream } from './hooks/useDeviceStream';
import KpiSection from './components/KpiSection';
import ChartSection from './components/ChartSection';
import InsightsSection from './components/InsightsSection';


function getVisibleRecords(records, windowMinutes) {
  if (!records || records.length === 0) return [];

  const maxCount = windowMinutes * 60; // e.g. 5 * 60 = 300
  if (records.length <= maxCount) {
    return records;
  }
  // keep only the most recent N records
  return records.slice(records.length - maxCount);
}

// Helper: convert array of objects to CSV text
function convertToCsv(data) {
  if (!data || data.length === 0) return "";

  const keys = Object.keys(data[0]);
  const header = keys.join(",");

  const rows = data.map((row) =>
    keys
      .map((key) => {
        let value = row[key];
        if (value === null || value === undefined) value = "";
        value = String(value);
        // Escape quotes by double-quoting them
        value = value.replace(/"/g, '""');
        // Wrap in quotes in case of commas
        return `"${value}"`;
      })
      .join(",")
  );

  return [header, ...rows].join("\n");
}

// Helper: trigger browser download of a CSV string
function downloadCsv(csvText, filename) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const STREAM_URL = process.env.REACT_APP_STREAM_URL || "http://localhost:8080/stream";


function App() {
  // also getting lastMessageAt from the hook
  const { records, error, connected, lastMessageAt } = useDeviceStream(
    STREAM_URL
  );


  // Time window in minutes (5, 15, 30)
  const [windowMinutes, setWindowMinutes] = useState(15);

  // A ticking "clock" so gapSeconds keeps updating every second
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Compute visible records for current window (count-based)
  const visibleRecords = useMemo(
    () => getVisibleRecords(records, windowMinutes),
    [records, windowMinutes]
  );

  // Latest record in window, or from all records if window is empty
  const latestAll = records.length > 0 ? records[records.length - 1] : null;
  const latest = visibleRecords.length > 0
    ? visibleRecords[visibleRecords.length - 1]
    : latestAll;

  // Data gap detection: how many seconds since we LAST RECEIVED a message?
  let gapSeconds = null;
  if (lastMessageAt != null) {
    gapSeconds = (nowTick - lastMessageAt) / 1000;
  }

  const hasBigGap = gapSeconds != null && gapSeconds > 10;

  // Handle CSV export for current visible window
  function handleExportClick() {
    if (!visibleRecords || visibleRecords.length === 0) return;
    const csv = convertToCsv(visibleRecords);
    if (!csv) return;
    downloadCsv(csv, `visible_window_${windowMinutes}min.csv`);
  }

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="app-title-block">
          <h1>Limelight Dashboard</h1>
          <p className="subtitle">Live 1 Hz device stream · Demo dashboard</p>
        </div>

        <div className="status-inline">
          <span
            className={
              connected ? "status-pill status-ok" : "status-pill status-bad"
            }
          >
            <span className="status-dot" /> {connected ? "Online" : "Offline"}
          </span>

          <span className="status-mini">
            Total: <strong>{records.length}</strong>
          </span>

          <span className="status-mini">
            Window: <strong>{visibleRecords.length}</strong>
          </span>

          <span
            className={
              hasBigGap ? "status-mini status-mini-bad" : "status-mini status-mini-ok"
            }
          >
            Gap: {gapSeconds == null ? "n/a" : `${Math.floor(gapSeconds)}s`}
          </span>
        </div>
      </header>

      {hasBigGap && (
        <div className="status-warning">
          No new data received for more than 10 seconds.
        </div>
      )}
      {error && <div className="status-warning">Error: {error}</div>}

      {/* Window selector + export button */}
      <div className="window-bar">
        <div className="window-buttons">
          <span className="window-label">Window:</span>
          <button
            className={windowMinutes === 5 ? 'window-btn active' : 'window-btn'}
            onClick={() => setWindowMinutes(5)}
          >
            5 min
          </button>
          <button
            className={windowMinutes === 15 ? 'window-btn active' : 'window-btn'}
            onClick={() => setWindowMinutes(15)}
          >
            15 min
          </button>
          <button
            className={windowMinutes === 30 ? 'window-btn active' : 'window-btn'}
            onClick={() => setWindowMinutes(30)}
          >
            30 min
          </button>
        </div>

        <button
          className="export-btn"
          onClick={handleExportClick}
          disabled={!visibleRecords || visibleRecords.length === 0}
        >
          Export visible CSV
        </button>
      </div>

      {/* Main layout */}
      <main className="app-main">
        <div className="grid-two-columns">
          {/* KPIs + insights use only records in the current window */}
          <KpiSection records={visibleRecords} />
          <InsightsSection records={visibleRecords} />
        </div>

        {/* Chart also uses windowed records */}
        <ChartSection records={visibleRecords} />

        {/* Latest raw record (from window if possible, else from all) */}
        <section className="card">
          <h2>Latest Raw Record</h2>
          {latest ? (
            <pre className="raw-json">
              {JSON.stringify(latest, null, 2)}
            </pre>
          ) : (
            <p>No data yet… waiting for stream.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
