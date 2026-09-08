"use client";

import { useState } from "react";
import { getRoutingDecision, isValidRating } from "@/lib/reviewPolicy";
import { isValidReviewsResponse } from "@/lib/validation";
import { redirectTo } from "@/lib/navigation";
import { logEvent } from "@/lib/logEvent";
import { TAG_POOL, MAX_SELECTED_TAGS, VISIBLE_TAG_COUNT } from "@/lib/tags";
import type { FlowState, RatingValue } from "@/types";
import { ReceiptCard } from "./ReceiptCard";
import { BusinessHeader } from "./BusinessHeader";
import { StarRating } from "./StarRating";
import { ThankYouMessage } from "./ThankYouMessage";
import { TagSelector } from "./TagSelector";
import { LoadingState } from "./LoadingState";
import { AIErrorState } from "./AIErrorState";
import { ReviewCardList } from "./ReviewCardList";

interface ReviewFlowProps {
  businessName: string;
  logoUrl: string;
  googleReviewUrl: string;
}

export function ReviewFlow({
  businessName,
  logoUrl,
  googleReviewUrl,
}: ReviewFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>("stars_shown");
  const [rating, setRating] = useState<RatingValue | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviews, setReviews] = useState<string[]>([]);
  const [lastCopiedText, setLastCopiedText] = useState<string | null>(null);

  function handleRatingSelect(selected: RatingValue) {
    if (!isValidRating(selected)) return; // defensive; UI only ever passes 1-5
    setRating(selected);
    logEvent({ event_type: "rating_selected", rating: selected });

    const decision = getRoutingDecision(selected);
    setFlowState(decision.path === "discard" ? "thank_you" : "tag_selection");
  }

  async function requestReviews(tags: string[]) {
    setSelectedTags(tags);
    setFlowState("ai_loading");
    try {
      const response = await fetch("/api/generate-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, tags }),
      });

      if (!response.ok) {
        setFlowState("ai_error");
        return;
      }

      const data = await response.json().catch(() => null);
      if (!isValidReviewsResponse(data)) {
        setFlowState("ai_error");
        return;
      }

      setReviews(data.reviews);
      setFlowState("review_selection");
    } catch {
      // Network failure, timeout, etc.
      setFlowState("ai_error");
    }
  }

  function handleRetry() {
    requestReviews(selectedTags);
  }

  function goToGoogleDirect() {
    // "Write my own review" - no in-app text entry (Section: "Write my
    // own review" must not create another text page); straight to Google.
    logEvent({
      event_type: "google_clicked",
      rating: rating ?? undefined,
      ai_used: false,
      google_clicked: true,
    });
    redirectTo(googleReviewUrl);
  }

  function handleCopy(text: string) {
    setLastCopiedText(text);
    logEvent({
      event_type: "review_selected",
      rating: rating ?? undefined,
      ai_used: true,
      review_text: text,
    });
  }

  function handleGoToGoogleAfterReviews() {
    logEvent({
      event_type: "google_clicked",
      rating: rating ?? undefined,
      ai_used: true,
      google_clicked: true,
      review_text: lastCopiedText ?? undefined,
    });
    redirectTo(googleReviewUrl);
  }

  return (
    <ReceiptCard>
      {flowState === "stars_shown" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <BusinessHeader name={businessName} logoUrl={logoUrl} />
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">
              How was your experience?
            </h1>
            <p className="mt-1 text-sm text-ink/60">
              Tap a star rating to continue.
            </p>
          </div>
          <StarRating value={rating} onChange={handleRatingSelect} />
        </div>
      )}

      {flowState === "thank_you" && <ThankYouMessage />}

      {flowState === "tag_selection" && (
        <TagSelector
          tagPool={TAG_POOL}
          maxSelected={MAX_SELECTED_TAGS}
          visibleCount={VISIBLE_TAG_COUNT}
          onGenerate={requestReviews}
          onWriteOwn={goToGoogleDirect}
        />
      )}

      {flowState === "ai_loading" && <LoadingState />}

      {flowState === "ai_error" && (
        <AIErrorState onRetry={handleRetry} onWriteOwn={goToGoogleDirect} />
      )}

      {flowState === "review_selection" && (
        <ReviewCardList
          reviews={reviews}
          onCopy={handleCopy}
          onGoToGoogle={handleGoToGoogleAfterReviews}
        />
      )}
    </ReceiptCard>
  );
}
