import assert from "node:assert/strict";
import {
  holosongLoadError,
  holosongSubmitError,
  messageOf,
  statusOf,
} from "./api-errors";
import { ApiError } from "./errors";

assert.deepEqual(holosongLoadError(404, "Holosong", new Error("x")), {
  loadStatus: "unavailable",
  message: "No Holosong songs are available yet. Try again later.",
});
assert.equal(holosongLoadError(401, "Holosong Quiz", new Error("x")).message, "Please sign in to play Holosong Quiz.");
assert.equal(holosongLoadError(500, "Holosong", new Error("boom")).message, "boom");
assert.equal(holosongLoadError(500, "Holosong", "nope").message, "Failed to load Holosong.");
assert.equal(holosongSubmitError(401, new Error("x")), "Your session expired. Please sign in again.");
assert.equal(holosongSubmitError(403, new Error("x")), "This session belongs to another user.");
assert.equal(holosongSubmitError(404, new Error("x")), "Session or song not found.");
assert.equal(holosongSubmitError(429, new Error("x")), "Too many guesses — wait a moment and try again.");
assert.equal(holosongSubmitError(500, new Error("boom")), "boom");
assert.equal(holosongSubmitError(500, "nope"), "Guess failed. Try again.");
assert.equal(statusOf(new ApiError("x", 418)), 418);
assert.equal(statusOf(new Error("x")), 0);
assert.equal(messageOf(new Error("boom"), "fallback"), "boom");
assert.equal(messageOf("nope", "fallback"), "fallback");

console.log("api-errors.check: all assertions passed");
