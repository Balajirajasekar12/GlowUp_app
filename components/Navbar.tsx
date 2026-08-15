"use client";

import Link from "next/link";
import { useUser } from "@/lib/useUser";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function Navbar() {
  const { user } = useUser();

  return (
    <header className="bg-ink text-porcelain">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link href="/" className="font-display text-2xl tracking-tight text-brass-light">
          GlowUp
        </Link>
        <div className="flex items-center gap-7 font-body text-sm text-porcelain/80">
          <Link href="/upload" className="hover:text-brass-light">
            Upload
          </Link>
          <Link href="/gallery" className="hover:text-brass-light">
            Gallery <span className="text-rose">18+</span>
          </Link>
          <Link href="/feedback" className="hover:text-brass-light">
            Feedback
          </Link>
          {isSupabaseConfigured && user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="hover:text-brass-light"
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" className="hover:text-brass-light">
              Sign in
            </Link>
          )}
        </div>
      </nav>
      <div className="vanity-lights on-dark">
        <span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </header>
  );
}
