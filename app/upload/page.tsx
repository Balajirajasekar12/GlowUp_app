"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/ai";
import { Product, groupByBudget, BUDGET_LABELS, Budget } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Lightbox from "@/components/Lightbox";
import { useUser } from "@/lib/useUser";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function UploadPage() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [afterImage, setAfterImage] = useState<{
    previewUrl: string;
    label: string;
    isMock: boolean;
  } | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<
    "idle" | "publishing" | "done" | "error"
  >("idle");
  const [publishError, setPublishError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setAnalysis(null);
    setProducts([]);
    setAfterImage(null);
    setPublishStatus("idle");

    if (!selected) {
      setPreviewUrl(null);
      return;
    }

    // Use a data URL, not URL.createObjectURL(). A blob: URL only works
    // inside this browser tab — it can't be fetched by a server-side API
    // call, which breaks real AI generation once Replicate is connected.
    // A data URL is self-contained and works both for local preview and
    // for sending to a real model.
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleAnalyze() {
    if (!previewUrl) return;
    setLoading(true);
    setLoadingLabel("Analyzing your photo...");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: previewUrl }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }

  async function handleStylePreview() {
    if (!previewUrl) return;
    setLoading(true);
    setLoadingLabel("Generating your look preview...");
    try {
      const res = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: previewUrl,
          stylePrompt: "suggested skin/hair refresh based on the analysis",
          mode: "style",
        }),
      });
      setAfterImage(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleTryOn(product: Product) {
    if (!previewUrl) return;
    setLoading(true);
    setLoadingLabel(`Trying on "${product.name}"...`);
    try {
      const res = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: previewUrl,
          mode: "outfit",
          // OK to be empty in mock mode — real mode needs a real garment
          // photo set on the product (see lib/products.ts).
          garmentImageUrl: product.garmentImageUrl || "",
        }),
      });
      const data = await res.json();
      setAfterImage(data);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!file || !user) return;
    setPublishStatus("publishing");
    setPublishError(null);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("photos").insert({
        user_id: user.id,
        storage_path: path,
        is_public: true,
      });
      if (insertError) throw insertError;

      setPublishStatus("done");
    } catch (err) {
      setPublishStatus("error");
      setPublishError(err instanceof Error ? err.message : "Publish failed");
    }
  }

  const grouped = groupByBudget(products);
  const tierOrder: Budget[] = ["high", "medium", "low"];

  return (
    <div className="fade-in space-y-10">
      <div>
        <h1 className="font-display text-3xl font-medium">Upload your photo</h1>
        <p className="mt-1 text-sm text-gray-600">
          Your photo stays private in your browser unless you choose to
          publish it to the gallery below.
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block text-sm"
      />

      {previewUrl && (
        <div className="flex flex-col gap-6 sm:flex-row">
          <button onClick={() => setLightboxSrc(previewUrl)}>
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="mirror-frame h-56 w-56 cursor-zoom-in object-cover"
            />
          </button>
          <div className="flex flex-col justify-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-porcelain hover:bg-ink-soft disabled:opacity-50"
            >
              {loading ? loadingLabel : "Analyze photo"}
            </button>
            {analysis && (
              <button
                onClick={handleStylePreview}
                disabled={loading}
                className="rounded-full border border-brass px-5 py-2.5 text-sm font-medium text-ink hover:bg-brass/10 disabled:opacity-50"
              >
                Generate "after" preview (18+)
              </button>
            )}

            {/* Publish to public gallery — 18+, explicit opt-in per photo */}
            {!isSupabaseConfigured ? (
              <p className="max-w-xs text-xs text-gray-500">
                Publishing to the gallery needs Supabase configured — see
                README.md, step 3.
              </p>
            ) : !user ? (
              <a
                href="/login"
                className="text-sm text-gray-600 underline hover:text-ink"
              >
                Sign in to publish this to the public gallery (18+)
              </a>
            ) : publishStatus === "done" ? (
              <p className="text-sm text-sage">
                Published — view it in the{" "}
                <a href="/gallery" className="underline">
                  gallery
                </a>
                .
              </p>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishStatus === "publishing"}
                className="rounded-full border border-rose px-5 py-2.5 text-sm font-medium text-ink hover:bg-rose/10 disabled:opacity-50"
              >
                {publishStatus === "publishing"
                  ? "Publishing..."
                  : "Publish to public gallery (18+)"}
              </button>
            )}
            {publishStatus === "error" && (
              <p className="text-xs text-rose">{publishError}</p>
            )}
          </div>
        </div>
      )}

      {analysis && (
        <div className="rounded-lg border bg-white p-5">
          <h2 className="font-display text-lg font-medium">Analysis</h2>
          <p className="mt-2 text-sm">
            <strong>Skin:</strong> {analysis.skin.summary}
          </p>
          <p className="mt-1 text-sm">
            <strong>Hair:</strong> {analysis.hair.summary}
          </p>
          <p className="mt-1 text-sm">
            <strong>Face shape:</strong> {analysis.faceShape}
          </p>
          <p className="mt-3 text-xs italic text-gray-500">
            {analysis.disclaimer}
          </p>
        </div>
      )}

      {afterImage && (
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-medium">Simulated preview</h2>
            {afterImage.isMock && (
              <span className="rounded-full bg-rose/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-rose">
                Demo — not real AI output
              </span>
            )}
          </div>
          <button onClick={() => setLightboxSrc(afterImage.previewUrl)}>
            <img
              src={afterImage.previewUrl}
              alt="AI-simulated after preview"
              className="mirror-frame mt-3 h-56 w-56 cursor-zoom-in object-cover"
            />
          </button>
          <p className="mt-2 text-xs text-gray-500">Click the photo to view full size.</p>
          <p className="mt-3 text-xs italic text-gray-500">{afterImage.label}</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-8">
          <div className="vanity-lights">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <h2 className="text-center font-display text-2xl font-medium">
            Recommended for you
          </h2>

          {tierOrder.map((tier) =>
            grouped[tier].length > 0 ? (
              <div key={tier}>
                <div className="mb-3 flex items-baseline gap-2">
                  <h3 className="font-display text-lg font-medium">
                    {BUDGET_LABELS[tier].label}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-wide text-gray-400">
                    {BUDGET_LABELS[tier].blurb}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {grouped[tier].map((p) => (
                    <ProductCard key={p.id} product={p} onTryOn={handleTryOn} />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt="Full-size photo"
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}
