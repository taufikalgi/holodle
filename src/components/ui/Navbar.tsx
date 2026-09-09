"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import DesktopNav from "@/components/ui/DesktopNav";
import MobileNav from "@/components/ui/MobileNav";
import AuthCluster from "@/components/ui/AuthCluster";

export default function Navbar({
  title,
  user: userProp,
  onLogout: onLogoutProp,
  onLogin: onLoginProp,
}: {
  title: string;
  user?: AuthUser | null;
  onLogout?: () => void;
  onLogin?: (redirectTo?: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const isCategoryActive = (id: string) => pathname.startsWith(`/${id}`);
  const { user: authUser, loading: authLoading, login: authLogin, logout: authLogout } = useAuth();
  const hasExternalUser = userProp !== undefined;
  const user = hasExternalUser ? (userProp as AuthUser | null) : authUser;
  const effectiveLoading = hasExternalUser ? false : authLoading;
  const onLogout = onLogoutProp ?? authLogout;
  const handleLogin = () => {
    if (onLoginProp) {
      onLoginProp(pathname);
    } else {
      authLogin(pathname);
    }
  };

  const toggleCategory = (id: string) => setOpenCategory((prev) => (prev === id ? null : id));
  const toggleExpanded = (id: string) => setExpandedCategory((prev) => (prev === id ? null : id));
  const onNavigate = () => {
    setIsOpen(false);
    setExpandedCategory(null);
  };

  return (
    <nav
      className="w-full border-b"
      style={{ background: "var(--holo-bg-card)", borderColor: "var(--holo-border)" }}
    >
      <div className="px-4 py-3 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm font-bold transition-colors hover:opacity-70"
          style={{ color: "var(--holo-blue)" }}
        >
          ← Home
        </Link>

        {/* Desktop links */}
        <DesktopNav
          openCategory={openCategory}
          onToggleCategory={toggleCategory}
          onClose={() => setOpenCategory(null)}
          isActive={isActive}
          isCategoryActive={isCategoryActive}
        />

        {/* Right-side cluster */}
        <div className="ml-auto flex items-center gap-3">
          <AuthCluster user={user} loading={effectiveLoading} onLogin={handleLogin} onLogout={onLogout} />

          {/* Hamburger button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span
              className="block h-0.5 w-5 transition-all duration-300 origin-center"
              style={{
                background: "var(--holo-text)",
                transform: isOpen ? "translateY(8px) rotate(45deg)" : "",
              }}
            />
            <span
              className="block h-0.5 w-5 transition-all duration-300"
              style={{
                background: "var(--holo-text)",
                opacity: isOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-0.5 w-5 transition-all duration-300 origin-center"
              style={{
                background: "var(--holo-text)",
                transform: isOpen ? "translateY(-8px) rotate(-45deg)" : "",
              }}
            />
          </button>

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] border-t" : "max-h-0"
        }`}
        style={{ borderColor: "var(--holo-border)" }}
      >
        <div className="px-4 py-3 flex flex-col gap-2">
          <MobileNav
            expandedCategory={expandedCategory}
            onToggleExpanded={toggleExpanded}
            onNavigate={onNavigate}
            isActive={isActive}
            isCategoryActive={isCategoryActive}
          />

          {/* Mobile auth */}
          <AuthCluster
            user={user}
            loading={effectiveLoading}
            onLogin={handleLogin}
            onLogout={onLogout}
            mobile
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </nav>
  );
}
