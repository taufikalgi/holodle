import { getLoreArchetypeCategory } from "@/lib/talents";
import Cell from "./Cell";
import type { ReactNode } from "react";

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

function arrow(value: ReactNode, result: string, arrowClass: string): ReactNode {
  return (
    <>
      {value}
      {(result === "higher" || result === "higher-close") && <span className={arrowClass}>↓</span>}
      {(result === "lower" || result === "lower-close") && <span className={arrowClass}>↑</span>}
    </>
  );
}

function cellStatus(result: string): "correct" | "wrong" | "wrong-close" {
  if (result === "correct") return "correct";
  if (result === "higher-close" || result === "lower-close") return "wrong-close";
  return "wrong";
}

type AttrKey = "branch" | "debutYear" | "loreArchetype" | "height" | "birthMonth";

function attrCell(guess: GuessRowTalent, result: GuessRowResult, key: AttrKey, delay: number, arrowClass: string) {
  if (key === "branch") {
    return <Cell label={guess.branch} status={result.branch} delay={delay} />;
  }
  if (key === "loreArchetype") {
    return <Cell label={getLoreArchetypeCategory(guess.loreArchetype)} status={result.loreArchetype} delay={delay} />;
  }
  const fieldValue = guess[key];
  const resultValue = result[key];
  const display = fieldValue ?? "—";
  return <Cell label={arrow(display, resultValue, arrowClass)} status={cellStatus(resultValue)} delay={delay} />;
}

const ATTRIBUTES: { key: AttrKey; delay: number }[] = [
  { key: "branch", delay: 160 },
  { key: "debutYear", delay: 240 },
  { key: "loreArchetype", delay: 320 },
  { key: "height", delay: 400 },
  { key: "birthMonth", delay: 480 },
];

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
      <div
        className="hidden md:grid grid-cols-7 gap-2 row-reveal"
        style={{ animationDelay: `${base}ms` }}
      >
        <div className="flex justify-center px-2 py-3 rounded-xl min-h-[54px] bg-[var(--holo-bg-card)] border-2 border-[#00B4D8]/30 text-[#0077A3]">
          <img
            src={guess.photoUrl}
            alt={guess.name}
            className="w-8 h-8 rounded-full object-cover mr-1 flex-shrink-0"
          />
        </div>
        <Cell label={guess.name} status={result.name} delay={base + 80} />
        {ATTRIBUTES.map(({ key, delay }) => attrCell(guess, result, key, base + delay, "ml-1"))}
      </div>

      <div
        className="flex flex-col gap-1.5 row-reveal md:hidden"
        style={{ animationDelay: `${base}ms` }}
      >
        <div className="flex justify-center items-center gap-2 px-3 py-2 rounded-xl bg-[var(--holo-bg-card)] border-2 border-[#00B4D8]/30 text-[#0077A3]">
          <img
            src={guess.photoUrl}
            alt={guess.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <Cell label={guess.name} status={result.name} delay={base + 80} />
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {ATTRIBUTES.map(({ key, delay }) => attrCell(guess, result, key, base + delay, "ml-0.5"))}
        </div>
      </div>
    </>
  );
}
