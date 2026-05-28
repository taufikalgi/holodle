import { getLoreArchetypeCategory } from "@/lib/talents";
import Cell from "./Cell";

type GuessRowTalent = {
  name: string;
  branch: string;
  debutYear: number | null;
  loreArchetype: string;
  height: number | null;
  birthMonth: string;
  photoUrl: string;
};

type GuessRowResult = {
  name: "correct" | "wrong";
  branch: "correct" | "wrong";
  debutYear: "correct" | "wrong" | "higher" | "higher-close" | "lower" | "lower-close";
  loreArchetype: "correct" | "wrong";
  height: "correct" | "wrong" | "higher" | "higher-close" | "lower" | "lower-close";
  birthMonth: "correct" | "wrong" | "higher" | "higher-close" | "lower" | "lower-close";
};

export default function GuessRow({
  guess,
  result,
  index,
}: {
  guess: GuessRowTalent;
  result: GuessRowResult;
  index: number;
}) {
  const base = index * 80;
  return (
    <>
      {/* ── Desktop layout (md+): unchanged 7-column grid ── */}
      <div
        className="hidden md:grid grid-cols-7 gap-2 row-reveal"
        style={{ animationDelay: `${base}ms` }}
      >
        <div className="flex justify-center px-2 py-3 rounded-xl min-h-[54px] bg-white border-2 border-[#00B4D8]/30 text-[#0077A3]">
          <img
            src={guess.photoUrl}
            alt={guess.name}
            className="w-8 h-8 rounded-full object-cover mr-1 flex-shrink-0"
          />
        </div>
        <Cell label={guess.name} status={result.name} delay={base + 80} />
        <Cell label={guess.branch} status={result.branch} delay={base + 160} />
        <Cell
          label={
            <>
              {guess.debutYear ?? "—"}
              {result.debutYear === "higher" && <span className="ml-1">↓</span>}
              {result.debutYear === "higher-close" && <span className="ml-1">↓</span>}
              {result.debutYear === "lower" && <span className="ml-1">↑</span>}
              {result.debutYear === "lower-close" && <span className="ml-1">↑</span>}
            </>
          }
          status={
            result.debutYear === "correct"
              ? "correct"
              : result.debutYear === "higher-close" || result.debutYear === "lower-close"
                ? "wrong-close"
                : "wrong"
          }
          delay={base + 240}
        />
        <Cell
          label={getLoreArchetypeCategory(guess.loreArchetype)}
          status={result.loreArchetype}
          delay={base + 320}
        />
        <Cell
          label={
            <>
              {guess.height ?? "—"}
              {result.height === "higher" && <span className="ml-1">↓</span>}
              {result.height === "higher-close" && <span className="ml-1">↓</span>}
              {result.height === "lower" && <span className="ml-1">↑</span>}
              {result.height === "lower-close" && <span className="ml-1">↑</span>}
            </>
          }
          status={
            result.height === "correct"
              ? "correct"
              : result.height === "higher-close" || result.height === "lower-close"
                ? "wrong-close"
                : "wrong"
          }
          delay={base + 400}
        />
        <Cell
          label={
            <>
              {guess.birthMonth}
              {result.birthMonth === "higher" && <span className="ml-1">↓</span>}
              {result.birthMonth === "higher-close" && <span className="ml-1">↓</span>}
              {result.birthMonth === "lower" && <span className="ml-1">↑</span>}
              {result.birthMonth === "lower-close" && <span className="ml-1">↑</span>}
            </>
          }
          status={
            result.birthMonth === "correct"
              ? "correct"
              : result.birthMonth === "higher-close" || result.birthMonth === "lower-close"
                ? "wrong-close"
                : "wrong"
          }
          delay={base + 480}
        />
      </div>

      {/* ── Mobile layout (<md): photo+name row, then 5-cell grid ── */}
      <div
        className="flex flex-col gap-1.5 row-reveal md:hidden"
        style={{ animationDelay: `${base}ms` }}
      >
        {/* Top row: avatar + name */}
        <div className="flex justify-center items-center gap-2 px-3 py-2 rounded-xl bg-white border-2 border-[#00B4D8]/30 text-[#0077A3]">
          <img
            src={guess.photoUrl}
            alt={guess.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <Cell label={guess.name} status={result.name} delay={base + 80} />
        </div>

        {/* Bottom row: 5 attribute cells in a 5-column grid */}
        <div className="grid grid-cols-5 gap-1.5">
          <Cell label={guess.branch} status={result.branch} delay={base + 160} />
          <Cell
            label={
              <>
                {guess.debutYear ?? "—"}
                {result.debutYear === "higher" && <span className="ml-0.5">↓</span>}
                {result.debutYear === "higher-close" && <span className="ml-0.5">↓</span>}
                {result.debutYear === "lower" && <span className="ml-0.5">↑</span>}
                {result.debutYear === "lower-close" && <span className="ml-0.5">↑</span>}
              </>
            }
            status={
              result.debutYear === "correct"
                ? "correct"
                : result.debutYear === "higher-close" || result.debutYear === "lower-close"
                  ? "wrong-close"
                  : "wrong"
            }
            delay={base + 240}
          />
          <Cell
            label={getLoreArchetypeCategory(guess.loreArchetype)}
            status={result.loreArchetype}
            delay={base + 320}
          />
          <Cell
            label={
              <>
                {guess.height ?? "—"}
                {result.height === "higher" && <span className="ml-0.5">↓</span>}
                {result.height === "higher-close" && <span className="ml-0.5">↓</span>}
                {result.height === "lower" && <span className="ml-0.5">↑</span>}
                {result.height === "lower-close" && <span className="ml-0.5">↑</span>}
              </>
            }
            status={
              result.height === "correct"
                ? "correct"
                : result.height === "higher-close" || result.height === "lower-close"
                  ? "wrong-close"
                  : "wrong"
            }
            delay={base + 400}
          />
          <Cell
            label={
              <>
                {guess.birthMonth}
                {result.birthMonth === "higher" && <span className="ml-0.5">↓</span>}
                {result.birthMonth === "higher-close" && <span className="ml-0.5">↓</span>}
                {result.birthMonth === "lower" && <span className="ml-0.5">↑</span>}
                {result.birthMonth === "lower-close" && <span className="ml-0.5">↑</span>}
              </>
            }
            status={
              result.birthMonth === "correct"
                ? "correct"
                : result.birthMonth === "higher-close" || result.birthMonth === "lower-close"
                  ? "wrong-close"
                  : "wrong"
            }
            delay={base + 480}
          />
        </div>
      </div>
    </>
  );
}
