import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAttendanceWaffle,
  calculateDeficit,
  calculateScenario,
  calculateStreaks,
} from "../packages/core/attendance.mjs";

test("deficit keeps the existing signed badge values at and around 75%", () => {
  assert.equal(calculateDeficit(18, 22), 2);
  assert.equal(calculateDeficit(18, 23), 1);
  assert.equal(calculateDeficit(18, 24), 0);
  assert.equal(calculateDeficit(18, 25), -3);
  assert.equal(calculateDeficit(0, 1), -3);
  assert.equal(calculateDeficit(0, 0), 0);
});

test("what-if applies attended and missed classes to the selected totals", () => {
  assert.deepEqual(calculateScenario(18, 24, 3, 1), { percentage: 75, deficit: 0 });
  assert.deepEqual(calculateScenario(18, 24, 2, 0), { percentage: (20 / 26) * 100, deficit: 0 });
  assert.deepEqual(calculateScenario(18, 24, 0, 1), { percentage: 72, deficit: -3 });
  assert.deepEqual(calculateScenario(18, 25, 6, 0), { percentage: (24 / 31) * 100, deficit: 1 });
});

test("planner targets change the projection guidance without changing the 75% default", () => {
  assert.deepEqual(calculateScenario(18, 24, 0, 1, 72), { percentage: 72, deficit: 0 });
  assert.deepEqual(calculateScenario(18, 24, 0, 1), { percentage: 72, deficit: -3 });
  assert.equal(calculateDeficit(18, 25, 73), -1);
  assert.equal(calculateDeficit(18, 24, 75.5), -1);
  assert.equal(calculateDeficit(76, 100, 72), 5);
  assert.equal(calculateDeficit(0, 0, 72), 0);
});

test("a 100% planner target distinguishes perfect attendance from an unreachable target", () => {
  assert.deepEqual(calculateScenario(24, 24, 0, 0, 100), { percentage: 100, deficit: 0 });
  assert.deepEqual(calculateScenario(23, 24, 1, 0, 100), { percentage: 96, deficit: null });
});

test("planner targets reject invalid percentages and unsafe projected class counts", () => {
  for (const target of [0, 1e-10, -1, 100.01, 72.001, NaN, Infinity, "72"]) {
    assert.equal(calculateScenario(18, 24, 0, 0, target), null);
    assert.equal(calculateDeficit(18, 24, target), null);
  }
  assert.equal(calculateScenario(0, Math.floor(Number.MAX_SAFE_INTEGER / 4), 0, 0, 99.99), null);
});

test("zero delivered classes have no percentage until a class is counted", () => {
  assert.deepEqual(calculateScenario(0, 0, 0, 0), { percentage: null, deficit: 0 });
  assert.deepEqual(calculateScenario(0, 0, 1, 0), { percentage: 100, deficit: 0 });
  assert.deepEqual(calculateScenario(0, 0, 0, 1), { percentage: 0, deficit: -3 });
});

