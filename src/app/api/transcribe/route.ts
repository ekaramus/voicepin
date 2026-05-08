import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ElevenLabsTranscriptionResponse = {
  text?: string;
  detail?: unknown;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing transcription environment configuration");

    return NextResponse.json(
      {
        error: "Server transcription environment is not configured.",
      },
      {
        status: 500,
      }
    );
  }

  const body = await request.json();

  const messageId = body.messageId;
  const audioUrl = body.audioUrl;

  if (typeof messageId !== "string") {
    return NextResponse.json(
      {
        error: "messageId is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (typeof audioUrl !== "string") {
    return NextResponse.json(
      {
        error: "audioUrl is required.",
      },
      {
        status: 400,
      }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      console.error("Failed to download audio for transcription", {
        status: audioResponse.status,
      });

      await supabase
        .from("messages")
        .update({
          transcription_status: "failed",
        })
        .eq("id", messageId);

      return NextResponse.json(
        {
          error: "Could not download audio for transcription.",
        },
        {
          status: 400,
        }
      );
    }

    const audioBlob = await audioResponse.blob();

    const formData = new FormData();
    formData.append("file", audioBlob, "voicepin.webm");
    formData.append("model_id", "scribe_v2");

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

    const transcriptionText = await transcriptionResponse.text();

    let transcriptionJson: ElevenLabsTranscriptionResponse = {};

    try {
      transcriptionJson = JSON.parse(transcriptionText);
    } catch {
      transcriptionJson = {};
    }

    if (!transcriptionResponse.ok || !transcriptionJson.text) {
      console.error("ElevenLabs transcription failed", {
        status: transcriptionResponse.status,
        detail: transcriptionJson.detail ?? transcriptionText,
      });

      await supabase
        .from("messages")
        .update({
          transcription_status: "failed",
        })
        .eq("id", messageId);

      return NextResponse.json(
        {
          error: "Transcription failed.",
          details:
            typeof transcriptionJson.detail === "object"
              ? JSON.stringify(transcriptionJson.detail)
              : transcriptionText,
        },
        {
          status: 502,
        }
      );
    }

    const { error: updateError } = await supabase
      .from("messages")
      .update({
        transcript: transcriptionJson.text,
        transcription_status: "ready",
      })
      .eq("id", messageId);

    if (updateError) {
      console.error("Failed to persist transcription", updateError);

      return NextResponse.json(
        {
          error: "Could not persist transcription.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      transcript: transcriptionJson.text,
    });
  } catch (error) {
    console.error("Unexpected transcription route failure", error);

    await supabase
      .from("messages")
      .update({
        transcription_status: "failed",
      })
      .eq("id", messageId);

    return NextResponse.json(
      {
        error: "Unexpected transcription failure.",
      },
      {
        status: 500,
      }
    );
  }
}