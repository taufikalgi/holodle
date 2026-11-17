import assert from "node:assert/strict";
import {
  AUTH_REDIRECT_PATHS,
  DEFAULT_AUTH_REDIRECT,
  getAuthRedirectTarget,
} from "./auth-redirect";

assert.equal(DEFAULT_AUTH_REDIRECT, "/classic/competitive");
assert.ok(AUTH_REDIRECT_PATHS.has("/holosong/quiz/daily"));
assert.ok(AUTH_REDIRECT_PATHS.has("/holosong/quiz/endless"));
assert.ok(AUTH_REDIRECT_PATHS.has("/admin"));
assert.equal(getAuthRedirectTarget("/holosong/quiz/daily"), "/holosong/quiz/daily");
assert.equal(getAuthRedirectTarget("/nope"), DEFAULT_AUTH_REDIRECT);
assert.equal(getAuthRedirectTarget(null), DEFAULT_AUTH_REDIRECT);
assert.equal(getAuthRedirectTarget(undefined), DEFAULT_AUTH_REDIRECT);
assert.equal(getAuthRedirectTarget(""), DEFAULT_AUTH_REDIRECT);
assert.equal(getAuthRedirectTarget(null, "/admin"), "/admin");
assert.equal(getAuthRedirectTarget("/nope", "/admin"), "/admin");

console.log("auth-redirect.check: all assertions passed");
