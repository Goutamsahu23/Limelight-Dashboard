// src/utils/insights.js
//
// FINAL INSIGHTS LOGIC (strict thresholds per spec +
// relaxed thresholds for short datasets)
//
// Strict thresholds from assignment:
// - Low PF: PF < 0.8 for >= 5 min
// - Phase imbalance: > 15% for >= 2 min
// - Peak 15-min demand: rolling 15-min avg kW
//
// Relaxed thresholds (allowed by spec: “allow shorter threshold and note it”):
// - Low PF (relaxed): PF < 0.90 for >= 2 min
// - Phase imbalance (relaxed): > 10% for >= 1 min

// Try to extract a readable timestamp from a record
function safeTime(r) {
  if (!r) return "(no data)";

  // Try common timestamp-like fields
  const raw =
    r.timestamp ||
    r.ts ||
    r.time ||
    r.device_time ||
    r.sample_time ||
    r.created_at ||
    null;

  if (!raw) return "(no timestamp)";

  // If already a string, just return it
  if (typeof raw === "string") return raw;

  // If numeric (epoch), try to format
  const n = Number(raw);
  if (!Number.isNaN(n)) {
    // Heuristic: >1e12 → ms, else seconds
    const d = n > 1e12 ? new Date(n) : new Date(n * 1000);
    return d.toISOString();
  }

  // Fallback
  return String(raw);
}

// ---------- Helpers ----------

// Phase imbalance for a single record, in %
function computeImbalanceForRecord(r) {
  const ir = Number(r.ir);
  const iy = Number(r.iy);
  const ib = Number(r.ib);
  if (!isFinite(ir) || !isFinite(iy) || !isFinite(ib)) return null;

  const maxI = Math.max(ir, iy, ib);
  const minI = Math.min(ir, iy, ib);
  const avgI = (ir + iy + ib) / 3;
  if (avgI === 0) return null;

  return ((maxI - minI) / avgI) * 100;
}

// Generic contiguous-window detector (count-based, 1 Hz)
function findContiguous(records, conditionFn, minMinutes) {
  const minSamples = Math.floor(minMinutes * 60); // 1 record per second
  if (records.length < minSamples) return null;

  let start = null;

  for (let i = 0; i < records.length; i++) {
    const ok = conditionFn(records[i]);
    if (ok) {
      if (start === null) start = i;
    } else {
      if (start !== null && i - start >= minSamples) {
        return { startIndex: start, endIndex: i - 1 };
      }
      start = null;
    }
  }

  // If we ended while still in a "good" run
  if (start !== null && records.length - start >= minSamples) {
    return { startIndex: start, endIndex: records.length - 1 };
  }

  return null;
}

// Rolling peak demand over N minutes (count-based)
function detectPeakDemand(records, minutes = 15) {
  if (!records || records.length === 0) return null;

  const windowSamples = Math.min(records.length, minutes * 60);
  if (windowSamples === 0) return null;

  const kw = records.map((r) =>
    typeof r.kw === "number" ? r.kw : 0
  );

  let sum = 0;
  for (let i = 0; i < windowSamples; i++) sum += kw[i];

  let bestAvg = sum / windowSamples;
  let bestStart = 0;

  for (let end = windowSamples; end < kw.length; end++) {
    sum += kw[end];
    sum -= kw[end - windowSamples];
    const avg = sum / windowSamples;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestStart = end - windowSamples + 1;
    }
  }

  const bestEnd = bestStart + windowSamples - 1;

  return {
    avgKw: bestAvg,
    startTime: safeTime(records[bestStart]),
    endTime: safeTime(records[bestEnd]),
    minutes,
  };
}

// ---------- Main entry ----------

export function computeInsights(records) {
  const insights = [];
  if (!records || records.length === 0) return insights;

  // ---------------------------
  // 1) Low PF window
  // ---------------------------

  // Strict: PF < 0.8 for 5 min (RUN/IDLE only)
  let lowPf = findContiguous(
    records,
    (r) => typeof r.pf === "number" && r.pf < 0.8 && r.state !== "OFF",
    5
  );
  let pfMode = "strict";

  // Relaxed: PF < 0.90 for 2 min
  if (!lowPf) {
    lowPf = findContiguous(
      records,
      (r) => typeof r.pf === "number" && r.pf < 0.9 && r.state !== "OFF",
      2
    );
    if (lowPf) pfMode = "relaxed";
  }

  if (lowPf) {
    const { startIndex, endIndex } = lowPf;
    let sum = 0;
    let count = 0;

    for (let i = startIndex; i <= endIndex; i++) {
      const pf = records[i].pf;
      if (typeof pf === "number") {
        sum += pf;
        count++;
      }
    }

    const avgPf = count > 0 ? sum / count : null;
    const minutes = (endIndex - startIndex + 1) / 60;

    insights.push({
      id: "low-pf",
      title: "Low Power Factor",
      severity: pfMode === "strict" ? "warning" : "info",
      description:
        pfMode === "strict"
          ? "PF < 0.80 for ≥ 5 minutes detected in the current window."
          : "Relaxed rule: PF < 0.90 for ≥ 2 minutes (allowed for short datasets).",
      details: `Average PF in span: ${avgPf != null ? avgPf.toFixed(3) : "-"}`,
      timeRange: `${safeTime(records[startIndex])} → ${safeTime(records[endIndex])} (${minutes.toFixed(
        1
      )} min)`,
    });
  }

  // ---------------------------
  // 2) Phase imbalance window
  // ---------------------------

  // Strict: imbalance > 15% for 2 min
  let imb = findContiguous(
    records,
    (r) => {
      const v = computeImbalanceForRecord(r);
      return v !== null && v > 15;
    },
    2
  );
  let imbMode = "strict";

  // Relaxed: imbalance > 10% for 1 min
  if (!imb) {
    imb = findContiguous(
      records,
      (r) => {
        const v = computeImbalanceForRecord(r);
        return v !== null && v > 10;
      },
      1
    );
    if (imb) imbMode = "relaxed";
  }

  if (imb) {
    const { startIndex, endIndex } = imb;
    let sum = 0;
    let count = 0;

    for (let i = startIndex; i <= endIndex; i++) {
      const v = computeImbalanceForRecord(records[i]);
      if (v !== null) {
        sum += v;
        count++;
      }
    }

    const avgImb = count > 0 ? sum / count : null;
    const minutes = (endIndex - startIndex + 1) / 60;

    insights.push({
      id: "phase-imbalance",
      title: "Phase Imbalance Detected",
      severity: imbMode === "strict" ? "warning" : "info",
      description:
        imbMode === "strict"
          ? "Phase current imbalance > 15% for ≥ 2 minutes."
          : "Relaxed rule: imbalance > 10% for ≥ 1 minute (allowed for short datasets).",
      details: `Average imbalance: ${
        avgImb != null ? avgImb.toFixed(1) : "-"
      }%`,
      timeRange: `${safeTime(records[startIndex])} → ${safeTime(records[endIndex])} (${minutes.toFixed(
        1
      )} min)`,
    });
  }

  // ---------------------------
  // 3) Peak 15-min demand
  // ---------------------------

  const peak = detectPeakDemand(records, 15);
  if (peak) {
    insights.push({
      id: "peak-demand",
      title: "Peak 15-min Demand",
      severity: "info",
      description: "Highest rolling 15-minute average kW in the current window.",
      details: `Average kW: ${peak.avgKw.toFixed(2)}`,
      timeRange: `${peak.startTime} → ${peak.endTime}`,
    });
  }

  return insights;
}
