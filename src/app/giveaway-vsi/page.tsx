"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ALL_TALENTS,
  searchTalents,
  compareTalents,
  type Talent,
  type CompareResult,
} from "@/lib/talents";
import {
  ColumnHeaders,
  Footer,
  GuessRow,
  HowToPlay,
  Navbar,
  PageHeader,
  StatsBar,
  TalentSearchInput,
} from "@/components/ui";
import VsiNavbar from "@/components/ui/VsiNavbar";
import { API_ENDPOINTS } from "./apiEndpoints";

const TOKEN_KEY = "token";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}

function AuthGate({ onLogin }: { onLogin: () => void }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center "
      style={{ background: "var(--holo-bg)" }}
    >
      <div
        className="bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-5 text-center justify-center"
        style={{ maxWidth: 400, width: "100%", border: "1px solid var(--holo-border)" }}
      >
        <a
          href="/"
          className="text-sm font-bold transition-colors hover:opacity-70"
          style={{ color: "var(--holo-blue)" }}
        >
          ← Back to Home
        </a>
        <PageHeader
          subtitle="Daily Hololive Talent Guessing Game"
          onHowTo={() => {}}
          showHowTo={false}
          showButton={false}
        />

        <hr className="w-full" style={{ borderColor: "var(--holo-border)" }} />

        <p className="text-sm" style={{ color: "var(--holo-text-muted)", lineHeight: 1.6 }}>
          Sign in untuk ikut <strong>Giveaway VSI</strong> bang.
        </p>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-bold text-sm transition-opacity hover:opacity-80"
          style={{
            border: "1.5px solid var(--holo-border)",
            background: "white",
            color: "var(--holo-text)",
            cursor: "pointer",
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* <p className="text-xs" style={{ color: "var(--holo-text-muted)", opacity: 0.5 }}>
          Holodle — Fan-made game. Not affiliated with Cover Corp.
        </p> */}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.09-6.09C34.46 3.19 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.09 5.51C12.4 13.67 17.72 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.09 37.01 46.1 31.22 46.1 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.73 28.27A14.5 14.5 0 0 1 9.5 24c0-1.49.26-2.93.73-4.27L3.14 14.22A22.94 22.94 0 0 0 1 24c0 3.61.87 7.02 2.64 10l7.09-5.73z"
      />
      <path
        fill="#34A853"
        d="M24 47c5.52 0 10.15-1.83 13.54-4.97l-7.19-5.59c-1.83 1.23-4.17 1.96-6.35 1.96-6.28 0-11.6-4.17-13.27-9.73l-7.09 5.73C7.07 41.52 14.82 47 24 47z"
      />
    </svg>
  );
}

function parseJwt(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.user_id,
      email: payload.email,
      name: payload.email.split("@")[0], // or payload.name if your backend includes it
      picture: payload.picture, // include if your backend adds it
    };
  } catch {
    return null;
  }
}

function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      localStorage.setItem(TOKEN_KEY, hash.slice(7));
      window.history.replaceState(null, "", window.location.pathname);
    }

    const token = getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = Date.now() / 1000 > (payload.exp ?? 0);

      if (isExpired) {
        localStorage.removeItem(TOKEN_KEY);
        setLoading(false);
        return;
      }

      // Fetch profile picture
      fetch(`${API_ENDPOINTS.apiUrl}/api/v1/user/${payload.user_id}/picture`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          console.log("Fetched user picture data:", data);
          setUser({
            id: payload.user_id,
            email: payload.email,
            name: payload.email.split("@")[0],
            picture: data?.data?.picture_url,
          });
        })
        .catch(() => {
          // Picture fetch failed — still log in, just without avatar
          setUser({
            id: payload.user_id,
            email: payload.email,
            name: payload.email.split("@")[0],
          });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = () => {
    window.location.href = API_ENDPOINTS.googleAuthUrl;
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return { user, loading, login, logout };
}

const MAX_GUESSES = 6;
const STATS_KEY = "holodle-endless-stats";

interface EndlessState {
  current: {
    answer: Talent;
    guesses: { talent: Talent; result: CompareResult }[];
    gameOver: boolean;
    won: boolean;
  };
  stats: {
    streak: number;
    bestStreak: number;
    totalPlayed: number;
    totalWon: number;
  };
  recentTalents: string[];
}

function getRandomTalent(exclude: string[] = []): Talent {
  const pool = ALL_TALENTS.filter((t) => !exclude.includes(t.name));
  const source = pool.length > 0 ? pool : ALL_TALENTS;
  return source[Math.floor(Math.random() * source.length)];
}

function getInitialState(): EndlessState {
  const defaultStats = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 };
  let stats = defaultStats;
  let recentTalents: string[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        stats = parsed.stats ?? defaultStats;
        recentTalents = parsed.recentTalents ?? [];
      }
    } catch {}
  }

  const answer = getRandomTalent(recentTalents);
  return {
    current: { answer, guesses: [], gameOver: false, won: false },
    stats,
    recentTalents: [...recentTalents, answer.name].slice(-20),
  };
}

