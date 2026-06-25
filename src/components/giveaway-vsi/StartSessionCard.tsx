export default function StartSessionCard({
  onStart,
  loading,
}: {
  onStart: () => void;
  loading: boolean;
}) {
  return (
    <div className="win-banner rounded-3xl p-6 md:p-8 text-center">
      <div className="text-4xl" style={{ color: "var(--holo-blue)" }}>
        ▶
      </div>
      <h2 className="mt-3 text-2xl font-black" style={{ color: "var(--holo-blue)" }}>
        Start a session to play
      </h2>
      <p
        className="mx-auto mt-2 max-w-2xl text-sm leading-6"
        style={{ color: "var(--holo-text-muted)" }}
      >
        A round is only created when you start it. Open a session first, then submit guesses.
      </p>

      <button
        onClick={onStart}
        disabled={loading}
        className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: "var(--holo-blue)" }}
      >
        {loading ? "Starting..." : "Start session"}
      </button>
    </div>
  );
}
