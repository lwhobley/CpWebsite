"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask about Texas food safety, TABC rules, ADA readiness, Houston health code, inventory variance, or audit corrective actions.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setPrompt("");
    setLoading(true);

    const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gemini`
      : "";

    try {
      if (!functionUrl) throw new Error("Missing Supabase URL");

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}`,
        },
        body: JSON.stringify({ mode: "chat", prompt, history: nextMessages }),
      });
      const data = (await response.json()) as { response?: string; error?: string };
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.response ??
            data.error ??
            "Gemini is ready once Supabase and the edge function are configured.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "The edge function is not reachable yet. Configure the Supabase env vars to enable live AI responses.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Assistant scope</p>
        <h2 className="section-title mt-2 text-3xl">Gemini RAG chat</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
          <li>English and Spanish prompting</li>
          <li>Grounded on Texas food safety, TABC, ADA, and Houston health code</li>
          <li>Vision mode for audit photos and shelf counts through the edge function</li>
          <li>Server-side only key handling via Supabase Edge Functions</li>
        </ul>
      </Card>

      <Card className="flex min-h-[520px] flex-col">
        <div className="space-y-4 overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-[24px] px-4 py-4 ${message.role === "assistant" ? "bg-white" : "bg-[var(--green)] text-white"}`}
            >
              <p className="text-xs uppercase tracking-[0.22em] opacity-70">{message.role}</p>
              <p className="mt-2 text-sm leading-7">{message.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="mt-4 flex gap-3">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            className="min-h-24 flex-1 rounded-[24px] border border-[var(--border)] bg-white px-4 py-4 outline-none"
            placeholder="Ask the assistant about compliance, inventory, or corrective action..."
          />
          <Button type="submit" className="self-end" disabled={loading}>
            {loading ? "Thinking" : "Send"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
