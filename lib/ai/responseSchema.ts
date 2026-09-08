import { z } from "zod";

/**
 * Builds the schema for the { reviews: string[] } shape. Parameterized by
 * the current config limits rather than importing lib/config directly, so
 * this file has no server-only dependencies and stays safe to import from
 * anywhere.
 */
export function buildReviewsResponseSchema(
  minLength: number,
  maxLength: number,
  minCount: number,
  maxCount: number
) {
  return z.object({
    reviews: z
      .array(z.string().trim().min(minLength).max(maxLength))
      .min(minCount)
      .max(maxCount),
  });
}
