"use client";

import HolosongGame from "@/components/holosong/HolosongGame";
import { useAuth } from "@/hooks/useAuth";

export default function HolosongDailyPage() {
  const { login } = useAuth();

  return (
    <HolosongGame mode="daily" onLogin={() => login("/holosong/daily")} />
  );
}
