import type { LogEventRequest } from "@/types";

/**
 * Fire-and-forget analytics logging. Intentionally does not return a
 * promise the caller has to await, and swallows all errors - a failed
 * analytics write must never block or crash the customer-facing flow.
 */
export function logEvent(payload: LogEventRequest): void {
  fetch("/api/log-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Swallowed on purpose.
  });
}
