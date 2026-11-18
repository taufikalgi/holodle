/**
 * Runnable self-check for Holosong Quiz pure helpers. Not imported by the app.
 * Run:
 *   ./node_modules/.bin/tsc src/lib/holosong-quiz.check.ts --outDir /tmp/opencode/quiz-check \
 *     --module nodenext --target es2022 --moduleResolution nodenext --skipLibCheck \
 *   && node /tmp/opencode/quiz-check/holosong-quiz.check.js
 */
import assert from "node:assert/strict";
import {
  buildHolosongQuizLeaderboardPath,
  HOLOSONG_QUIZ_CLIP_SECONDS,
  HOLOSONG_QUIZ_OPTION_COUNT,
  holosongQuizLeaderboardHasMore,
  isHolosongQuizCorrectAdvance,
  isHolosongQuizFinished,
  type HolosongQuizSession,
} from "./holosong-quiz-api";
import { buildHolosongQuizShareText } from "./share";

const session: HolosongQuizSession = {
  id: "quiz-1",
  mode: "daily",
  status: "ongoing",
  guesses_used: 0,
  round_number: 1,
  clip_seconds: 5,
  clip_start_ms: 7421,
  preview_url: "https://example.com/preview.m4a",
  options: [],
  board: [],
  rounds_played: 0,
  rounds_won: 0,
  current_streak: 0,
  longest_streak: 0,
  version: 1,
};

assert.equal(HOLOSONG_QUIZ_CLIP_SECONDS, 5);
assert.equal(HOLOSONG_QUIZ_OPTION_COUNT, 3);

assert.equal(isHolosongQuizFinished(null), false);
assert.equal(isHolosongQuizFinished(session), false);
assert.equal(isHolosongQuizFinished({ ...session, status: "won" }), true);
assert.equal(isHolosongQuizFinished({ ...session, status: "lost" }), true);

assert.equal(
  isHolosongQuizCorrectAdvance(
    "endless",
    { round_number: 1 },
    { round_number: 2, status: "ongoing" }
  ),
  true
);
assert.equal(
  isHolosongQuizCorrectAdvance(
    "daily",
    { round_number: 1 },
    { round_number: 2, status: "ongoing" }
  ),
  false
);
assert.equal(
  isHolosongQuizCorrectAdvance("endless", { round_number: 1 }, { round_number: 1, status: "lost" }),
  false
);

assert.equal(
  buildHolosongQuizLeaderboardPath(),
  "/api/v1/holosong/quiz/leaderboard?page=1&page_size=20"
);
assert.equal(
  buildHolosongQuizLeaderboardPath(2, 10),
  "/api/v1/holosong/quiz/leaderboard?page=2&page_size=10"
);
assert.equal(
  buildHolosongQuizLeaderboardPath(0, 500),
  "/api/v1/holosong/quiz/leaderboard?page=1&page_size=100"
);
assert.equal(
  buildHolosongQuizLeaderboardPath(-3, 0),
  "/api/v1/holosong/quiz/leaderboard?page=1&page_size=1"
);

assert.equal(holosongQuizLeaderboardHasMore({ page: 1, page_size: 20, total: 21 }), true);
assert.equal(holosongQuizLeaderboardHasMore({ page: 2, page_size: 20, total: 21 }), false);

// Share text: endless run with a mix of correct and wrong rounds.
assert.equal(
  buildHolosongQuizShareText({
    mode: "ENDLESS",
    guesses: [true, true, true, false, true, true],
    roundsWon: 5,
    roundsPlayed: 6,
    bestStreak: 3,
    url: "https://holodle.xyz/holosong/quiz/endless",
  }),
  [
    "HOLODLE HOLOSONG QUIZ — ENDLESS",
    "5/6 rounds · best streak 3 🔥",
    "",
    "🟩🟩🟩🟥🟩🟩",
    "",
    "https://holodle.xyz/holosong/quiz/endless",
  ].join("\n")
);

// Share text: a run that never got a correct answer omits the streak part.
assert.equal(
  buildHolosongQuizShareText({
    mode: "ENDLESS",
    guesses: [false],
    roundsWon: 0,
    roundsPlayed: 1,
    bestStreak: 0,
    url: "https://holodle.xyz/holosong/quiz/endless",
  }),
  ["HOLODLE HOLOSONG QUIZ — ENDLESS", "0/1 rounds", "", "🟥", "", "https://holodle.xyz/holosong/quiz/endless"].join("\n")
);

// Share text: daily solved.
assert.equal(
  buildHolosongQuizShareText({
    mode: "DAILY",
    guesses: [true],
    roundsWon: 1,
    roundsPlayed: 1,
    bestStreak: 1,
    url: "https://holodle.xyz/holosong/quiz/daily",
  }),
  ["HOLODLE HOLOSONG QUIZ 1/1", "🟩", "", "https://holodle.xyz/holosong/quiz/daily"].join("\n")
);

// Share text: daily missed.
assert.equal(
  buildHolosongQuizShareText({
    mode: "DAILY",
    guesses: [false],
    roundsWon: 0,
    roundsPlayed: 1,
    bestStreak: 0,
    url: "https://holodle.xyz/holosong/quiz/daily",
  }),
  ["HOLODLE HOLOSONG QUIZ 0/1", "🟥", "", "https://holodle.xyz/holosong/quiz/daily"].join("\n")
);

console.log("holosong-quiz.check: all assertions passed");