function EndlessGame({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [state, setState] = useState<EndlessState>(getInitialState);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Talent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { current, stats } = state;
  const guessesLeft = MAX_GUESSES - current.guesses.length;
  const alreadyGuessed = current.guesses.map((g) => g.talent.name);

  useEffect(() => {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        stats: state.stats,
        recentTalents: state.recentTalents,
      })
    );
  }, [state.stats, state.recentTalents]);

  const handleInput = useCallback(
    (val: string) => {
      setInput(val);
      if (val.trim().length > 0) {
        setSuggestions(searchTalents(val).filter((t) => !alreadyGuessed.includes(t.name)));
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    },
    [alreadyGuessed]
  );

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (current.gameOver) return;
      const result = compareTalents(talent, current.answer);
      const won = talent.name === current.answer.name;
      const newGuesses = [...current.guesses, { talent, result }];
      const gameOver = won || newGuesses.length >= MAX_GUESSES;

      setState((prev) => ({
        ...prev,
        current: { ...prev.current, guesses: newGuesses, gameOver, won },
        stats: gameOver
          ? {
              streak: won ? prev.stats.streak + 1 : 0,
              bestStreak: won
                ? Math.max(prev.stats.bestStreak, prev.stats.streak + 1)
                : prev.stats.bestStreak,
              totalPlayed: prev.stats.totalPlayed + 1,
              totalWon: prev.stats.totalWon + (won ? 1 : 0),
            }
          : prev.stats,
      }));

      setInput("");
      setSuggestions([]);
      setShowDropdown(false);
    },
    [current]
  );

  function nextRound() {
    const next = getRandomTalent(state.recentTalents);
    setState((prev) => ({
      ...prev,
      current: { answer: next, guesses: [], gameOver: false, won: false },
      recentTalents: [...prev.recentTalents, next.name].slice(-20),
    }));
    setInput("");
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      )
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function UserAvatar({ userId }: { userId: string }) {
    const [pictureUrl, setPictureUrl] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem("token"); // or from cookies/context

      fetch(`${API_ENDPOINTS.apiUrl}/api/v1/user/${userId}/picture`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setPictureUrl(data.pictureUrl));
    }, [userId]);

    if (!pictureUrl) return <div>Loading...</div>;

    return <img src={pictureUrl} alt="User avatar" width={100} height={100} />;
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      {/* <Navbar title="ENDLESS" /> */}
      <VsiNavbar title="ENDLESS" user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <PageHeader
            subtitle="Daily Hololive Talent Guessing Game"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          <h1
            className="text-4xl font-black tracking-widest mb-1"
            style={{ fontFamily: "'Poppins', sans-serif", color: "var(--holo-text)" }}
          ></h1>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
            style={{
              background: "white",
              borderColor: "var(--holo-border)",
              color: "var(--holo-text-muted)",
            }}
          >
            {current.gameOver ? (
              current.won ? (
                "Correct! Ready for the next one?"
              ) : (
                "Wrong — try the next one!"
              )
            ) : (
              <>
                <span style={{ color: "var(--holo-blue)" }}>●</span> {guessesLeft} guess
                {guessesLeft !== 1 ? "es" : ""} remaining
              </>
            )}
          </div>
        </div>

        {/* How to play */}
        {showHowTo && <HowToPlay maxGuesses={MAX_GUESSES} classic={false} />}

        {/* Stats bar */}
        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {/* Game over */}
        {current.gameOver && (
          <div
            className={`${current.won ? "win-banner" : "lose-banner"} rounded-2xl p-5 mb-5 text-center animate-bounce-in`}
          >
            {current.won ? (
              <>
                <div className="text-3xl mb-1">🎊</div>
                <h2 className="text-xl font-black text-green-600">Correct!</h2>
                <p className="text-sm text-green-700 mt-1">
                  It was <strong>{current.answer.name}</strong> — {current.guesses.length} guess
                  {current.guesses.length !== 1 ? "es" : ""}
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-1">😔</div>
                <h2 className="text-xl font-black text-red-500">Not quite!</h2>
                <p className="text-sm text-red-600 mt-1">
                  It was <strong>{current.answer.name}</strong>
                </p>
              </>
            )}
            <button
              onClick={nextRound}
              className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
              style={{ background: "var(--holo-blue)" }}
            >
              Next talent →
            </button>
          </div>
        )}

        {/* Input */}
        {!current.gameOver && (
          <TalentSearchInput
            input={input}
            suggestions={suggestions}
            showDropdown={showDropdown}
            onInput={handleInput}
            onGuess={makeGuess}
            onClear={() => {
              setInput("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            onFocus={() => input && suggestions.length > 0 && setShowDropdown(true)}
            dropdownRef={dropdownRef}
          />
        )}

        {/* Column headers */}
        {current.guesses.length > 0 && (
          <ColumnHeaders
            headers={[
              "Talent",
              "Name",
              "Branch",
              "Debut Year",
              "Archetype",
              "Height",
              "Birth Month",
            ]}
          />
        )}

        {/* Guess rows */}
        <div className="space-y-2">
          {current.guesses.map(({ talent, result }, i) => (
            <GuessRow key={talent.name} guess={talent} result={result} index={i} />
          ))}
        </div>

        {/* Empty state */}
        {!current.gameOver && current.guesses.length === 0 && (
          <div className="text-center py-14">
            <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
              Start typing to make your first guess!
            </p>
            <p className="text-xs mt-1 opacity-50" style={{ color: "var(--holo-text-muted)" }}>
              {ALL_TALENTS.length} talents in the pool
            </p>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}

export default function VsiGiveawayPage() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--holo-bg)" }}
      >
        <span
          className="text-sm font-semibold animate-pulse"
          style={{ color: "var(--holo-text-muted)" }}
        >
          Loading…
        </span>
      </main>
    );
  }

  if (!user) return <AuthGate onLogin={login} />;

  return <EndlessGame user={user} onLogout={logout} />;
}
