import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
vi.mock("@/lib/db", () => ({
  supabase: {
    from: () => ({ insert: insertMock }),
  },
}));

import { POST } from "@/app/api/log-event/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/log-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
});

describe("POST /api/log-event", () => {
  it("rejects an unknown event type", async () => {
    const res = await POST(makeRequest({ event_type: "bogus" }));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid rating when one is provided", async () => {
    const res = await POST(
      makeRequest({ event_type: "rating_selected", rating: 9 })
    );
    expect(res.status).toBe(400);
  });

  it("accepts a valid rating_selected event and writes the expected row", async () => {
    const res = await POST(
      makeRequest({ event_type: "rating_selected", rating: 5 })
    );
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: "rating_selected", rating: 5 })
    );
  });

  it("accepts page_opened with no rating at all", async () => {
    const res = await POST(makeRequest({ event_type: "page_opened" }));
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: "page_opened", rating: null })
    );
  });

  it("truncates an overly long review_text before storing it", async () => {
    const longText = "a".repeat(1000);
    const res = await POST(
      makeRequest({
        event_type: "review_selected",
        rating: 5,
        review_text: longText,
      })
    );
    expect(res.status).toBe(200);
    const insertedRow = insertMock.mock.calls[0][0];
    expect(insertedRow.review_text.length).toBeLessThanOrEqual(500);
  });

  it("returns a generic 500 without leaking DB internals when the insert fails", async () => {
    insertMock.mockResolvedValueOnce({
      error: { message: "connection refused at 10.0.0.5" },
    });
    const res = await POST(
      makeRequest({ event_type: "google_clicked", rating: 5 })
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).not.toMatch(/10\.0\.0\.5/);
  });

  it("rejects malformed JSON", async () => {
    const badRequest = new Request("http://localhost/api/log-event", {
      method: "POST",
      body: "{bad json",
    });
    const res = await POST(badRequest);
    expect(res.status).toBe(400);
  });
});
