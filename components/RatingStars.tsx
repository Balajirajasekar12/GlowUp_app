"use client";

import { useState } from "react";
import { useUser } from "@/lib/useUser";
import { useRouter } from "next/navigation";

export default function RatingStars({
  photoId,
  disableIfOwn = false,
  onRated,
}: {
  photoId: string;
  disableIfOwn?: boolean;
  onRated?: (score: number) => void;
}) {
  const { user } = useUser();
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRating(value: number) {
    if (!user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setError(null);
    setScore(value);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, score: value, raterId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Couldn't submit rating");
        setScore(null);
        return;
      }
      onRated?.(value);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            disabled={submitting || disableIfOwn}
            onClick={() => submitRating(n)}
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            className={`text-xl ${
              score && n <= score ? "text-brass" : "text-gray-300"
            } hover:text-brass-light disabled:cursor-not-allowed`}
          >
            ★
          </button>
        ))}
      </div>
      {!user && (
        <p className="mt-1 text-xs text-gray-500">Sign in to rate this photo.</p>
      )}
      {disableIfOwn && (
        <p className="mt-1 text-xs text-gray-500">You can't rate your own photo.</p>
      )}
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </div>
  );
}
