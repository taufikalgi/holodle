import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hololive Wordle",
  description: "Guess the Hololive talent! A daily guessing game.",
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
