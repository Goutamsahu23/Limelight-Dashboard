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

function ThroughputChart({ data }) {
  const hasData = Array.isArray(data) && data.length > 0;

  const headingId = "throughput-chart-heading";
  const descId = "throughput-chart-description";
  const summaryId = "throughput-chart-summary";

  // Text summary for screen readers / non-visual users
  let latestSummary = "No throughput data available yet.";
  if (hasData) {
    const latest = data[data.length - 1];
    const { rate, time } = latest || {};
    latestSummary = `Latest throughput reading at ${
      time ?? "latest time"
    }: ${rate != null ? `${rate.toFixed(2)} units per minute` : "N/A"}.`;
  }

  return (
    <section
      className="card"
      aria-labelledby={headingId}
      aria-describedby={`${descId} ${summaryId}`}
    >
      <h2 id={headingId}>Throughput (units/min · rolling 60s)</h2>

      <p
        id={descId}
        style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 0 }}
      >
        Rolling 60-second production rate, derived from count_total.
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
          style={{ width: "100%", height: 140 }}
          aria-hidden="true" // hide chart from screen readers
        >
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#111827" />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "#6b7280" }}
                interval="preserveStartEnd"
              />

              <YAxis
                tick={{ fontSize: 9, fill: "#6b7280" }}
                width={50}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1f2937",
                  fontSize: 11,
                }}
                labelStyle={{ color: "#e5e7eb" }}
                formatter={(value) =>
                  value != null ? `${value.toFixed(2)} units/min` : "-"
                }
              />

              <Line
                type="monotone"
                dataKey="rate"
                stroke="#22c55e"
                strokeWidth={1.6}
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

export default React.memo(ThroughputChart);
