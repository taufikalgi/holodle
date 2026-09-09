"use client";

import { useState } from "react";
import GuessRow from "@/components/ui/GuessRow";
import { ColumnHeaders, DEFAULT_COLUMN_HEADERS } from "@/components/ui";
import HeaderStat from "./HeaderStat";
import type { GameSession, GuessEntry } from "./types";

export default function SessionHistorySection({
  session,
  currentRoundHistory,
  previousRounds,
  onNewSession,
}: {
  session: GameSession;
  currentRoundHistory: GuessEntry[];
  previousRounds: GuessEntry[][];
  onNewSession: () => void;
}) {
  const [historyTab, setHistoryTab] = useState<"current" | "previous">("current");
  const displayCurrentHistory = [...currentRoundHistory].reverse();
  const displayPreviousRounds = [...previousRounds].reverse();
  const latestGuess = currentRoundHistory[currentRoundHistory.length - 1] ?? null;

  return (
    <div className="holo-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: "var(--holo-text-muted)" }}
          >
            Session state
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--holo-text-muted)" }}>
            {session.correct_guesses} correct, {session.wrong_answers} wrong, round{" "}
            {session.round_number}
          </p>
        </div>
        <button
          onClick={onNewSession}
          className="rounded-xl border px-4 py-2 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)]"
          style={{ borderColor: "var(--holo-border)", color: "var(--holo-text)" }}
        >
          New session
        </button>
      </div>

      <div className="mt-4 overflow-x-auto pb-2">
        <div
          className="mb-4 flex rounded-2xl border p-1"
          style={{ borderColor: "var(--holo-border)" }}
        >
          <button
            type="button"
            onClick={() => setHistoryTab("current")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
              historyTab === "current" ? "bg-[var(--holo-off-white)]" : "bg-transparent"
            }`}
            style={{ color: "var(--holo-text)" }}
          >
            Current round
          </button>
          <button
            type="button"
            onClick={() => setHistoryTab("previous")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
              historyTab === "previous" ? "bg-[var(--holo-off-white)]" : "bg-transparent"
            }`}
            style={{ color: "var(--holo-text)" }}
          >
            Previous results
          </button>
        </div>

        {historyTab === "current" && currentRoundHistory.length > 0 ? (
          <div className="space-y-2">
            <ColumnHeaders headers={DEFAULT_COLUMN_HEADERS} />

            {displayCurrentHistory.map((guess, index) => (
              <GuessRow
                key={`${guess.talent.id}-${guess.submittedAt}`}
                guess={guess.talent}
                result={guess.comparison}
                index={index}
              />
            ))}
          </div>
        ) : historyTab === "current" ? (
          <div
            className="rounded-2xl border border-dashed px-4 py-12 text-center"
            style={{
              borderColor: "var(--holo-border)",
              color: "var(--holo-text-muted)",
            }}
          >
            Your first guess will appear here.
          </div>
        ) : displayPreviousRounds.length > 0 ? (
          <div className="space-y-3">
            {displayPreviousRounds.map((round, roundIndex) => {
              const roundNumber = previousRounds.length - roundIndex;
              const roundLatest = round[round.length - 1] ?? null;
              return (
                <div
                  key={`${roundNumber}-${roundLatest?.submittedAt ?? roundIndex}`}
                  className="rounded-2xl border bg-[var(--holo-bg-card)] p-4 shadow-sm"
                  style={{ borderColor: "var(--holo-border)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-[0.24em]"
                        style={{ color: "var(--holo-text-muted)" }}
                      >
                        Round {roundNumber}
                      </p>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--holo-text-muted)" }}
                      >
                        {round.length} guess{round.length === 1 ? "" : "es"}
                      </p>
                    </div>
                    {roundLatest && (
                      <div
                        className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${roundLatest.correct ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                      >
                        {roundLatest.correct ? "Correct" : "Wrong"}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 overflow-x-auto pb-2">
                    <div className="space-y-2">
                      <ColumnHeaders
                        headers={DEFAULT_COLUMN_HEADERS}
                        competitive={true}
                      />

                      {[...round].reverse().map((guess, index) => (
                        <GuessRow
                          key={`${guess.talent.id}-${guess.submittedAt}`}
                          guess={guess.talent}
                          result={guess.comparison}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-2xl border border-dashed px-4 py-12 text-center"
            style={{
              borderColor: "var(--holo-border)",
              color: "var(--holo-text-muted)",
            }}
          >
            Previous results will appear here after a correct answer.
          </div>
        )}
      </div>

      {latestGuess && (
        <div
          className="mt-4 rounded-2xl border bg-[var(--holo-bg-card)] px-4 py-4 shadow-sm"
          style={{ borderColor: "var(--holo-border)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.24em]"
                style={{ color: "var(--holo-text-muted)" }}
              >
                Latest result
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                {latestGuess.talent.name}
              </p>
            </div>
            <div
              className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${latestGuess.correct ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
            >
              {latestGuess.correct ? "Correct" : "Wrong"}
            </div>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <HeaderStat label="Name" value={latestGuess.comparison.name} />
            <HeaderStat label="Branch" value={latestGuess.comparison.branch} />
            <HeaderStat label="Debut" value={latestGuess.comparison.debutYear} />
            <HeaderStat label="Month" value={latestGuess.comparison.birthMonth} />
          </div>
        </div>
      )}
    </div>
  );
}
