"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/useUser";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function Navbar() {
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const AuthLink = () =>
    isSupabaseConfigured && user ? (
      <button
        onClick={() => {
          supabase.auth.signOut();
          setMenuOpen(false);
        }}
        className="text-left hover:text-brass-light"
      >
        Sign out
      </button>
    ) : (
      <Link href="/login" onClick={() => setMenuOpen(false)} className="hover:text-brass-light">
        Sign in
      </Link>
    );

  return (
    <header className="bg-ink text-porcelain">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link href="/" className="font-display text-2xl tracking-tight text-brass-light">
          GlowUp
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 font-body text-sm text-porcelain/80 md:flex">
          <Link href="/upload" className="hover:text-brass-light">
            Upload
          </Link>
          <Link href="/gallery" className="hover:text-brass-light">
            Gallery <span className="text-rose">18+</span>
          </Link>
          <Link href="/feedback" className="hover:text-brass-light">
            Feedback
          </Link>
          <AuthLink />
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-porcelain transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-6 bg-porcelain transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-6 bg-porcelain transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile nav panel */}
      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-porcelain/10 px-4 py-5 font-body text-sm text-porcelain/80 md:hidden">
          <Link href="/upload" onClick={() => setMenuOpen(false)} className="hover:text-brass-light">
            Upload
          </Link>
          <Link href="/gallery" onClick={() => setMenuOpen(false)} className="hover:text-brass-light">
            Gallery <span className="text-rose">18+</span>
          </Link>
          <Link href="/feedback" onClick={() => setMenuOpen(false)} className="hover:text-brass-light">
            Feedback
          </Link>
          <AuthLink />
        </div>
      )}

      <div className="vanity-lights on-dark">
        <span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </header>
  );
}
