// src/components/charts/ThroughputChart.js
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
  return (
    <section className="card">
      <h2>Throughput (units/min · rolling 60s)</h2>
      <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 0 }}>
        Rolling 60-second production rate, derived from count_total.
      </p>

      {(!data || data.length === 0) ? (
        <p>No data yet… waiting for stream.</p>
      ) : (
        <div style={{ width: "100%", height: 140 }}>
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
