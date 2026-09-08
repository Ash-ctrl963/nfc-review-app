import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { isValidRating } from "@/lib/reviewPolicy";
import { isValidEventType } from "@/lib/validation";

// Defensive cap independent of the client's own limits - never trust the
// client, even for a low-stakes analytics field.
const MAX_REVIEW_TEXT_LENGTH = 500;

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

  const { event_type, rating, ai_used, google_clicked, review_text } =
    body as Record<string, unknown>;

  if (!isValidEventType(event_type)) {
    return NextResponse.json(
      { error: "Invalid event type." },
      { status: 400 }
    );
  }

  if (rating !== undefined && rating !== null && !isValidRating(rating)) {
    return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
  }

  if (review_text !== undefined && typeof review_text !== "string") {
    return NextResponse.json(
      { error: "Invalid review text." },
      { status: 400 }
    );
  }

  const row = {
    event_type,
    rating: rating ?? null,
    ai_used: typeof ai_used === "boolean" ? ai_used : false,
    google_clicked: typeof google_clicked === "boolean" ? google_clicked : false,
    review_text:
      typeof review_text === "string"
        ? review_text.trim().slice(0, MAX_REVIEW_TEXT_LENGTH)
        : null,
  };

  const { error } = await supabase.from("events").insert(row);

  if (error) {
    // Section 10: never expose internal errors to the client.
    return NextResponse.json(
      { error: "Could not record event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
