export default function HeightLabel({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    smol: "Smol (<150)",
    med: "Med (150–160)",
    tall: "Tall (>160)",
  };
  return <>{map[cat] || cat}</>;
}
