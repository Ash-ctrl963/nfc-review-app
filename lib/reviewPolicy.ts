/**
 * Rating-routing policy.
 *
 * This is the ONLY place that decides what happens for a given star rating.
 * Everything else (UI, API routes) should call into this module rather than
 * hardcoding "rating >= 4" checks. If the business logic ever changes
 * (e.g. different threshold, more nuanced routing), this is the only file
 * that needs to change.
 */

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export type RoutingDecision =
  | { path: "discard"; reason: "low_rating" }
  | { path: "ai_review"; reason: "high_rating" };

const AI_ELIGIBLE_MIN_RATING: RatingValue = 4;

export function isValidRating(value: unknown): value is RatingValue {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

/**
 * Decide what should happen for a given rating.
 * - 1..3 -> "discard": show thank-you, do not store text, do not call AI.
 * - 4..5 -> "ai_review": collect optional feedback, call AI, show drafts.
 */
export function getRoutingDecision(rating: RatingValue): RoutingDecision {
  if (rating >= AI_ELIGIBLE_MIN_RATING) {
    return { path: "ai_review", reason: "high_rating" };
  }
  return { path: "discard", reason: "low_rating" };
}

export function isAiEligible(rating: RatingValue): boolean {
  return getRoutingDecision(rating).path === "ai_review";
}
