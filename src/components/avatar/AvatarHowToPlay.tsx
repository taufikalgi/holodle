export default function AvatarHowToPlay({ daily }: { daily?: boolean }) {
  return (
    <div className="holo-card p-5 mb-5 animate-slide-down">
      <h2
        className="font-black text-sm tracking-widest uppercase mb-3"
        style={{ color: "var(--holo-blue-dark)" }}
      >
        How to Play
      </h2>
      <ul className="text-sm space-y-2" style={{ color: "var(--holo-text-muted)" }}>
        <li>
          🖼️ Guess the secret Hololive talent from a{" "}
          <strong style={{ color: "var(--holo-text)" }}>cropped avatar</strong>
        </li>
        <li>
          🔍 You get <strong style={{ color: "var(--holo-text)" }}>5 guesses</strong> — each wrong
          guess reveals a bigger hint
        </li>
        <li>🔴 The first crop is the hardest; later crops zoom out</li>
        <li>✅ A correct guess reveals the full picture</li>
        {daily && <li>⏰ A new talent is chosen every day at midnight!</li>}
      </ul>
    </div>
  );
}