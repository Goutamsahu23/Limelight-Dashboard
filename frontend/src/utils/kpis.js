// Helper: safely parse a timestamp string to number (ms)
function toMs(ts) {
  return ts ? Date.parse(ts) : null;
}

// Compute uptime/idle/off percent (very simple: counts of states)
function computeStatePercent(records) {
  if (!records || records.length === 0) {
    return { runPct: 0, idlePct: 0, offPct: 0 };
  }

  let run = 0;
  let idle = 0;
  let off = 0;

  for (const r of records) {
    if (r.state === "RUN") run += 1;
    else if (r.state === "IDLE") idle += 1;
    else if (r.state === "OFF") off += 1;
  }

  const total = run + idle + off;
  if (total === 0) {
    return { runPct: 0, idlePct: 0, offPct: 0 };
  }

  return {
    runPct: (run / total) * 100,
    idlePct: (idle / total) * 100,
    offPct: (off / total) * 100,
  };
}

// Average kW
function computeAverageKw(records) {
  if (!records || records.length === 0) return 0;
  let sum = 0;
  let count = 0;
  for (const r of records) {
    if (typeof r.kw === "number") {
      sum += r.kw;
      count += 1;
    }
  }
  if (count === 0) return 0;
  return sum / count;
}

// Energy (kWh) from kwh_total = max - min
function computeEnergyKwh(records) {
  if (!records || records.length === 0) return 0;
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (const r of records) {
    if (typeof r.kwh_total === "number") {
      if (r.kwh_total < minVal) minVal = r.kwh_total;
      if (r.kwh_total > maxVal) maxVal = r.kwh_total;
    }
  }
  if (!isFinite(minVal) || !isFinite(maxVal) || maxVal < minVal) return 0;
  return maxVal - minVal;
}

// Average power factor (ignore OFF)
function computeAveragePf(records) {
  if (!records || records.length === 0) return 0;
  let sum = 0;
  let count = 0;
  for (const r of records) {
    if (r.state !== "OFF" && typeof r.pf === "number") {
      sum += r.pf;
      count += 1;
    }
  }
  if (count === 0) return 0;
  return sum / count;
}

// Throughput units/min using count_total difference over time
function computeThroughput(records) {
  if (!records || records.length < 2) return 0;

  const first = records[0];
  const last = records[records.length - 1];

  if (typeof first.count_total !== "number" || typeof last.count_total !== "number") {
    return 0;
  }

  const startMs = toMs(first.timestamp);
  const endMs = toMs(last.timestamp);
  if (startMs == null || endMs == null || endMs <= startMs) {
    return 0;
  }

  const minutes = (endMs - startMs) / 60000; // ms to minutes
  if (minutes === 0) return 0;

  const unitsProduced = last.count_total - first.count_total;
  return unitsProduced / minutes;
}

// Average phase imbalance %
// For each sample: ((max(Ir, Iy, Ib) - min(...)) / avg(...) ) * 100
function computePhaseImbalance(records) {
  if (!records || records.length === 0) return 0;

  let sumImb = 0;
  let count = 0;

  for (const r of records) {
    const ir = Number(r.ir);
    const iy = Number(r.iy);
    const ib = Number(r.ib);

    if (!isFinite(ir) || !isFinite(iy) || !isFinite(ib)) continue;

    const maxI = Math.max(ir, iy, ib);
    const minI = Math.min(ir, iy, ib);
    const avgI = (ir + iy + ib) / 3;

    if (avgI === 0) continue;

    const imb = ((maxI - minI) / avgI) * 100;
    sumImb += imb;
    count += 1;
  }

  if (count === 0) return 0;
  return sumImb / count;
}

// Main function to compute all KPIs at once
export function computeKpis(records) {
  const { runPct, idlePct, offPct } = computeStatePercent(records);
  const avgKw = computeAverageKw(records);
  const energyKwh = computeEnergyKwh(records);
  const avgPf = computeAveragePf(records);
  const throughput = computeThroughput(records);
  const phaseImbalance = computePhaseImbalance(records);

  return {
    runPct,
    idlePct,
    offPct,
    avgKw,
    energyKwh,
    avgPf,
    throughput,
    phaseImbalance,
  };
}
