import { type Talent, type CompareResult } from "@/lib/talents";
import Cell from "./Cell";
import HeightLabel from "./HeightLabel";

export default function GuessRow({
  guess,
  result,
  index,
}: {
  guess: Talent;
  result: CompareResult;
  index: number;
}) {
  const base = index * 80;
  return (
    <div className="grid grid-cols-6 gap-2 row-reveal" style={{ animationDelay: `${base}ms` }}>
      <div className="flex items-center justify-center text-center px-2 py-3 rounded-xl text-sm font-bold min-h-[54px] bg-white border-2 border-[#00B4D8]/30 text-[#0077A3]">
        <img
          src={guess.image}
          alt={guess.name}
          className="w-8 h-8 rounded-full object-cover mr-1 flex-shrink-0"
        />
        <span className="leading-tight text-xs">{guess.name}</span>
      </div>
      <Cell label={guess.branch} status={result.branch} delay={base + 80} />
      <Cell
        label={
          <>
            {guess.debutYear}
            {result.debutYear === "higher" && <span className="ml-1">↑</span>}
            {result.debutYear === "lower" && <span className="ml-1">↓</span>}
          </>
        }
        status={result.debutYear === "correct" ? "correct" : "wrong"}
        delay={base + 160}
      />
      <Cell label={guess.loreArchetype} status={result.loreArchetype} delay={base + 240} />
      <Cell
        label={<HeightLabel cat={guess.heightCategory} />}
        status={result.heightCategory}
        delay={base + 320}
      />
      <Cell label={guess.birthMonth} status={result.birthMonth} delay={base + 400} />
    </div>
  );
}
