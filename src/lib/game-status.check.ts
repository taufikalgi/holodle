/**
 * Runnable self-check for the pure game logic (Phase 5 verification).
 * Not imported by the app, never bundled. Run:
 *   ./node_modules/.bin/tsc src/lib/game-status.check.ts --outDir /tmp/opencode/check \
 *     --module nodenext --target es2022 --moduleResolution nodenext --skipLibCheck \
 *   && node /tmp/opencode/check/src/lib/game-status.check.js
 */
import assert from "node:assert/strict";
import {
  applyClassicGuess,
  deriveAvatarStatus,
  deriveGameStatus,
  isStoredClassicGuess,
} from "./game-status";
import { compareTalents, getTalentOfTheDay, type Talent } from "./talents";
import { computeDailyStreakOnGameOver, shouldResetDailyStreakForMissedDay } from "./daily-streak";

const base: Talent = {
  id: "a",
  name: "Alpha",
  branch: "JP",
  debutYear: 2020,
  loreArchetype: "Animal",
  height: 160,
  birthMonth: "March",
  image: "",
  avatarUrl: "",
  altNames: [],
  photoUrl: "",
};
const other: Talent = {
  ...base,
  id: "b",
  name: "Beta",
  branch: "EN",
  debutYear: 2022,
  birthMonth: "June",
};

// Status derivation: loading > error > empty > outcome > playing
assert.equal(
  deriveGameStatus({ loading: true, error: "x", empty: true, gameOver: true, won: true }),
  "loading"
);
assert.equal(
  deriveGameStatus({ loading: false, error: "x", empty: false, gameOver: false, won: false }),
  "error"
);
assert.equal(
  deriveGameStatus({ loading: false, error: "", empty: true, gameOver: false, won: false }),
  "empty"
);
assert.equal(
  deriveGameStatus({ loading: false, error: "", empty: false, gameOver: true, won: true }),
  "won"
);
assert.equal(
  deriveGameStatus({ loading: false, error: "", empty: false, gameOver: true, won: false }),
  "lost"
);
assert.equal(
  deriveGameStatus({ loading: false, error: "", empty: false, gameOver: false, won: false }),
  "playing"
);

// Avatar round mapping
assert.equal(deriveAvatarStatus("loading", false, false), "loading");
assert.equal(deriveAvatarStatus("error", false, false), "error");
assert.equal(deriveAvatarStatus("noValid", false, false), "empty");
assert.equal(deriveAvatarStatus("ready", true, true), "won");
assert.equal(deriveAvatarStatus("ready", true, false), "lost");
assert.equal(deriveAvatarStatus("ready", false, false), "playing");

// Classic transition: guess, duplicate → null, win ends game
const first = applyClassicGuess([], other, base, 6);
assert.ok(first && !first.gameOver && !first.won && first.guesses.length === 1);
assert.equal(applyClassicGuess(first.guesses, other, base, 6), null);
const won = applyClassicGuess([], base, base, 6);
assert.ok(won?.gameOver && won.won);
// 6th wrong guess ends game as loss
let g = applyClassicGuess([], other, base, 1);
assert.ok(g?.gameOver && !g.won);

// compareTalents never throws on unknown month
const mystery = { ...other, birthMonth: "" };
assert.doesNotThrow(() => compareTalents(mystery, base));
assert.equal(compareTalents(mystery, base).birthMonth, "wrong");

// Talent of the day is deterministic per date, null on empty pool
const day = new Date(2026, 8, 8);
assert.equal(getTalentOfTheDay([base, other], day), getTalentOfTheDay([base, other], day));
assert.equal(getTalentOfTheDay([], day), null);

// Streak math
const fresh = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 };
assert.equal(computeDailyStreakOnGameOver(fresh, "2026-09-08", true).streak, 1);
assert.equal(
  computeDailyStreakOnGameOver({ ...fresh, streak: 2, lastPlayedDate: "2026-09-07" }, "2026-09-08", true).streak,
  3
);
assert.equal(
  computeDailyStreakOnGameOver({ ...fresh, streak: 5, lastPlayedDate: "2026-09-07" }, "2026-09-08", false).streak,
  0
);
assert.equal(shouldResetDailyStreakForMissedDay("2026-09-06", "2026-09-08", 3), true);
assert.equal(shouldResetDailyStreakForMissedDay("2026-09-07", "2026-09-08", 3), false);
assert.equal(shouldResetDailyStreakForMissedDay("2026-09-07", "2026-09-08", 0), false);
assert.equal(shouldResetDailyStreakForMissedDay(undefined, "2026-09-08", 3), false);

// Stored-guess validation
assert.equal(isStoredClassicGuess({ talent: { id: "a", name: "A" }, result: {} }), true);
assert.equal(isStoredClassicGuess({ talent: { name: "A" }, result: {} }), false);
assert.equal(isStoredClassicGuess(null), false);

console.log("game-status.check: all assertions passed");
