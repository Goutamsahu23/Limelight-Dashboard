import React from "react";
import { computeInsights } from "../utils/insights";

const visuallyHidden = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function InsightsSection({ records }) {
  const insights = computeInsights(records);

  const headingId = "insights-heading";
  const descId = "insights-description";
  const summaryId = "insights-summary";

  const hasInsights = Array.isArray(insights) && insights.length > 0;
  const warningCount = hasInsights
    ? insights.filter((i) => i.severity === "warning").length
    : 0;

  const summaryText = hasInsights
    ? `There are ${insights.length} insights in this window, including ${warningCount} warning${
        warningCount === 1 ? "" : "s"
      }.`
    : "No insights yet in the current window.";

  return (
    <section
      className="card"
      aria-labelledby={headingId}
      aria-describedby={`${descId} ${summaryId}`}
    >
      <h2 id={headingId}>Insights</h2>

      <p
        id={descId}
        style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 0 }}
      >
        Automatic observations based on the current time window.
      </p>

      <p
        id={summaryId}
        style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 4 }}
      >
        {summaryText}
      </p>

      {(!insights || insights.length === 0) && (
        <p
          style={{ fontSize: "0.85rem", color: "#9ca3af" }}
          aria-live="polite"
          role="status"
        >
          Not enough data in the selected window yet to derive insights.
        </p>
      )}

      {hasInsights && (
        <ul className="insights-list" aria-live="polite">
          {insights.map((insight) => (
            <li key={insight.id} className="insight-item">
              <div className="insight-header">
                <span
                  className={
                    insight.severity === "warning"
                      ? "insight-dot warning"
                      : "insight-dot info"
                  }
                  aria-hidden="true"
                />
                <span className="insight-title">
                  {insight.title}
                  <span style={visuallyHidden}>
                    {insight.severity === "warning" ? " (Warning)" : " (Info)"}
                  </span>
                </span>
              </div>

              <div className="insight-description">
                {insight.description}
              </div>

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
