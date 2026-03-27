"use client";

import { useEffect } from "react";

const STORAGE_KEY = "enish-offline-checklist-queue";

export function queueOfflineCompletion(payload: unknown) {
  if (typeof window === "undefined") return;
  const current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  current.push(payload);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function OfflineSync() {
  useEffect(() => {
    const flush = async () => {
      const queue = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (!queue.length || !navigator.onLine) return;

      const response = await fetch("/api/pwa/flush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue }),
      });

      if (response.ok) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    };

    void flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, []);

  return null;
}
