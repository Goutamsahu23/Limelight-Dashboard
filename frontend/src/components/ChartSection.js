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

const TAB_CONFIG = [
  { id: "power", label: "Power", panelId: "chart-panel-power" },
  { id: "currents", label: "Phase Currents", panelId: "chart-panel-currents" },
  { id: "voltages", label: "Phase Voltages", panelId: "chart-panel-voltages" },
  { id: "throughput", label: "Throughput", panelId: "chart-panel-throughput" },
];

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

  const handleTabClick = (id) => {
    setActiveTab(id);
  };

  const handleTabKeyDown = (event) => {
    const key = event.key;
    const currentIndex = TAB_CONFIG.findIndex((t) => t.id === activeTab);

    if (currentIndex === -1) return;

    if (key === "ArrowRight" || key === "ArrowLeft") {
      event.preventDefault();
      const direction = key === "ArrowRight" ? 1 : -1;
      const newIndex =
        (currentIndex + direction + TAB_CONFIG.length) % TAB_CONFIG.length;
      const newTab = TAB_CONFIG[newIndex].id;
      setActiveTab(newTab);
      const btn = document.getElementById(`tab-${newTab}`);
      if (btn) btn.focus();
    } else if (key === "Home") {
      event.preventDefault();
      const firstTab = TAB_CONFIG[0].id;
      setActiveTab(firstTab);
      const btn = document.getElementById(`tab-${firstTab}`);
      if (btn) btn.focus();
    } else if (key === "End") {
      event.preventDefault();
      const lastTab = TAB_CONFIG[TAB_CONFIG.length - 1].id;
      setActiveTab(lastTab);
      const btn = document.getElementById(`tab-${lastTab}`);
      if (btn) btn.focus();
    }
  };

  const activeTabConfig = TAB_CONFIG.find((t) => t.id === activeTab);

  return (
    <div aria-label="Device charts" role="region">
      {/* Tabs */}
      <div
        className="chart-tabs"
        role="tablist"
        aria-label="Select chart type"
        onKeyDown={handleTabKeyDown}
      >
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`chart-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleTabClick(tab.id)}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            aria-controls={tab.panelId}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Only the active chart is mounted & loaded, wrapped in a tabpanel */}
      <div
        role="tabpanel"
        id={activeTabConfig?.panelId}
        aria-labelledby={activeTabConfig && `tab-${activeTabConfig.id}`}
      >
        <Suspense
          fallback={
            <section className="card">
              <p aria-live="polite" role="status">
                Loading chart…
              </p>
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
    </div>
  );
}

export default ChartSection;
