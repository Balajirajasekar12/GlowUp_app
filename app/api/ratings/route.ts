import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// NOTE: In production, verify the requester is an authenticated,
// age-verified user, and is not rating their own photo, before insert.
// Row Level Security policies in supabase/schema.sql also enforce this
// server-side as a second layer of defense.
export async function POST(req: NextRequest) {
  const { photoId, score, raterId } = await req.json();

  if (!photoId || !score || score < 1 || score > 5) {
    return NextResponse.json(
      { error: "photoId and a score between 1-5 are required" },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  const { data: photo } = await admin
    .from("photos")
    .select("user_id, is_public")
    .eq("id", photoId)
    .single();

  if (!photo || !photo.is_public) {
    return NextResponse.json({ error: "Photo is not public" }, { status: 404 });
  }
  if (photo.user_id === raterId) {
    return NextResponse.json(
      { error: "You can't rate your own photo" },
      { status: 403 }
    );
  }

  const { error } = await admin
    .from("ratings")
    .upsert(
      { photo_id: photoId, rater_id: raterId, score },
      { onConflict: "photo_id,rater_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
