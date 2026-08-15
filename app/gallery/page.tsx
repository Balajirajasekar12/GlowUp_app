"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";
import RatingStars from "@/components/RatingStars";
import Lightbox from "@/components/Lightbox";

type GalleryPhoto = {
  id: string;
  user_id: string;
  storage_path: string;
  url: string;
  avgScore: number | null;
  ratingCount: number;
};

export default function GalleryPage() {
  const { user } = useUser();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    loadPhotos();
  }, []);

  async function loadPhotos() {
    setLoading(true);

    const { data: photoRows } = await supabase
      .from("photos")
      .select("id, user_id, storage_path")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (!photoRows) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const { data: ratingRows } = await supabase
      .from("ratings")
      .select("photo_id, score")
      .in("photo_id", photoRows.map((p) => p.id));

    const withRatings = photoRows.map((p) => {
      const scores = (ratingRows ?? [])
        .filter((r) => r.photo_id === p.id)
        .map((r) => r.score);
      const avgScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : null;
      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(p.storage_path);

      return {
        ...p,
        url: urlData.publicUrl,
        avgScore,
        ratingCount: scores.length,
      };
    });

    setPhotos(withRatings);
    setLoading(false);
  }

  return (
    <div className="fade-in">
      <h1 className="font-display text-3xl font-medium">Public Gallery</h1>
      <div className="mt-4 rounded-lg border border-rose bg-rose/10 p-4 text-sm text-ink">
        <strong>18+ only.</strong> Before real launch, gate this page and the
        publish flow behind a verified identity-verification provider
        (Stripe Identity, Persona, Veriff) and check{" "}
        <code className="font-mono">profiles.is_age_verified</code> — see
        README.md. This starter enforces login but not age verification yet.
      </div>

      <div className="vanity-lights mt-8">
        <span></span><span></span><span></span><span></span><span></span>
      </div>

      {!isSupabaseConfigured ? (
        <p className="mt-6 text-center text-sm text-gray-500">
          Configure Supabase in <code className="font-mono">.env.local</code>{" "}
          to enable the public gallery — see README.md, step 3.
        </p>
      ) : loading ? (
        <p className="mt-6 text-center text-sm text-gray-500">Loading...</p>
      ) : photos.length === 0 ? (
        <p className="mt-6 text-center text-sm text-gray-500">
          No public photos yet. Publish one from the{" "}
          <a href="/upload" className="underline">
            upload page
          </a>
          .
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="rounded-lg border bg-white p-4">
              <button onClick={() => setLightboxSrc(photo.url)}>
                <img
                  src={photo.url}
                  alt="Gallery photo"
                  className="h-48 w-full cursor-zoom-in rounded object-cover"
                />
              </button>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-gray-500">
                  {photo.avgScore
                    ? `★ ${photo.avgScore.toFixed(1)} (${photo.ratingCount})`
                    : "No ratings yet"}
                </span>
              </div>
              <div className="mt-2">
                <RatingStars
                  photoId={photo.id}
                  disableIfOwn={user?.id === photo.user_id}
                  onRated={loadPhotos}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt="Full-size gallery photo"
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}
