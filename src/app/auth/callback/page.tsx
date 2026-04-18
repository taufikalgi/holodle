"use client";

import { Suspense } from "react";
import AuthCallbackContent from "./AuthCallbackContent";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
