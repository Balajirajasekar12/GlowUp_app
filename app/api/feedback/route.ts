import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const { type, message, userId } = await req.json();

  if (!message || !type) {
    return NextResponse.json(
      { error: "type and message are required" },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("feedback")
    .insert({ type, message, user_id: userId ?? null });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