test("invalid counts are rejected before calculating a projection", () => {
  for (const count of [-1, 0.5, NaN, Infinity, "1", Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(calculateScenario(18, 24, count, 0), null);
    assert.equal(calculateScenario(18, 24, 0, count), null);
  }
  assert.equal(calculateDeficit(25, 24), null);
  assert.equal(calculateScenario(25, 24, 0, 2), null);
  assert.equal(calculateScenario(18, 24, 0, Math.floor(Number.MAX_SAFE_INTEGER / 4)), null);
});

test("deficit uses the exact target even when the percentage rounds to 75%", () => {
  const scenario = calculateScenario(18, 24, 300000, 100001);
  assert.equal(scenario.percentage.toFixed(2), "75.00");
  assert.equal(scenario.deficit, -3);
});

test("streaks count consecutive classes across days and reset on absences", () => {
  const classDays = [
    [{ status: "P", startTime: 540 }, { status: "P", startTime: 660 }],
    [{ status: "P", startTime: 540 }],
    [{ status: "A", startTime: 540 }],
    [{ status: "P", startTime: 540 }],
  ];
  const longestClasses = [...classDays[0], ...classDays[1]];
  assert.deepEqual(calculateStreaks(classDays), { current: 1, longest: 3, longestClasses });
  assert.deepEqual(calculateStreaks(classDays.slice(0, -1)), { current: 0, longest: 3, longestClasses });
});

test("streaks order same-day sessions by time without rearranging the calendar data", () => {
  const morning = { status: "P", startTime: 540 };
  const afternoon = { status: "A", startTime: 780 };
  const day = [afternoon, morning];
  assert.deepEqual(calculateStreaks([day]), { current: 0, longest: 1, longestClasses: [morning] });
  assert.deepEqual(day, [afternoon, morning]);
  assert.deepEqual(
    calculateStreaks([[afternoon, { status: "P", startTime: null }]]),
    { current: 1, longest: 1, longestClasses: [{ status: "P", startTime: null }] },
  );
});

test("unmarked classes interrupt confirmed streaks and hide the current count when latest", () => {
  const classDays = ["P", "P", "?", "P"].map((status) => [{ status, startTime: 540 }]);
  const longestClasses = [classDays[0][0], classDays[1][0]];
  assert.deepEqual(calculateStreaks(classDays), { current: 1, longest: 2, longestClasses });
  assert.deepEqual(calculateStreaks(classDays.slice(0, -1)), { current: null, longest: 2, longestClasses });
});

test("streaks distinguish unavailable history from a recorded zero", () => {
  assert.deepEqual(calculateStreaks([]), { current: null, longest: null, longestClasses: [] });
  assert.deepEqual(calculateStreaks([[{ status: "?", startTime: 540 }]]), { current: null, longest: null, longestClasses: [] });
  assert.deepEqual(calculateStreaks([[{ status: "A", startTime: 540 }]]), { current: 0, longest: 0, longestClasses: [] });
});

test("longest-streak classes select the latest tied run and exclude shorter runs", () => {
  const classes = ["P", "P", "A", "P", "?", "P", "P", "A"].map((status, id) => ({ id, status, startTime: 540 }));
  assert.deepEqual(calculateStreaks(classes.map((entry) => [entry])).longestClasses,
    [classes[5], classes[6]]);
  assert.deepEqual(calculateStreaks([]).longestClasses, []);
  assert.deepEqual(calculateStreaks([[{ status: "A", startTime: 540 }]]).longestClasses, []);
});

test("longest-streak classes follow session time and can cross a month boundary", () => {
  const morning = { date: new Date("2026-01-31T00:00:00Z"), status: "A", startTime: 540 };
  const afternoon = { date: morning.date, status: "P", startTime: 780 };
  const nextMonth = { date: new Date("2026-02-01T00:00:00Z"), status: "P", startTime: 540 };
  const unknown = { date: nextMonth.date, status: "?", startTime: 780 };
  assert.deepEqual(calculateStreaks([[afternoon, morning], [unknown, nextMonth]]).longestClasses,
    [afternoon, nextMonth]);
});

test("waffle uses the sum of class counts across subjects", () => {
  const totals = [{ attended: 1, delivered: 1 }, { attended: 2, delivered: 7 }];
  assert.deepEqual(calculateAttendanceWaffle(totals), {
    attended: 3, delivered: 8, percentage: 37.5, attendedTiles: 38,
  });
});

test("waffle rounds percentages and tiles independently from the original counts", () => {
  assert.deepEqual(calculateAttendanceWaffle([{ attended: 29, delivered: 200 }]), {
    attended: 29, delivered: 200, percentage: 14.5, attendedTiles: 15,
  });
  assert.deepEqual(calculateAttendanceWaffle([{ attended: 49499, delivered: 100000 }]), {
    attended: 49499, delivered: 100000, percentage: 49.5, attendedTiles: 49,
  });
});

test("waffle distinguishes zero classes from zero attendance and full attendance", () => {
  assert.deepEqual(calculateAttendanceWaffle([{ attended: 0, delivered: 0 }]), {
    attended: 0, delivered: 0, percentage: null, attendedTiles: null,
  });
  for (const attended of [0, 1]) {
    assert.deepEqual(calculateAttendanceWaffle([{ attended, delivered: 1 }]), {
      attended, delivered: 1, percentage: attended * 100, attendedTiles: attended * 100,
    });
  }
});

test("waffle reports missing or invalid totals instead of using a partial aggregate", () => {
  assert.equal(calculateAttendanceWaffle([]), null);
  const valid = { attended: 18, delivered: 24 };
  for (const incomplete of [null, { delivered: 5 }, { attended: 6, delivered: 5 }]) {
    assert.equal(calculateAttendanceWaffle([valid, incomplete]), null);
  }
});
