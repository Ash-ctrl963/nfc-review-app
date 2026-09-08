import { describe, it, expect } from "vitest";
import {
  getRoutingDecision,
  isValidRating,
  isAiEligible,
} from "@/lib/reviewPolicy";

describe("reviewPolicy", () => {
  it.each([1, 2, 3])("routes rating %i to 'discard'", (rating) => {
    const decision = getRoutingDecision(rating as 1 | 2 | 3);
    expect(decision.path).toBe("discard");
  });

  it.each([4, 5])("routes rating %i to 'ai_review'", (rating) => {
    const decision = getRoutingDecision(rating as 4 | 5);
    expect(decision.path).toBe("ai_review");
  });

  it("isAiEligible matches getRoutingDecision", () => {
    expect(isAiEligible(3)).toBe(false);
    expect(isAiEligible(4)).toBe(true);
    expect(isAiEligible(5)).toBe(true);
  });

  describe("isValidRating", () => {
    it.each([1, 2, 3, 4, 5])("accepts integer %i", (v) => {
      expect(isValidRating(v)).toBe(true);
    });

    it.each([0, 6, -1, 3.5, "4", null, undefined, NaN])(
      "rejects invalid value %p",
      (v) => {
        expect(isValidRating(v)).toBe(false);
      }
    );
  });
});
