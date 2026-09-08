/**
 * Central configuration for the app.
 *
 * This is intentionally the ONLY place that reads process.env for
 * app-level config. Do not read process.env directly anywhere else —
 * import from here instead. This keeps the "one business, one config"
 * architectural decision (see project spec Section 4) enforceable:
 * if this file has no business_id/tenant concept, the rest of the app
 * can't accidentally grow one.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    // Fail loudly at startup/build time rather than silently at runtime
    // with a broken redirect or a missing API key.
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`
    );
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : fallback;
}

function requireEnvAny(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) return value;
  }
  throw new Error(
    `Missing required environment variable: one of [${names.join(", ")}]. See .env.example.`
  );
}

export const config = {
  business: {
    name: optionalEnv("NEXT_PUBLIC_BUSINESS_NAME", "Our Business"),
    logoUrl: optionalEnv("NEXT_PUBLIC_BUSINESS_LOGO_URL", "/logo.svg"),
  },

  app: {
    // Public base URL — used to generate the QR code and to display/verify
    // the NFC target URL. Must match what's written to the NFC tag.
    url: optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  },

  googleReviewUrl: requireEnv("GOOGLE_REVIEW_URL"),

  ai: {
    apiKey: requireEnv("GEMINI_API_KEY"),
    // "gemini-flash-latest" is an alias Google maintains to always point
    // at the current non-deprecated Flash model, so this doesn't need to
    // be re-pinned every time Google retires an old version string (e.g.
    // gemini-2.0-flash was shut down in mid-2026).
    model: optionalEnv("GEMINI_MODEL", "gemini-flash-latest"),
  },

  database: {
    // NEXT_PUBLIC_SUPABASE_URL is accepted too - it's the same project
    // URL Supabase's own quickstarts export under that name, and the URL
    // itself isn't sensitive. The service-role key has no public-safe
    // equivalent, so only the one explicit name is accepted for it.
    supabaseUrl: requireEnvAny(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]),
    supabaseServiceKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  },

  // Internal stats page protection (Section 14: simple internal view, not a
  // full dashboard/auth system — a shared secret query param is enough).
  internalStatsSecret: process.env.INTERNAL_STATS_SECRET ?? "",

  limits: {
    reviewDraftMinLength: 20,
    reviewDraftMaxLength: 200,
    reviewDraftCountMin: 5,
    reviewDraftCountMax: 6,
  },
} as const;
