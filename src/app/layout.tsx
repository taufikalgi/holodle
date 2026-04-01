import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holodle - Hololive Wordle",
  description:
    "Think you know your Hololive talents? Prove it! Play once a day or go endless if you're obsessed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
