"use client";

import { useState } from "react";

interface ReviewCardProps {
  text: string;
  onCopy: (text: string) => void;
}

type CopyStatus = "idle" | "copied" | "error";

export function ReviewCard({ text, onCopy }: ReviewCardProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function handleCopy() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      onCopy(text);
    } catch {
      // Clipboard access can fail (permissions, insecure context,
      // unsupported browser) - fail visibly, never crash the flow.
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  const label =
    status === "copied" ? "Copied!" : status === "error" ? "Couldn't copy" : "Copy";

  return (
    <div className="rounded-md border border-ink/15 bg-white/40 p-4">
      <p className="text-sm leading-relaxed text-ink">{text}</p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy review: ${text}`}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            status === "error"
              ? "text-red-700"
              : "text-gold hover:text-gold/80"
          }`}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
