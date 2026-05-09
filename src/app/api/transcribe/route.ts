import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type TranscriptionRequestBody = {
  messageId?: unknown;
  audioPath?: unknown;
};

type ElevenLabsTranscriptionResponse = {
  text?: string;
  detail?: unknown;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !anonKey || !serviceRoleKey) {
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

  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { 
        error: "Authentication is required.", 
      },
      { 
        status: 401, 
      }
    );
  }

  const body = (await request.json()) as TranscriptionRequestBody;

  const messageId = body.messageId;
  const audioPath = body.audioPath;

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

  if (typeof audioPath !== "string") {
    return NextResponse.json(
      { 
        error: "audioPath is required.", 
      },
      { 
        status: 400, 
      }
    );
  }

  const userSupabase = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });

  const { data: accessibleMessage, error: accessError } = await userSupabase
    .from("messages")
    .select("id, audio_path")
    .eq("id", messageId)
    .single();

  if (accessError || !accessibleMessage) {
    return NextResponse.json(
      { 
        error: "Message was not found or is not accessible.",
      },
      { 
        status: 404, 
      }
    );
  }

  if (accessibleMessage.audio_path !== audioPath) {
    return NextResponse.json(
      { 
        error: "audioPath does not match message.", 
      },
      { 
        status: 403, 
      }
    );
  }

  const serviceSupabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: audioBlob, error: downloadError } =
      await serviceSupabase.storage.from("voice-messages").download(audioPath);

    if (downloadError || !audioBlob) {
      console.error("Failed to download audio for transcription", downloadError);

      await serviceSupabase
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

      await serviceSupabase
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

    const { error: updateError } = await serviceSupabase
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

    await serviceSupabase
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