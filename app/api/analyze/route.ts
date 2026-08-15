import { NextRequest, NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/ai";
import { recommendProducts } from "@/lib/products";

export async function POST(req: NextRequest) {
  const { imageUrl } = await req.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const analysis = await analyzePhoto(imageUrl);
  const tags = [...analysis.skin.tags, ...analysis.hair.tags, analysis.faceShape];
  const products = recommendProducts(tags);

  return NextResponse.json({ analysis, products });
}
