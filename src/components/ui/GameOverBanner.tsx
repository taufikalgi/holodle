import type { ReactNode } from "react";

export default function GameOverBanner({
  won,
  answerName,
  guessCount,
  children,
  revealed,
  onReveal,
  answerDetails,
  message,
  actions,
}: {
  won: boolean;
  answerName: string;
  guessCount: number;
  children?: ReactNode;
  revealed?: boolean;
  onReveal?: () => void;
  answerDetails?: { image?: string; branch?: string; debutYear?: number; loreArchetype?: string };
  message?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className={`${won ? "win-banner" : "lose-banner"} rounded-2xl p-5 mb-5 text-center animate-bounce-in`}
    >
      {won ? (
        <>
          <div className="text-3xl mb-2">🎊</div>
          <h2 className="text-xl font-black text-green-600 mb-1">Yatta! ✨</h2>
          <p className="text-sm text-green-700">
            You found <strong>{answerName}</strong> in {guessCount} guess
            {guessCount !== 1 ? "es" : ""}!
          </p>
        </>
      ) : (
        <>
          <div className="text-3xl mb-2">😔</div>
          <h2 className="text-xl font-black text-red-500 mb-1">Dame datta...</h2>
          <p className="text-sm text-red-600">
            The answer was{" "}
            {onReveal ? (
              <button onClick={onReveal} className="font-black underline hover:no-underline">
                {revealed ? answerName : "click to reveal"}
              </button>
            ) : (
              <strong>{answerName}</strong>
            )}
          </p>
          {revealed && answerDetails && (
            <p className="text-xs text-red-400 mt-1">
              {answerDetails.image && (
                <img
                  src={answerDetails.image}
                  alt={answerName}
                  className="w-16 h-16 mx-auto my-2 rounded-full object-cover"
                />
              )}
              {[answerDetails.branch, answerDetails.debutYear, answerDetails.loreArchetype]
                .filter(Boolean)
                .join(" • ")}
            </p>
          )}
        </>
      )}
      {actions}
      {message && <p className="text-xs mt-3 opacity-60">{message}</p>}
      {children}
    </div>
  );
}
