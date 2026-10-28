/**
 * Runnable self-check for Holosong pure helpers. Not imported by the app.
 * Run:
 *   ./node_modules/.bin/tsc src/lib/holosong.check.ts --outDir /tmp/opencode/check \
 *     --module nodenext --target es2022 --moduleResolution nodenext --skipLibCheck \
 *   && node /tmp/opencode/check/src/lib/holosong.check.js
 */
import assert from "node:assert/strict";
import {
  formatHolosongClip,
  HOLOSONG_CLIP_STEPS,
  HOLOSONG_MAX_CLIP_SECONDS,
  holosongAttemptsLeft,
  isHolosongFinished,
  type HolosongSession,
} from "./holosong-api";
import { buildHolosongShareText } from "./share";

const session: HolosongSession = {
  id: "session-1",
  mode: "daily",
  status: "ongoing",
  attempts: 5,
  guesses_used: 2,
  clip_seconds: 2,
  preview_url: "https://example.com/preview.m4a",
  board: [],
  version: 3,
};

assert.deepEqual(
  [...HOLOSONG_CLIP_STEPS],
  [0.13, 0.53, 2, 8, 15]
);
assert.equal(HOLOSONG_MAX_CLIP_SECONDS, 15);

// User-facing clip labels round rare short clips to one decimal.
assert.equal(formatHolosongClip(0.13), "0.1s");
assert.equal(formatHolosongClip(0.53), "0.5s");
assert.equal(formatHolosongClip(2), "2s");
assert.equal(formatHolosongClip(8), "8s");
assert.equal(formatHolosongClip(15), "15s");

assert.equal(holosongAttemptsLeft(session), 3);
assert.equal(holosongAttemptsLeft({ ...session, guesses_used: 5 }), 0);
assert.equal(holosongAttemptsLeft(null), 5);

assert.equal(isHolosongFinished(session), false);
assert.equal(isHolosongFinished({ ...session, status: "won" }), true);
assert.equal(isHolosongFinished({ ...session, status: "lost" }), true);
assert.equal(isHolosongFinished(null), false);

const shareUrl = "https://example.com/holosong/daily";
assert.equal(
  buildHolosongShareText({
    mode: "DAILY",
    guesses: [
      { correct: false, skipped: false },
      { correct: false, skipped: true },
      { correct: true, skipped: false },
    ],
    maxGuesses: 5,
    won: true,
    url: shareUrl,
  }),
  [
    "HOLODLE HOLOSONG DAILY 3/5",
    "",
    "🟥⬜🟩",
    "",
    `Play Today's Game: ${shareUrl}`,
  ].join("\n")
);
assert.equal(
  buildHolosongShareText({
    mode: "PRACTICE",
    guesses: [
      { correct: false, skipped: false },
      { correct: false, skipped: false },
      { correct: false, skipped: false },
      { correct: false, skipped: false },
      { correct: false, skipped: false },
    ],
    maxGuesses: 5,
    won: false,
    url: shareUrl,
  }).split("\n")[0],
  "HOLODLE HOLOSONG PRACTICE X/5"
);

console.log("holosong.check: all assertions passed");
