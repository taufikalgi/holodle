"use client";

import { useReducer } from "react";
import { getSessionStatus, type SessionStatus } from "@/components/competitive-classic/utils";
import type { GameStatus } from "@/lib/game-status";

/** Plan states idle|loading|playing|won|lost|expired|error (+ empty kept from GameStatus). */
export type GameMachineState = GameStatus | "idle" | "expired";

export interface GameMachineInputs {
  loading: boolean;
  error: string;
  empty: boolean;
  gameOver: boolean;
  won: boolean;
  expired?: boolean;
}

function computeGameState(args: GameMachineInputs): GameMachineState {
  if (args.loading) return "loading";
  if (args.error) return "error";
  if (args.empty) return "empty";
  if (args.expired) return "expired";
  if (args.gameOver) return args.won ? "won" : "lost";
  return "playing";
}

function gameReducer(prev: GameMachineState, next: GameMachineState): GameMachineState {
  return next === prev ? prev : next;
}

/**
 * Single status owner for guess-flow games. Render-phase sync (sanctioned React
 * pattern) keeps it flash-free and behavior-identical to the derivation it replaces.
 */
export function useGameMachine(args: GameMachineInputs): GameMachineState {
  const [status, dispatch] = useReducer(gameReducer, args, computeGameState);
  const next = computeGameState(args);
  if (next !== status) dispatch(next);
  return next;
}

export interface SessionMachineInputs {
  user: Parameters<typeof getSessionStatus>[0]["user"];
  loading: boolean;
  session: Parameters<typeof getSessionStatus>[0]["session"];
  ended: boolean;
  expired: boolean;
  submitting: boolean;
  error: string;
}

/** Competitive session machine: no-session(idle)|starting(loading)|active|submitting|ended|expired (+locked|error). */
export function useSessionMachine(args: SessionMachineInputs): SessionStatus {
  const [status, dispatch] = useReducer(gameReducer as (p: SessionStatus, n: SessionStatus) => SessionStatus, args, (a) =>
    getSessionStatus(a)
  );
  const next = getSessionStatus(args);
  if (next !== status) dispatch(next);
  return next;
}
