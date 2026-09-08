import type { GenerateReviewsSuccessResponse, EventType } from "@/types";

export function isValidReviewsResponse(
  data: unknown
): data is GenerateReviewsSuccessResponse {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as { reviews?: unknown };
  return (
    Array.isArray(candidate.reviews) &&
    candidate.reviews.length > 0 &&
    candidate.reviews.every((r) => typeof r === "string" && r.trim().length > 0)
  );
}

const VALID_EVENT_TYPES: readonly EventType[] = [
  "page_opened",
  "rating_selected",
  "ai_requested",
  "ai_success",
  "ai_failure",
  "review_selected",
  "google_clicked",
];

export function isValidEventType(value: unknown): value is EventType {
  return (
    typeof value === "string" &&
    (VALID_EVENT_TYPES as readonly string[]).includes(value)
  );
}
