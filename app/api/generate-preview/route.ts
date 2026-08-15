import { NextRequest, NextResponse } from "next/server";
import { generatePreviewImage, PreviewMode } from "@/lib/ai";

// NOTE: In production, gate this route behind an 18+ / identity-verified
// session check before calling generatePreviewImage. See README.md.
export async function POST(req: NextRequest) {
  const { imageUrl, stylePrompt, mode, garmentImageUrl } = await req.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const result = await generatePreviewImage(
    imageUrl,
    stylePrompt ?? "",
    (mode as PreviewMode) ?? "style",
    garmentImageUrl
  );
  return NextResponse.json(result);
}
