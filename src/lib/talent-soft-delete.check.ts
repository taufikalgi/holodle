/**
 * Runnable self-check for the talent soft-delete payload. Not imported by the app.
 * Run:
 *   ./node_modules/.bin/tsc src/lib/talent-soft-delete.check.ts --outDir /tmp/opencode/check \
 *     --module nodenext --target es2022 --moduleResolution nodenext --skipLibCheck \
 *   && node /tmp/opencode/check/talent-soft-delete.check.js
 */
import assert from "node:assert/strict";
import { buildTalentDeletePayload, type AdminTalent } from "./talents";

const talent: AdminTalent = {
  id: "t1",
  name: "Tokino Sora",
  branch: "JP",
  debut_year: 2017,
  lore_archetype: "human",
  height: 160,
  birth_month: "May",
  image_url: "https://example.com/image.png",
  avatar_url: "https://example.com/avatar.png",
  alt_names: ["Soda"],
  generation: "0th Gen",
  is_deleted: false,
};

const payload = buildTalentDeletePayload(talent);

assert.equal(payload.is_deleted, true);
assert.equal(payload.generation, "0th Gen");
assert.equal(payload.id, "t1");
assert.equal(payload.name, "Tokino Sora");
assert.deepEqual(payload.alt_names, ["Soda"]);
assert.equal(talent.is_deleted, false);

console.log("talent-soft-delete.check: all assertions passed");
