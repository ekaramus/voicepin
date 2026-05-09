import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AudioUrlRequestBody = {
  messageId?: unknown;
};

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Missing audio URL environment configuration");

    return NextResponse.json(
      { error: "Server audio URL environment is not configured." },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 }
    );
  }

  const body = (await request.json()) as AudioUrlRequestBody;
  const messageId = body.messageId;

  if (typeof messageId !== "string") {
    return NextResponse.json(
      { error: "messageId is required." },
      { status: 400 }
    );
  }

  const userSupabase = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });

  const { data: message, error: messageError } = await userSupabase
    .from("messages")
    .select("id, audio_path")
    .eq("id", messageId)
    .single();

  if (messageError || !message?.audio_path) {
    return NextResponse.json(
      { error: "Audio message was not found or is not accessible." },
      { status: 404 }
    );
  }

  const serviceSupabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await serviceSupabase.storage
    .from("voice-messages")
    .createSignedUrl(message.audio_path, 60 * 5);

  if (error || !data?.signedUrl) {
    console.error("Failed to create signed audio URL", error);

    return NextResponse.json(
      { error: "Could not create signed audio URL." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    audioUrl: data.signedUrl,
  });
}