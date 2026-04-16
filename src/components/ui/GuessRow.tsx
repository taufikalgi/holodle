import { type Talent, type CompareResult, getLoreArchetypeCategory } from "@/lib/talents";
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
    <div className="grid grid-cols-7 gap-2 row-reveal" style={{ animationDelay: `${base}ms` }}>
      <div className="flex justify-center px-2 py-3 rounded-xl min-h-[54px] bg-white border-2 border-[#00B4D8]/30 text-[#0077A3]">
        <img
          src={guess.image}
          alt={guess.name}
          className="w-8 h-8 rounded-full object-cover mr-1 flex-shrink-0"
        />
        {/* <span className="leading-tight text-xs">{guess.name}</span> */}
      </div>
      <Cell label={guess.name} status={result.name} delay={base + 80} />
      <Cell label={guess.branch} status={result.branch} delay={base + 160} />
      <Cell
        label={
          <>
            {guess.debutYear}
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
      {/* <Cell
        label={<HeightLabel cat={guess.heightCategory} />}
        status={result.heightCategory}
        delay={base + 400}
      /> */}
      <Cell
        label={
          <>
            {guess.height}
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
  );
}
