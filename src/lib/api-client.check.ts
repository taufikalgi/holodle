import assert from "node:assert/strict";
import { readEnvelope } from "./api-client";

async function main() {
  const empty = await readEnvelope(new Response(null, { status: 204 }));
  assert.equal(empty, undefined);

  const empty200 = await readEnvelope(new Response(null, { status: 200 }));
  assert.equal(empty200, undefined);

  await assert.rejects(
    () => readEnvelope(new Response("<html>proxy error</html>", { status: 200 })),
    /Invalid JSON response/
  );

  const ok = await readEnvelope<number>(
    new Response(JSON.stringify({ success: true, data: 5 }), { status: 200 })
  );
  assert.equal(ok, 5);

  await assert.rejects(
    () =>
      readEnvelope(
        new Response(JSON.stringify({ success: false, message: "nope" }), { status: 200 })
      ),
    /nope/
  );

  await assert.rejects(
    () =>
      readEnvelope(
        new Response(JSON.stringify({ error: "bad request" }), { status: 400 })
      ),
    /bad request/
  );

  console.log("api-client.check: all assertions passed");
}

void main();
