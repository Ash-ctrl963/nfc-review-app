import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    env: {
      // Route handlers import lib/config.ts directly (safe — they're
      // server-only), which requires these at import time.
      GOOGLE_REVIEW_URL: "https://example.com/review",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
      GEMINI_API_KEY: "test-gemini-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
