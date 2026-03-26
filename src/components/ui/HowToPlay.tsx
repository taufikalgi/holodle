export default function HowToPlay({
  maxGuesses,
  classic,
}: {
  maxGuesses: number;
  classic: boolean;
}) {
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
          🎯 Guess the secret Hololive talent in{" "}
          <strong style={{ color: "var(--holo-text)" }}>{maxGuesses} tries</strong>
        </li>
        <li>
          🟢 <span className="text-green-600 font-semibold">Green</span> = correct attribute
        </li>
        <li>
          🔴 <span className="text-red-500 font-semibold">Red</span> = wrong attribute
        </li>
        <li>↑↓ Arrows on Debut Year = the correct year is higher or lower</li>
        {classic && <li>⏰ A new talent is chosen every day at midnight!</li>}
      </ul>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="tag-correct rounded-lg px-2 py-1.5 text-center font-semibold">
          Branch: JP ✓
        </div>
        <div className="tag-wrong rounded-lg px-2 py-1.5 text-center font-semibold">
          Year: 2020 ↑
        </div>
        <div className="tag-correct rounded-lg px-2 py-1.5 text-center font-semibold">
          Zodiac: Libra ✓
        </div>
      </div>
    </div>
  );
}
