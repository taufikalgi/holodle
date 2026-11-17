import Image from "next/image";
import type { HolosongSong } from "@/lib/holosong-api";

export function HolosongAnswerCard({ answer }: { answer: HolosongSong }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {answer.artwork_url && (
        <Image
          src={answer.artwork_url}
          alt=""
          width={96}
          height={96}
          className="w-24 h-24 rounded-xl object-cover"
        />
      )}
      <p className="text-base font-black text-[var(--holo-text)]">{answer.title}</p>
      <p className="text-sm text-[var(--holo-text-muted)]">
        {[answer.artist, answer.album].filter(Boolean).join(" • ")}
      </p>
      {answer.track_view_url && (
        <a
          href={answer.track_view_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold underline text-[var(--holo-blue-dark)]"
        >
          Open in Apple Music
        </a>
      )}
    </div>
  );
}
