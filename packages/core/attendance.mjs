const MAX_CLASSES = Math.floor(Number.MAX_SAFE_INTEGER / 4);

export const TARGET_PERCENT = 75;

function isClassCount(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= MAX_CLASSES;
}

function hasValidTotals(attended, delivered) {
  return isClassCount(attended) && isClassCount(delivered) && attended <= delivered;
}

function getTargetUnits(percent) {
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) return null;
  const units = Math.round(percent * 100);
  return units > 0 && units / 100 === percent ? units : null;
}

export function calculateDeficit(attended, delivered, targetPercent = TARGET_PERCENT) {
  const units = getTargetUnits(targetPercent);
  if (!hasValidTotals(attended, delivered) || units === null) return null;

  // Integer hundredths keep target boundaries exact, including fractional percentages.
  const target = BigInt(units);
  const margin = 10000n * BigInt(attended) - target * BigInt(delivered);
  if (margin < 0n && target === 10000n) return null;
  const needed = 10000n - target;
  const value = Number(margin < 0n ? -((-margin + needed - 1n) / needed) : margin / target);
  return Number.isSafeInteger(value) ? value : null;
}

export function calculateScenario(attended, delivered, futureAttended, futureMissed, targetPercent = TARGET_PERCENT) {
  if (
    !hasValidTotals(attended, delivered) ||
    !isClassCount(futureAttended) ||
    !isClassCount(futureMissed) ||
    getTargetUnits(targetPercent) === null
  ) return null;

  const projectedAttended = attended + futureAttended;
  const projectedDelivered = delivered + futureAttended + futureMissed;
  if (!hasValidTotals(projectedAttended, projectedDelivered)) return null;
  const deficit = calculateDeficit(projectedAttended, projectedDelivered, targetPercent);
  if (deficit === null && targetPercent !== 100) return null;

  return {
    percentage: projectedDelivered ? (projectedAttended / projectedDelivered) * 100 : null,
    deficit,
  };
}

export function calculateAttendanceWaffle(subjectTotals) {
  if (!subjectTotals.length) return null;

  let attended = 0;
  let delivered = 0;
  for (const totals of subjectTotals) {
    if (!totals || !hasValidTotals(totals.attended, totals.delivered)) return null;
    attended += totals.attended;
    delivered += totals.delivered;
    if (!isClassCount(delivered)) return null;
  }

  if (!delivered) return { attended, delivered, percentage: null, attendedTiles: null };

  // Round the label and tiles independently from the original ratio.
  const total = BigInt(delivered);
  const twiceAttended = 2n * BigInt(attended);
  const roundShare = (scale) => Number((twiceAttended * scale + total) / (2n * total));
  return {
    attended,
    delivered,
    percentage: roundShare(10000n) / 100,
    attendedTiles: roundShare(100n),
  };
}

export function calculateStreaks(classDays) {
  let current = 0;
  let longest = null;
  let latestStatus;
  let currentClasses = [];
  let longestClasses = [];

  for (const day of classDays) {
    // shortcut: use ERP column order for incomplete start times, revisit if explicit ordering becomes available.
    const ordered = day.every((entry) => entry.startTime !== null)
      ? [...day].sort((a, b) => a.startTime - b.startTime)
      : day;

    for (const entry of ordered) {
      const { status } = entry;
      current = status === "P" ? current + 1 : 0;
      if (status === "P") {
        currentClasses.push(entry);
        if (current >= (longest ?? 0)) longestClasses = currentClasses;
      } else {
        currentClasses = [];
      }
      if (status === "P" || status === "A") {
        longest = Math.max(longest ?? 0, current);
      }
      latestStatus = status;
    }
  }

  return {
    current: latestStatus === "P" || latestStatus === "A" ? current : null,
    longest,
    longestClasses,
  };
}
