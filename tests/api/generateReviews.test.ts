import { describe, it, expect, vi, beforeEach } from "vitest";

const generateReviewsMock = vi.fn();
vi.mock("@/lib/ai/reviewGenerator", () => ({
  generateReviews: (...args: unknown[]) => generateReviewsMock(...args),
  AIGenerationError: class AIGenerationError extends Error {},
}));

import { POST } from "@/app/api/generate-reviews/route";
import { TAG_POOL } from "@/lib/tags";

const VALID_TAGS = ["Great taste", "Friendly staff"];

const VALID_MOCK_REVIEWS = [
  "The coffee was excellent and the staff were lovely today.",
  "Really enjoyed it - great coffee and attentive staff.",
  "Excellent coffee, lovely and attentive staff. Would come back.",
  "Great visit overall, the staff were very attentive.",
  "Had a lovely time, coffee and service were excellent.",
];

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/generate-reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  generateReviewsMock.mockReset();
  generateReviewsMock.mockResolvedValue(VALID_MOCK_REVIEWS);
});

describe("POST /api/generate-reviews", () => {
  it("rejects an out-of-range rating", async () => {
    const res = await POST(makeRequest({ rating: 7, tags: VALID_TAGS }));
    expect(res.status).toBe(400);
    expect(generateReviewsMock).not.toHaveBeenCalled();
  });

  it("rejects a non-integer rating", async () => {
    const res = await POST(makeRequest({ rating: 4.5, tags: VALID_TAGS }));
    expect(res.status).toBe(400);
  });

  it("rejects ratings 1-3 even if called directly, without calling the AI", async () => {
    const res = await POST(makeRequest({ rating: 2, tags: VALID_TAGS }));
    expect(res.status).toBe(400);
    expect(generateReviewsMock).not.toHaveBeenCalled();
  });

  it("rejects an empty tag selection", async () => {
    const res = await POST(makeRequest({ rating: 5, tags: [] }));
    expect(res.status).toBe(400);
    expect(generateReviewsMock).not.toHaveBeenCalled();
  });

  it("rejects more tags than the maximum allowed", async () => {
    const res = await POST(
      makeRequest({ rating: 5, tags: [...TAG_POOL] })
    );
    expect(res.status).toBe(400);
    expect(generateReviewsMock).not.toHaveBeenCalled();
  });

  it("rejects a tag that isn't in the configured pool", async () => {
    const res = await POST(
      makeRequest({ rating: 5, tags: ["Not a real tag"] })
    );
    expect(res.status).toBe(400);
    expect(generateReviewsMock).not.toHaveBeenCalled();
  });

  it("rejects duplicate tags in the same request", async () => {
    const res = await POST(
      makeRequest({ rating: 5, tags: ["Great taste", "Great taste"] })
    );
    expect(res.status).toBe(400);
  });

  it("rejects a missing tags field", async () => {
    const res = await POST(makeRequest({ rating: 5 }));
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const badRequest = new Request("http://localhost/api/generate-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not valid json",
    });
    const res = await POST(badRequest);
    expect(res.status).toBe(400);
  });

  it("returns 5-6 valid review drafts for a valid 4-5 star request, passing the tags through", async () => {
    const res = await POST(makeRequest({ rating: 5, tags: VALID_TAGS }));
    expect(res.status).toBe(200);

    expect(generateReviewsMock).toHaveBeenCalledWith(
      5,
      VALID_TAGS,
      expect.any(String)
    );

    const data = await res.json();
    expect(Array.isArray(data.reviews)).toBe(true);
    expect(data.reviews.length).toBeGreaterThanOrEqual(5);
    expect(data.reviews.length).toBeLessThanOrEqual(6);
    for (const review of data.reviews) {
      expect(typeof review).toBe("string");
      expect(review.length).toBeGreaterThanOrEqual(20);
      expect(review.length).toBeLessThanOrEqual(200);
    }
  });

  it("accepts rating 4 as well as 5", async () => {
    const res = await POST(makeRequest({ rating: 4, tags: VALID_TAGS }));
    expect(res.status).toBe(200);
  });

  it("accepts the maximum allowed number of tags", async () => {
    const maxTags = TAG_POOL.slice(0, 6);
    const res = await POST(makeRequest({ rating: 5, tags: maxTags }));
    expect(res.status).toBe(200);
  });

  it("returns 502 without leaking details when the AI call fails", async () => {
    generateReviewsMock.mockRejectedValueOnce(new Error("upstream timeout"));
    const res = await POST(makeRequest({ rating: 5, tags: VALID_TAGS }));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).not.toMatch(/upstream timeout/);
  });

  it("returns 502 when the AI returns too few reviews", async () => {
    generateReviewsMock.mockResolvedValueOnce([
      "Only one review here, unfortunately.",
    ]);
    const res = await POST(makeRequest({ rating: 5, tags: VALID_TAGS }));
    expect(res.status).toBe(502);
  });

  it("returns 502 when the AI returns a review that's too short", async () => {
    generateReviewsMock.mockResolvedValueOnce([
      "Good.",
      "Fine.",
      "Nice.",
      "Ok.",
      "Yes.",
    ]);
    const res = await POST(makeRequest({ rating: 5, tags: VALID_TAGS }));
    expect(res.status).toBe(502);
  });

  it("returns 502 when the AI returns a review that's too long", async () => {
    generateReviewsMock.mockResolvedValueOnce([
      "a".repeat(250),
      "Fine visit overall, would come back again soon.",
      "Enjoyed the coffee and the friendly staff today.",
      "Great little spot, will return before too long.",
      "Really lovely visit, thanks for having us today.",
    ]);
    const res = await POST(makeRequest({ rating: 5, tags: VALID_TAGS }));
    expect(res.status).toBe(502);
  });
});
