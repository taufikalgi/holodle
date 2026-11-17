import assert from "node:assert/strict";
import {
  buildVisitorsPath,
  formatCompactNumber,
  formatVisitorDate,
  getChartMax,
  metricValue,
  parseVisitorsResponse,
  sessionsForPoint,
  type VisitorStatsPoint,
} from "./visitors-api";

const point: VisitorStatsPoint = {
  date: "2026-11-12",
  active_players: 12,
  new_players: 3,
  new_guests: 7,
  classic_sessions: 10,
  holosong_sessions: 4,
  holosong_quiz_sessions: 2,
  guesses: 55,
};

const fixture = {
  range_days: 7,
  totals: {
    active_players: 42,
    new_players: 8,
    new_guests: 20,
    classic_sessions: 30,
    holosong_sessions: 11,
    holosong_quiz_sessions: 6,
    guesses: 200,
  },
  series: [point],
  generated_at: "2026-11-12T00:00:00Z",
  privacy_note: "Counts are aggregate and server-side.",
};

assert.equal(buildVisitorsPath(7), "/api/v1/stats/visitors?days=7");
assert.equal(buildVisitorsPath(30), "/api/v1/stats/visitors?days=30");
assert.equal(buildVisitorsPath(0), "/api/v1/stats/visitors?days=1");
assert.equal(buildVisitorsPath(100), "/api/v1/stats/visitors?days=90");
assert.equal(buildVisitorsPath(7.9), "/api/v1/stats/visitors?days=7");

const parsed = parseVisitorsResponse(fixture);
assert.equal(parsed.series[0].active_players, 12);
assert.equal(parsed.totals.guesses, 200);

assert.throws(
  () =>
    parseVisitorsResponse({
      ...fixture,
      series: [{ ...point, active_players: "12" }],
    } as unknown),
  /invalid visitor stats payload/
);
assert.throws(
  () =>
    parseVisitorsResponse({
      ...fixture,
      totals: { ...fixture.totals, guesses: null },
    } as unknown),
  /invalid visitor stats payload/
);
assert.throws(
  () => parseVisitorsResponse({ ...fixture, series: undefined } as unknown),
  /invalid visitor stats payload/
);

assert.equal(sessionsForPoint(point), 16);
assert.equal(metricValue(point, "sessions"), 16);
assert.equal(metricValue(point, "active_players"), 12);
assert.equal(getChartMax([], "active_players"), 0);
assert.equal(getChartMax([point, { ...point, active_players: 20 }], "active_players"), 20);

assert.equal(formatVisitorDate("2026-11-12"), "Nov 12");
assert.equal(formatVisitorDate("nope"), "nope");
assert.equal(formatCompactNumber(0), "0");
assert.ok(formatCompactNumber(1200).includes("1.2"));

console.log("visitors-api.check: all assertions passed");
