import assert from "node:assert/strict";
import test from "node:test";
import { readAttendanceLectures } from "../packages/core/attendance-details.mjs";
import { calculateStreaks } from "../packages/core/attendance.mjs";
import { getWeeklyAttendance, getAttendanceTrend } from "../packages/core/attendance-trends.mjs";
import { summarizeAttendance } from "../packages/core/attendance-statistics.mjs";
import { countTopicWords } from "../packages/core/attendance-topics.mjs";

function lecturePanel(entries) {
  const headers = [{ querySelector: () => null }, ...entries.map(({ date, time }) => ({
    textContent: `${date} ${time ?? ""} Lecture`,
    querySelector: (selector) => selector === ".label-primary"
      ? { textContent: date }
      : selector === "b" ? { textContent: "Lecture" } : null,
  }))];
  const cells = entries.map(({ status }) => ({
    querySelector: (selector) =>
      (status === "P" && selector === ".label-success") ||
      (status === "A" && selector === ".label-danger") ? {} : null,
  }));
  const table = {
    querySelectorAll: (selector) => ({
      "thead tr th": headers,
      "tbody tr:first-child td": cells,
      "tbody tr:nth-child(2) td": entries.map(({ topic = "" }) => ({ textContent: topic })),
    })[selector],
  };
  return { querySelector: () => table };
}

test("word cloud ranks recorded topic words and filters filler and missing topics", () => {
  const lectures = readAttendanceLectures(lecturePanel([
    { date: "05-Jan-2026", status: "P", topic: "Graphs, and TREES" },
    { date: "12-Jan-2026", status: "A", topic: "Graphs in C++ and C#" },
    { date: "19-Jan-2026", status: "?", topic: "Not available" },
    { date: "26-Jan-2026", status: "P", topic: "—" },
    { date: "02-Feb-2026", status: "P", topic: "GRAPHs and café (2026)" },
  ]));
  assert.deepEqual(countTopicWords(lectures), [
    ["graphs", 3], ["c#", 1], ["c++", 1], ["café", 1], ["trees", 1],
  ]);
  assert.deepEqual(countTopicWords([{ topic: "N/A" }, { topic: "and the" }, { topic: "" }]), []);
});

test("the shared lecture reader preserves session times for calendar streaks", () => {
  const lectures = readAttendanceLectures(lecturePanel([
    { date: "19-Jan-2026", time: "01:00 PM", status: "A" },
    { date: "19-Jan-2026", time: "09:00 am", status: "P" },
    { date: "20-Jan-2026", status: "P" },
  ]));
  assert.deepEqual(lectures.map(({ startTime }) => startTime), [780, 540, null]);
  assert.deepEqual(calculateStreaks([lectures.slice(0, 2), lectures.slice(2)]), {
    current: 1, longest: 1, longestClasses: [lectures[2]],
  });
  const weeks = getWeeklyAttendance(lectures);
  assert.equal(weeks[0].week, 2924);
  assert.ok(Math.abs(weeks[0].percentage - 66.6666666667) < 1e-9);
});

test("weekly charts exclude unmarked and invalid dates while retaining recorded zeroes", () => {
  const lectures = readAttendanceLectures(lecturePanel([
    { date: "05-Jan-2026", status: "A" },
    { date: "12-Jan-2026", status: "P" },
    { date: "19-Jan-2026", status: "P" },
    { date: "26-Jan-2026", status: "?" },
    { date: "31-Feb-2026", status: "P" },
  ]));
  const weeks = getWeeklyAttendance(lectures);
  assert.deepEqual(weeks.map(({ percentage }) => percentage), [0, 100, 100]);
  assert.equal(getAttendanceTrend(weeks).direction, "rising");
  assert.equal(getAttendanceTrend(weeks.slice(0, 2)), null);
});

test("the summary box plot keeps outliers separate from its whiskers", () => {
  const values = [0, 75, 75, 75, 75];
  const stats = summarizeAttendance(values);
  assert.deepEqual([stats.min, stats.q1, stats.median, stats.q3, stats.max], [0, 75, 75, 75, 75]);
  assert.equal(stats.standardDeviation, 30);
  assert.deepEqual(stats.boxPlot, { lowerWhisker: 75, upperWhisker: 75, outliers: [0] });
  assert.deepEqual(values, [0, 75, 75, 75, 75]);
});
