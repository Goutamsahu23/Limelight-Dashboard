// src/components/ChartSection.js
import React, { useMemo, useState, Suspense } from "react";

// Lazy-load heavy chart components
const PowerChart = React.lazy(() => import("./charts/PowerChart"));
const PhaseCurrentsChart = React.lazy(() =>
  import("./charts/PhaseCurrentsChart")
);
const PhaseVoltagesChart = React.lazy(() =>
  import("./charts/PhaseVoltagesChart")
);
const ThroughputChart = React.lazy(() =>
  import("./charts/ThroughputChart")
);

function ChartSection({ records }) {
  const [activeTab, setActiveTab] = useState("power"); // "power" | "currents" | "voltages" | "throughput"

  // Main power chart data
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    return records.map((r) => ({
      time: r.timestamp
        ? new Date(r.timestamp).toLocaleTimeString([], { hour12: false })
        : "",
      kw: typeof r.kw === "number" ? r.kw : null,
    }));
  }, [records]);

  // Phase current mini-chart data
  const currentsData = useMemo(() => {
    if (!records || records.length === 0) return [];

    return records.map((r) => ({
      time: r.timestamp
        ? new Date(r.timestamp).toLocaleTimeString([], { hour12: false })
        : "",
      ir: r.ir != null ? Number(r.ir) : null,
      iy: r.iy != null ? Number(r.iy) : null,
      ib: r.ib != null ? Number(r.ib) : null,
    }));
  }, [records]);

  // Phase voltage mini-chart data
  const voltagesData = useMemo(() => {
    if (!records || records.length === 0) return [];

    return records.map((r) => ({
      time: r.timestamp
        ? new Date(r.timestamp).toLocaleTimeString([], { hour12: false })
        : "",
      vr: r.vr != null ? Number(r.vr) : null,
      vy: r.vy != null ? Number(r.vy) : null,
      vb: r.vb != null ? Number(r.vb) : null,
    }));
  }, [records]);

  // Throughput sparkline data (rolling ~60s units/min)
  const throughputData = useMemo(() => {
    if (!records || records.length === 0) return [];

    const result = [];
    const n = records.length;

    for (let i = 0; i < n; i++) {
      const r = records[i];
      const timeLabel = r.timestamp
        ? new Date(r.timestamp).toLocaleTimeString([], { hour12: false })
        : "";

      const currentCount =
        r.count_total != null ? Number(r.count_total) : null;

      if (currentCount == null || Number.isNaN(currentCount)) {
        result.push({ time: timeLabel, rate: null });
        continue;
      }

      const windowSize = 60;
      const startIndex = Math.max(0, i - (windowSize - 1));
      const startRec = records[startIndex];
      const startCount =
        startRec && startRec.count_total != null
          ? Number(startRec.count_total)
          : null;

      if (startCount == null || Number.isNaN(startCount)) {
        result.push({ time: timeLabel, rate: null });
        continue;
      }

      const delta = currentCount - startCount;
      const windowSeconds = i - startIndex + 1;

      const unitsPerMin =
        windowSeconds > 0 ? (delta * 60) / windowSeconds : null;

      result.push({
        time: timeLabel,
        rate: unitsPerMin,
      });
    }

    return result;
  }, [records]);

  return (
    <div>
      {/* Tabs */}
      <div className="chart-tabs">
        <button
          className={`chart-tab ${activeTab === "power" ? "active" : ""}`}
          onClick={() => setActiveTab("power")}
        >
          Power
        </button>
        <button
          className={`chart-tab ${activeTab === "currents" ? "active" : ""}`}
          onClick={() => setActiveTab("currents")}
        >
          Phase Currents
        </button>
        <button
          className={`chart-tab ${activeTab === "voltages" ? "active" : ""}`}
          onClick={() => setActiveTab("voltages")}
        >
          Phase Voltages
        </button>
        <button
          className={`chart-tab ${
            activeTab === "throughput" ? "active" : ""
          }`}
          onClick={() => setActiveTab("throughput")}
        >
          Throughput
        </button>
      </div>

      {/* Only the active chart is mounted & loaded */}
      <Suspense
        fallback={
          <section className="card">
            <p>Loading chart…</p>
          </section>
        }
      >
        {activeTab === "power" && <PowerChart data={chartData} />}
        {activeTab === "currents" && (
          <PhaseCurrentsChart data={currentsData} />
        )}
        {activeTab === "voltages" && (
          <PhaseVoltagesChart data={voltagesData} />
        )}
        {activeTab === "throughput" && (
          <ThroughputChart data={throughputData} />
        )}
      </Suspense>
    </div>
  );
}

export default ChartSection;
