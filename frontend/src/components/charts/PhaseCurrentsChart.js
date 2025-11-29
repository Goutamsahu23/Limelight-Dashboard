import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function PhaseCurrentsChart({ data }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const headingId = "phase-currents-heading";
  const descId = "phase-currents-description";
  const summaryId = "phase-currents-summary";


  let latestSummary = "No current data available yet.";
  if (hasData) {
    const latest = data[data.length - 1];
    const { ir, iy, ib, time } = latest || {};
    latestSummary = `Latest readings at ${time ?? "latest time"}: ir ${ir ?? "N/A"} A, iy ${iy ?? "N/A"} A, ib ${ib ?? "N/A"} A.`;
  }

  return (
    <section
      className="card"
      aria-labelledby={headingId}
      aria-describedby={`${descId} ${summaryId}`}
    >
      <h2 id={headingId}>Phase Currents (ir / iy / ib)</h2>

      <p
        id={descId}
        style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 0 }}
      >
        Mini trend chart for phase currents, synced with the current time window.
      </p>


      <p
        id={summaryId}
        style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 4 }}
      >
        {latestSummary}
      </p>

      {!hasData ? (
        // Live region so screen readers announce when data starts coming in
        <p aria-live="polite" role="status">
          No data yet… waiting for stream.
        </p>
      ) : (
        <div
          style={{ width: "100%", height: 160 }}

          aria-hidden="true"
        >
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "#6b7280" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#6b7280" }}
                width={40}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1f2937",
                  fontSize: 11,
                }}
                labelStyle={{ color: "#e5e7eb" }}
              />
              <Line
                type="monotone"
                dataKey="ir"
                stroke="#22c55e"
                strokeWidth={1.4}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="iy"
                stroke="#f97316"
                strokeWidth={1.4}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="ib"
                stroke="#38bdf8"
                strokeWidth={1.4}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default React.memo(PhaseCurrentsChart);
