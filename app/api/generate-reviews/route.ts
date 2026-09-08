import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { isValidRating, getRoutingDecision } from "@/lib/reviewPolicy";
import { buildReviewsResponseSchema } from "@/lib/ai/responseSchema";
import { generateReviews } from "@/lib/ai/reviewGenerator";
import { TAG_POOL, MAX_SELECTED_TAGS, isValidTagSelection } from "@/lib/tags";

/**
 * POST /api/generate-reviews
 *
 * Input:  { rating: number, tags: string[] }
 * Output: { reviews: string[] } on success, { error: string } on failure.
 *
 * All validation happens here, server-side — the client's own checks
 * (star routing, max-selection cap) are only for UX. Nothing from the
 * request body is trusted until it passes every check below.
 *
 * Tag-based flow (replaces the earlier free-text feedback flow): the
 * customer picks curated experience tags instead of typing anything, so
 * the AI call is grounded to that closed, pre-approved vocabulary.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { rating, tags } = body as { rating?: unknown; tags?: unknown };

  if (!isValidRating(rating)) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  // Defense in depth: even though the UI never calls this endpoint for
  // 1-3 star ratings, a direct request must not be trusted either.
  const decision = getRoutingDecision(rating);
  if (decision.path === "discard") {
    return NextResponse.json(
      { error: "AI review generation is only available for ratings of 4 or 5." },
      { status: 400 }
    );
  }

  if (!isValidTagSelection(tags, TAG_POOL, MAX_SELECTED_TAGS)) {
    return NextResponse.json(
      {
        error: `Select between 1 and ${MAX_SELECTED_TAGS} tags from the list.`,
      },
      { status: 400 }
    );
  }

  let reviews: string[];
  try {
    reviews = await generateReviews(rating, tags, config.business.name);
  } catch {
    // Covers AI API failure, timeout, and empty/malformed responses -
    // callers don't need to distinguish which (Section 11).
    return NextResponse.json(
      { error: "Something went wrong generating your review. Please try again." },
      { status: 502 }
    );
  }

  const responseSchema = buildReviewsResponseSchema(
    config.limits.reviewDraftMinLength,
    config.limits.reviewDraftMaxLength,
    config.limits.reviewDraftCountMin,
    config.limits.reviewDraftCountMax
  );
  const parsed = responseSchema.safeParse({ reviews });
  if (!parsed.success) {
    // Catches an AI response that parsed as JSON but doesn't meet our
    // length/count rules (e.g. too few drafts, or one that's too long).
    return NextResponse.json(
      { error: "Something went wrong generating your review. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed.data, { status: 200 });
}
