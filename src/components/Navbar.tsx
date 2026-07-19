"use client";

import { Anvil, Menu, X, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-provider";

const navLinks = [
  { label: "Playground", href: "#playground" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "#" },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
            <Anvil className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            PromptForge
          </span>
          <span className="hidden sm:inline-flex items-center rounded-md border border-accent/20 bg-accent/5 px-1.5 py-0.5 text-[10px] font-medium text-accent">
            AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-9 rounded-full bg-card animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-semibold transition-all hover:bg-accent/25 hover:ring-2 hover:ring-accent/30"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl shadow-black/20 fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.user_metadata?.name ?? user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted transition-colors hover:bg-accent/10 hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted transition-all hover:border-border-hover hover:text-foreground"
              >
                Sign in
              </Link>
              <a
                href="#"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/10"
              >
                Get Started
              </a>
            </>
          )}
        </div>

        <button
          className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-muted hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl fade-in">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {loading ? null : user ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-semibold">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.user_metadata?.name ?? user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted transition-all hover:border-border-hover hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-center text-muted transition-all hover:border-border-hover hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                  <a
                    href="#"
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white text-center transition-all hover:bg-accent-glow"
                  >
                    Get Started
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
