// src/components/ChartSection.js
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function ChartSection({ records }) {
  // Prepare data for the chart: time (HH:MM:SS) and kW
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    return records.map((r) => ({
      // Show only time part for x-axis
      time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour12: false }) : "",
      kw: typeof r.kw === "number" ? r.kw : null,
      state: r.state,
    }));
  }, [records]);

  

  return (
    <section className="card">
      <h2>Power vs Time</h2>
      <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 0 }}>
        Live kW trend from the device stream.
      </p>

      {chartData.length === 0 ? (
        <p>No data yet… waiting for stream.</p>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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

export default ChartSection;
