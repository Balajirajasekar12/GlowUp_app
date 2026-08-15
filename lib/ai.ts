/**
 * AI integration layer.
 *
 * Every function has a MOCK implementation (default, free, no key needed)
 * and a REAL implementation using Replicate (https://replicate.com) as the
 * example provider, since it hosts ready-to-call open-source models for
 * both vision analysis and image generation/editing behind one simple API
 * and a pay-per-call pricing model (no fixed GPU rental).
 *
 * Honesty check on realism: image-editing/virtual-try-on models are good
 * in 2026 but not perfect — expect strong results for outfit try-on and
 * hairstyle/color changes, and more modest, sometimes imperfect results
 * for fine-grained skin texture changes. Always keep the "AI-simulated
 * preview" label in the UI; don't present these as guaranteed outcomes.
 */

export type AnalysisResult = {
  skin: { summary: string; tags: string[] };
  hair: { summary: string; tags: string[] };
  faceShape: string;
  disclaimer: string;
};

export async function analyzePhoto(imageUrl: string): Promise<AnalysisResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    // ---- MOCK MODE ----
    return {
      skin: {
        summary:
          "Generally even tone with some visible dryness around the cheek area.",
        tags: ["dry-prone", "even-tone"],
      },
      hair: {
        summary: "Wavy texture, medium density, some visible frizz.",
        tags: ["wavy", "medium-density", "frizz-prone"],
      },
      faceShape: "oval",
      disclaimer:
        "This is an AI-generated general suggestion, not a dermatological or professional assessment.",
    };
  }

  // ---- REAL MODE: vision-language model via Replicate ----
  // Uses a Qwen2.5-VL model. Swap the "version" hash for whichever
  // vision model you prefer on https://replicate.com/explore
  const prediction = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: process.env.REPLICATE_VLM_VERSION, // set in .env.local
      input: {
        image: imageUrl,
        prompt:
          "Analyze this photo's skin and hair in plain, non-medical " +
          "language. Return strict JSON matching: " +
          '{"skin":{"summary":"","tags":[]},"hair":{"summary":"","tags":[]},"faceShape":""}',
      },
    }),
  });

  const result = await pollReplicate(prediction, apiToken);
  const parsed = JSON.parse(result);

  return {
    ...parsed,
    disclaimer:
      "This is an AI-generated general suggestion, not a dermatological or professional assessment.",
  };
}

export type PreviewMode = "style" | "outfit";

export async function generatePreviewImage(
  imageUrl: string,
  stylePrompt: string,
  mode: PreviewMode = "style",
  garmentImageUrl?: string
): Promise<{ previewUrl: string; label: string; isMock: boolean }> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  const realLabel = "AI-simulated preview — not a guaranteed real-life result";

  if (!apiToken) {
    // ---- MOCK MODE: returns the original photo unchanged, and says so
    // clearly. Without this explicit label, a mock result looks
    // indistinguishable from a real one — which is misleading, not just
    // unfinished. ----
    return {
      previewUrl: imageUrl,
      label:
        "Demo mode — no AI model connected yet, so this is your original " +
        "photo, unchanged. Set up Replicate (see README.md) to generate a " +
        "real preview.",
      isMock: true,
    };
  }

  // ---- REAL MODE ----
  if (mode === "outfit" && garmentImageUrl) {
    // Virtual try-on: person photo + flat garment photo -> person wearing it.
    // Example model: an IDM-VTON / OOTDiffusion-style try-on model.
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: process.env.REPLICATE_TRYON_VERSION, // set in .env.local
        input: { human_img: imageUrl, garm_img: garmentImageUrl },
      }),
    });
    const outputUrl = await pollReplicate(prediction, apiToken);
    return { previewUrl: outputUrl, label: realLabel, isMock: false };
  }

  // Style edit: hair/skin look change via an image-editing model
  // (e.g. Qwen-Image-Edit). Swap version hash for your chosen model.
  const prediction = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: process.env.REPLICATE_IMAGE_EDIT_VERSION, // set in .env.local
      input: { image: imageUrl, prompt: stylePrompt },
    }),
  });
  const outputUrl = await pollReplicate(prediction, apiToken);
  return { previewUrl: outputUrl, label: realLabel, isMock: false };
}

// Replicate predictions are async: create, then poll until done.
async function pollReplicate(
  createRes: Response,
  apiToken: string
): Promise<string> {
  const created = await createRes.json();
  let prediction = created;

  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed"
  ) {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      { headers: { Authorization: `Bearer ${apiToken}` } }
    );
    prediction = await poll.json();
  }

  if (prediction.status === "failed") {
    throw new Error(`Replicate prediction failed: ${prediction.error}`);
  }

  // Output shape varies by model — usually a string URL or array of URLs.
  const output = prediction.output;
  return Array.isArray(output) ? output[0] : output;
}
