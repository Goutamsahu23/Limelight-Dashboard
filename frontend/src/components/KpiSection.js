// src/components/KpiSection.js
import React from "react";
import { computeKpis } from "../utils/kpis";

function formatNumber(value, decimals = 2) {
  if (value == null || isNaN(value)) return "-";
  return value.toFixed(decimals);
}

function KpiSection({ records }) {
  const {
    runPct,
    idlePct,
    offPct,
    avgKw,
    energyKwh,
    avgPf,
    throughput,
    phaseImbalance,
  } = computeKpis(records);

  return (
    <section className="card">
      <h2>Key Performance Indicators</h2>
      <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 0 }}>
        KPIs calculated over the current data in memory (we&apos;ll add a time window later).
      </p>

      <div className="kpi-grid">
        {/* Uptime */}
        <div className="kpi-card">
          <div className="kpi-label">Run / Idle / Off</div>
          <div className="kpi-value">
            {formatNumber(runPct, 1)}% / {formatNumber(idlePct, 1)}% / {formatNumber(offPct, 1)}%
          </div>
          <div className="kpi-subtext">State distribution</div>
        </div>

        {/* Average kW */}
        <div className="kpi-card">
          <div className="kpi-label">Average Power</div>
          <div className="kpi-value">
            {formatNumber(avgKw, 2)} <span className="kpi-unit">kW</span>
          </div>
          <div className="kpi-subtext">Mean active power</div>
        </div>

        {/* Energy kWh */}
        <div className="kpi-card">
          <div className="kpi-label">Energy</div>
          <div className="kpi-value">
            {formatNumber(energyKwh, 2)} <span className="kpi-unit">kWh</span>
          </div>
          <div className="kpi-subtext">ΔkWh over period</div>
        </div>

        {/* PF */}
        <div className="kpi-card">
          <div className="kpi-label">Power Factor</div>
          <div className="kpi-value">
            {formatNumber(avgPf, 3)}
          </div>
          <div className="kpi-subtext">Average PF (RUN+IDLE)</div>
        </div>

        {/* Throughput */}
        <div className="kpi-card">
          <div className="kpi-label">Throughput</div>
          <div className="kpi-value">
            {formatNumber(throughput, 2)} <span className="kpi-unit">units/min</span>
          </div>
          <div className="kpi-subtext">From count_total</div>
        </div>

        {/* Phase imbalance */}
        <div className="kpi-card">
          <div className="kpi-label">Phase Imbalance</div>
          <div className="kpi-value">
            {formatNumber(phaseImbalance, 1)} <span className="kpi-unit">%</span>
          </div>
          <div className="kpi-subtext">Avg current imbalance</div>
        </div>
      </div>
    </section>
  );
}

export default KpiSection;
