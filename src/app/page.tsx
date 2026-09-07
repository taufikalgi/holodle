import Footer from "@/components/ui/Footer";
import CategoryDropdown from "@/components/ui/CategoryDropdown";
import Navbar from "@/components/ui/Navbar";
import { GAME_CATEGORIES } from "@/lib/game-modes";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--holo-bg)" }}>
      <Navbar title="Holodle" />
      <main className="flex-1 flex flex-col items-center pt-8">
      <div className="flex items-center gap-2 mb-1 mt-6">
        <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#00B4D8]" />
        <span className="text-[#00B4D8] text-xs">✦</span>
        <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#00B4D8]" />
      </div>
      <h1
        className="text-5xl font-black tracking-widest mb-2"
        style={{ fontFamily: "var(--font-albert-sans), sans-serif" }}
      >
        <span style={{ color: "var(--holo-blue)" }}>HOLO</span>
        <span style={{ color: "var(--holo-text)" }}>DLE</span>
      </h1>
      <p
        className="text-sm tracking-widest uppercase mb-12"
        style={{ color: "var(--holo-text-muted)" }}
      >
        Prove your LOVE to your OSHI
      </p>

      <div className="grid grid-cols-1 gap-6 w-full max-w-2xl px-4">
        {GAME_CATEGORIES.map((category) => (
          <CategoryDropdown key={category.id} category={category} />
        ))}
      </div>

      <Footer />
      </main>
    </div>
  );
}
