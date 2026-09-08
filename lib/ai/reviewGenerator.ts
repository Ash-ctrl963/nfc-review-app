import { config } from "@/lib/config";
import type { RatingValue } from "@/lib/reviewPolicy";

/** Thrown for any AI failure mode: API error, timeout, empty or malformed
 * response. Route handlers catch this broadly and return a generic 502 -
 * callers should not need to distinguish the sub-cases. The *specific*
 * cause is logged server-side (see logAiFailure) before this is thrown. */
export class AIGenerationError extends Error {}

// Guards against a hung/slow AI API call (Section 11).
const REQUEST_TIMEOUT_MS = 15_000;

const SYSTEM_PROMPT = `You write short, natural customer reviews based only on the specific experience tags the customer selected.

Rules you must follow:
- Only reference the aspects named in the given tags. Never invent facts, products, staff names, prices, discounts, or experiences beyond what the tags represent.
- Do not use fake enthusiasm, excessive adjectives, or marketing language.
- Do not mention that this review was AI-generated, and do not mention "tags" as a concept.
- Keep each review short and realistic, like a real quick Google review: aim for 50-150 characters, and never exceed 200 characters.
- Make the reviews meaningfully different from each other: vary sentence structure, opening words, and the order the tags are mentioned in. Do not reuse a template across candidates.
- Respond with ONLY a JSON object of the exact shape {"reviews": ["...", "...", "...", "...", "...", "..."]} containing 5 to 6 reviews. No other text, explanation, or markdown formatting.`;

function buildUserPrompt(
  rating: RatingValue,
  tags: string[],
  businessName?: string
): string {
  const place = businessName ? ` at ${businessName}` : "";
  return `A customer gave a ${rating}-star rating${place} and selected these things they enjoyed: ${tags.join(", ")}.

Write 5 to 6 short review drafts based only on these selected tags.`;
}

function extractJson(raw: string): unknown {
  // Models occasionally wrap JSON in markdown fences despite instructions
  // not to - strip them before parsing rather than failing outright.
  const withoutFences = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(withoutFences);
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

/**
 * Dev-only diagnostic logging for AI failures. Server console only - this
 * file only ever runs in the Next.js server runtime (route handlers import
 * it), never in a client bundle, so this never reaches the browser.
 *
 * IMPORTANT: never pass config.ai.apiKey (or the raw request headers/URL)
 * into this function. `detail` should be response status/body text or an
 * error message only.
 */
function logAiFailure(stage: string, detail: unknown): void {
  console.error(`[generateReviews] ${stage}`, detail);
}

export async function generateReviews(
  rating: RatingValue,
  tags: string[],
  businessName?: string
): Promise<string[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.ai.model}:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Header auth (current Gemini API convention) rather than a
        // ?key= query param, so the key never ends up in a URL that
        // could be logged by a proxy or shown in server access logs.
        "x-goog-api-key": config.ai.apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [{ text: buildUserPrompt(rating, tags, businessName) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    logAiFailure(
      isTimeout
        ? `request to model "${config.ai.model}" timed out after ${REQUEST_TIMEOUT_MS}ms`
        : "network error calling Gemini API",
      err instanceof Error ? err.message : err
    );
    throw new AIGenerationError("AI request failed.");
  }
  clearTimeout(timeout);

  if (!response.ok) {
    // Gemini's error body (no secrets in it) names the exact problem:
    // model not found/decommissioned, invalid API key, quota exceeded,
    // malformed request, etc. This is the single most useful log line
    // for diagnosing a 502 - it's what actually distinguishes "wrong
    // model name" from "bad key" from "rate limited".
    const bodyText = await response.text().catch(() => "<no body>");
    logAiFailure(
      `Gemini API returned HTTP ${response.status} for model "${config.ai.model}"`,
      bodyText.slice(0, 500)
    );
    throw new AIGenerationError(`Gemini API returned status ${response.status}.`);
  }

  const data = (await response.json().catch(() => null)) as GeminiResponse | null;
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!raw) {
    logAiFailure(
      "Gemini returned 200 but no text in the response (possibly blocked by safety filters or an empty candidate)",
      JSON.stringify(data).slice(0, 500)
    );
    throw new AIGenerationError("AI returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = extractJson(raw);
  } catch {
    logAiFailure("failed to parse Gemini's text output as JSON", raw.slice(0, 500));
    throw new AIGenerationError("AI returned a malformed response.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as { reviews?: unknown }).reviews)
  ) {
    logAiFailure(
      "Gemini's JSON response was missing the expected 'reviews' array",
      JSON.stringify(parsed).slice(0, 500)
    );
    throw new AIGenerationError("AI response was missing the expected shape.");
  }

  return (parsed as { reviews: unknown[] }).reviews.filter(
    (r): r is string => typeof r === "string"
  );
}
