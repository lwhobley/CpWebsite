import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

type GeminiRequest = {
  mode: "vision" | "chat";
  prompt: string;
  image_base64?: string;
  history?: Array<{ role: string; content: string }>;
  session_id?: string;
};

const SYSTEM_PROMPT =
  "You are Enish Ops Hub Assistant. Ground every answer in Texas food safety law, TABC regulations, ADA accessibility requirements, and Houston health code. Answer in English unless asked for Spanish.";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const payload = (await request.json()) as GeminiRequest;

    if (!geminiKey) {
      return Response.json(
        { error: "Missing GEMINI_API_KEY for edge function." },
        { status: 500, headers: corsHeaders },
      );
    }

    const parts =
      payload.mode === "vision" && payload.image_base64
        ? [
            { text: `${SYSTEM_PROMPT}\n\n${payload.prompt}` },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: payload.image_base64,
              },
            },
          ]
        : [
            {
              text: `${SYSTEM_PROMPT}\n\nConversation history:\n${(payload.history ?? [])
                .map((message) => `${message.role}: ${message.content}`)
                .join("\n")}\n\nUser: ${payload.prompt}`,
            },
          ];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      },
    );

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("\n") ??
      "No Gemini output returned.";

    if (supabaseUrl && serviceRole && payload.session_id) {
      const admin = createClient(supabaseUrl, serviceRole, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await admin.from("assistant_messages").insert([
        { session_id: payload.session_id, role: "user", content: payload.prompt },
        { session_id: payload.session_id, role: "assistant", content: text },
      ]);
    }

    if (payload.mode === "vision") {
      return Response.json(
        {
          result: text.toLowerCase().includes("fail")
            ? "fail"
            : text.toLowerCase().includes("flag")
              ? "flag"
              : "pass",
          reasoning: text,
          corrective_action:
            "Review highlighted compliance issue, assign corrective owner, and re-audit before service.",
        },
        { headers: corsHeaders },
      );
    }

    return Response.json({ response: text }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown Gemini function error." },
      { status: 500, headers: corsHeaders },
    );
  }
});
