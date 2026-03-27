"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type StaffUser = {
  id: string;
  name: string;
  role: string;
};

export function LoginCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"pin" | "magic">("pin");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<StaffUser[]>([]);
  const [selected, setSelected] = useState<StaffUser | null>(null);
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const digits = useMemo(() => ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], []);

  const searchUsers = async (value: string) => {
    setQuery(value);
    setSelected(null);
    if (value.trim().length < 2) {
      setMatches([]);
      return;
    }

    const response = await fetch(`/api/staff-search?prefix=${encodeURIComponent(value)}`);
    const data = (await response.json()) as { users: StaffUser[] };
    setMatches(data.users);
  };

  const submitPin = async () => {
    if (!selected || pin.length !== 4) return;
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/auth/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected.id, pin }),
    });
    const data = (await response.json()) as { error?: string; redirectTo?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "PIN login failed.");
      setPin("");
      return;
    }

    router.push(data.redirectTo ?? "/dashboard");
    router.refresh();
  };

  const sendMagicLink = async () => {
    if (!email) return;
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await response.json()) as {
      error?: string;
      message?: string;
      redirectTo?: string;
    };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Magic link failed.");
      return;
    }

    setMessage(data.message ?? "Check your inbox for the magic link.");
    if (data.redirectTo) {
      router.push(data.redirectTo);
      router.refresh();
    }
  };

  return (
    <Card className="w-full max-w-xl rounded-[32px] p-6 md:p-8">
      <div className="text-center">
        <p className="font-serif text-4xl tracking-[0.18em] text-[var(--gold)]">ENISH</p>
        <h1 className="section-title mt-3 text-3xl">Enish Ops Hub</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Private staff access with role-aware workflows for Houston operations.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 rounded-full border border-[var(--border)] bg-[var(--background)] p-1">
        <button
          type="button"
          onClick={() => setMode("pin")}
          className={`rounded-full px-4 py-3 text-xs uppercase tracking-[0.24em] ${mode === "pin" ? "bg-[var(--green)] text-white" : "text-[var(--muted)]"}`}
        >
          Staff PIN
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`rounded-full px-4 py-3 text-xs uppercase tracking-[0.24em] ${mode === "magic" ? "bg-[var(--green)] text-white" : "text-[var(--muted)]"}`}
        >
          Manager Link
        </button>
      </div>

      {mode === "pin" ? (
        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Staff name lookup
            </label>
            <input
              value={query}
              onChange={(event) => void searchUsers(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
              placeholder="Type first 3 letters"
            />
          </div>

          {matches.length > 0 && !selected ? (
            <div className="grid gap-2">
              {matches.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelected(user)}
                  className="rounded-2xl border border-[var(--border)] px-4 py-4 text-left hover:border-[var(--gold)]"
                >
                  <p className="font-medium text-[var(--foreground)]">{user.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    {user.role}
                  </p>
                </button>
              ))}
            </div>
          ) : null}

          {selected ? (
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Selected staff</p>
              <p className="mt-2 font-medium">{selected.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{selected.role}</p>
            </div>
          ) : null}

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--background)] p-4">
            <div className="mb-4 text-center font-mono text-3xl tracking-[0.8em] text-[var(--green)]">
              {pin.padEnd(4, "•")}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {digits.map((digit, index) => (
                <button
                  key={`${digit}-${index}`}
                  type="button"
                  onClick={() => setPin((current) => (current.length < 4 ? `${current}${digit}` : current))}
                  className="rounded-2xl border border-[var(--border)] bg-white py-4 text-lg font-medium text-[var(--green)]"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin((current) => current.slice(0, -1))}
                className="rounded-2xl border border-[var(--border)] bg-white py-4 text-sm uppercase tracking-[0.18em] text-[var(--muted)]"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setPin("")}
                className="rounded-2xl border border-[var(--border)] bg-white py-4 text-sm uppercase tracking-[0.18em] text-[var(--muted)]"
              >
                Clear
              </button>
            </div>
          </div>

          <Button className="w-full" onClick={submitPin} disabled={!selected || pin.length !== 4 || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock dashboard"}
          </Button>

          <p className="text-xs text-[var(--muted)]">
            Local preview seed: Liffort Hobley / Samuel Reed PIN `2445`.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Manager email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
              placeholder="manager@enishhouston.com"
            />
          </div>
          <Button className="w-full" onClick={sendMagicLink} disabled={!email || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send magic link"}
          </Button>
        </div>
      )}

      {message ? <p className="mt-4 text-sm text-[var(--muted)]">{message}</p> : null}
    </Card>
  );
}
