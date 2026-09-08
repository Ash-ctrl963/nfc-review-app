import type { RatingValue } from "@/lib/reviewPolicy";

export type { RatingValue };

export type EventType =
  | "page_opened"
  | "rating_selected"
  | "ai_requested"
  | "ai_success"
  | "ai_failure"
  | "review_selected"
  | "google_clicked";

export interface GenerateReviewsRequest {
  rating: RatingValue;
  tags: string[];
}

export interface GenerateReviewsSuccessResponse {
  reviews: string[];
}

export interface GenerateReviewsErrorResponse {
  error: string;
}

export type GenerateReviewsResponse =
  | GenerateReviewsSuccessResponse
  | GenerateReviewsErrorResponse;

export interface LogEventRequest {
  event_type: EventType;
  rating?: RatingValue;
  ai_used?: boolean;
  google_clicked?: boolean;
  review_text?: string;
}

/** The client-facing flow state for the /review page state machine. */
export type FlowState =
  | "stars_shown"
  | "thank_you"
  | "tag_selection"
  | "ai_loading"
  | "ai_error"
  | "review_selection";
