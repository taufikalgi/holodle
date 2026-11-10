"use client";

import RouteError from "@/components/ui/RouteError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Avatar game crashed"
      maxWidth="max-w-3xl"
    />
  );
}
