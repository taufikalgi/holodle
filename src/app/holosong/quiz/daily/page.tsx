"use client";

import HolosongQuizGame from "@/components/holosong/HolosongQuizGame";
import { useAuth } from "@/hooks/useAuth";

export default function HolosongQuizDailyPage() {
  const { login } = useAuth();

  return (
    <HolosongQuizGame
      mode="daily"
      onLogin={() => login("/holosong/quiz/daily")}
    />
  );
}
