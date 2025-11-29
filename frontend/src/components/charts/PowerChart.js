
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

function PowerChart({ data }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const headingId = "power-chart-heading";
  const descId = "power-chart-description";
  const summaryId = "power-chart-summary";

  // Text summary for screen readers / non-visual users
  let latestSummary = "No power data available yet.";
  if (hasData) {
    const latest = data[data.length - 1];
    const { kw, time } = latest || {};
    latestSummary = `Latest power reading at ${
      time ?? "latest time"
    }: ${kw ?? "N/A"} kW.`;
  }

  return (
    <section
      className="card"
      aria-labelledby={headingId}
      aria-describedby={`${descId} ${summaryId}`}
    >
      <h2 id={headingId}>Power vs Time</h2>

      <p
        id={descId}
        style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 0 }}
      >
        Live kW trend from the device stream (windowed to 5/15/30 minutes).
      </p>

      <p
        id={summaryId}
        style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 4 }}
      >
        {latestSummary}
      </p>

      {!hasData ? (
        <p aria-live="polite" role="status">
          No data yet… waiting for stream.
        </p>
      ) : (
        <div
          style={{ width: "100%", height: 260 }}
          aria-hidden="power " 
        >
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                width={40}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1f2937",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#e5e7eb" }}
              />
              <Line
                type="monotone"
                dataKey="kw"
                stroke="#38bdf8"
                strokeWidth={2}
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

export default React.memo(PowerChart);
