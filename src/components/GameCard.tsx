import Link from "next/link";

interface GameCardProps {
  href: string;
  logo: string;
  alt: string;
  title: string;
  description: string;
}

export default function GameCard({ href, logo, alt, title, description }: GameCardProps) {
  return (
    <Link
      href={href}
      className="holo-card p-8 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow group"
    >
      <img
        src={logo}
        alt={alt}
        className="w-20 h-20 rounded-full object-cover mr-1 flex-shrink-0"
      />
      <h2 className="text-xl font-black" style={{ color: "var(--holo-text)" }}>
        {title}
      </h2>
      <p className="text-sm text-center" style={{ color: "var(--holo-text-muted)" }}>
        {description}
      </p>
    </Link>
  );
}
