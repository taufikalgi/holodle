"use client";

import HolosongQuizGame from "@/components/holosong/HolosongQuizGame";
import { useAuth } from "@/hooks/useAuth";

export default function HolosongQuizEndlessPage() {
  const { login } = useAuth();

  return <HolosongQuizGame mode="endless" onLogin={() => login("/holosong/quiz/endless")} />;
}
