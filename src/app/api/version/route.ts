import { NextResponse } from "next/server";

// Deploy verification marker. The container is started with BUILD_ID set to the
// image digest it was launched from, so a deployed URL can be asked which build
// it is actually serving. Without this, a green pipeline only proves that nginx
// and some container answered — not that the new image is live.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    build: process.env.BUILD_ID ?? "unknown",
    node: process.env.NODE_ENV ?? "unknown",
  });
}
