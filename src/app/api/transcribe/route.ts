import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type TranscriptionResponse = {
  text?: string;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server transcription environment is not configured." },
      { status: 500 }
    );
  }

  const body = await request.json();

  const messageId = body.messageId;
  const audioUrl = body.audioUrl;

  if (typeof messageId !== "string" || typeof audioUrl !== "string") {
    return NextResponse.json(
      { error: "messageId and audioUrl are required." },
      { status: 400 }
    );
  }

  const audioResponse = await fetch(audioUrl);

  if (!audioResponse.ok) {
    return NextResponse.json(
      { error: "Could not download audio for transcription." },
      { status: 400 }
    );
  }

  const audioBlob = await audioResponse.blob();

  const formData = new FormData();
  formData.append("file", audioBlob, "voicepin.webm");
  formData.append("model_id", "scribe_v2");
  formData.append("language_code", "pol");

  const transcriptionResponse = await fetch(
    "https://api.elevenlabs.io/v1/speech-to-text",
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: formData,
    }
  );

  const transcriptionJson =
    (await transcriptionResponse.json()) as TranscriptionResponse;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  if (!transcriptionResponse.ok || !transcriptionJson.text) {
    await supabase
      .from("messages")
      .update({
        transcription_status: "failed",
      })
      .eq("id", messageId);

    return NextResponse.json(
      { error: "Transcription failed." },
      { status: 502 }
    );
  }

  await supabase
    .from("messages")
    .update({
      transcript: transcriptionJson.text,
      transcription_status: "ready",
    })
    .eq("id", messageId);

  return NextResponse.json({
    transcript: transcriptionJson.text,
  });
}