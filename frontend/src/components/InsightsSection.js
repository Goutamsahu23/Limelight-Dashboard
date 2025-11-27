// src/components/InsightsSection.js
import React from "react";
import { computeInsights } from "../utils/insights";

function InsightsSection({ records }) {
  const insights = computeInsights(records);

  return (
    <section className="card">
      <h2>Insights</h2>
      <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 0 }}>
        Automatic observations based on the current time window.
      </p>

      {(!insights || insights.length === 0) && (
        <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
          Not enough data in the selected window yet to derive insights.
        </p>
      )}

      {insights && insights.length > 0 && (
        <ul className="insights-list">
          {insights.map((insight) => (
            <li key={insight.id} className="insight-item">
              <div className="insight-header">
                <span
                  className={
                    insight.severity === "warning"
                      ? "insight-dot warning"
                      : "insight-dot info"
                  }
                />
                <span className="insight-title">{insight.title}</span>
              </div>
              <div className="insight-description">{insight.description}</div>
              {insight.details && (
                <div className="insight-details">{insight.details}</div>
              )}
              {insight.timeRange && (
                <div className="insight-time">{insight.timeRange}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default InsightsSection;
