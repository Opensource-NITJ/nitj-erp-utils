const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const FIRST_MONDAY = Date.UTC(1970, 0, 5);
const MIN_TREND_WEEKS = 3;
// Treat movement under one percentage point per week as stable.
const STABLE_SLOPE = 1;

export function getAttendanceWeekStart(week) {
  return new Date(FIRST_MONDAY + week * WEEK_MS);
}

export function getWeeklyAttendance(lectures) {
  const weeks = new Map();

  for (const { date, status } of lectures) {
    if (status !== "P" && status !== "A") continue;

    const week = Math.floor((date.getTime() - FIRST_MONDAY) / WEEK_MS);
    const totals = weeks.get(week) ?? { week, present: 0, marked: 0 };
    totals.marked++;
    if (status === "P") totals.present++;
    weeks.set(week, totals);
  }

  return [...weeks.values()]
    .sort((a, b) => a.week - b.week)
    .map(({ week, present, marked }) => ({
      week,
      percentage: (present / marked) * 100,
    }));
}

export function getAttendanceTrend(weeks) {
  if (weeks.length < MIN_TREND_WEEKS) return null;

  const firstWeek = weeks[0].week;
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumXY = 0;

  for (const { week, percentage } of weeks) {
    const elapsed = week - firstWeek;
    sumX += elapsed;
    sumY += percentage;
    sumXX += elapsed ** 2;
    sumXY += elapsed * percentage;
  }

  const count = weeks.length;
  const slope = (count * sumXY - sumX * sumY) / (count * sumXX - sumX ** 2);
  const intercept = (sumY - slope * sumX) / count;
  const direction = Math.abs(slope) < STABLE_SLOPE
    ? "stable"
    : slope > 0 ? "rising" : "falling";

  return { slope, intercept, direction };
}
