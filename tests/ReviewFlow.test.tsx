import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ReviewFlow } from "@/components/ReviewFlow";
import * as navigation from "@/lib/navigation";

const defaultProps = {
  businessName: "Test Café",
  logoUrl: "/logo.svg",
  googleReviewUrl: "https://g.page/r/test/review",
};

function selectAFewTags(count = 2) {
  const tags = screen.getAllByRole("button", { pressed: false });
  for (let i = 0; i < count; i++) {
    fireEvent.click(tags[i]!);
  }
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ReviewFlow", () => {
  it("routes ratings 1-3 to the thank-you screen and never calls the AI endpoint", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    render(<ReviewFlow {...defaultProps} />);

    fireEvent.click(screen.getByLabelText("2 stars - fair"));

    expect(
      await screen.findByText("Thank you for your feedback.")
    ).toBeInTheDocument();

    // The rating itself is still logged for analytics - only the AI/review
    // endpoint must never be called for a low rating.
    const calledUrls = fetchSpy.mock.calls.map((call) => call[0]);
    expect(calledUrls).not.toContain("/api/generate-reviews");
    expect(calledUrls).toContain("/api/log-event");
  });

  it("routes ratings 4-5 to the tag-selection screen", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    render(<ReviewFlow {...defaultProps} />);

    fireEvent.click(screen.getByLabelText("5 stars - excellent"));

    expect(await screen.findByText("What did you enjoy?")).toBeInTheDocument();
  });

  it("lets the customer write their own review directly, without any AI request", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    const redirectSpy = vi
      .spyOn(navigation, "redirectTo")
      .mockImplementation(() => {});

    render(<ReviewFlow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("4 stars - good"));

    await screen.findByText("What did you enjoy?");
    fireEvent.click(
      screen.getByRole("button", { name: "Write my own review" })
    );

    await waitFor(() =>
      expect(redirectSpy).toHaveBeenCalledWith(defaultProps.googleReviewUrl)
    );
    const calledUrls = fetchSpy.mock.calls.map((call) => call[0]);
    expect(calledUrls).not.toContain("/api/generate-reviews");
  });

  it("sends the selected tags to the AI endpoint and shows the generated reviews", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/generate-reviews") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              reviews: [
                "Loved the coffee and the friendly staff today.",
                "Great little spot, fast and friendly service.",
                "Really enjoyed my visit, will come back soon.",
                "Great taste and a relaxing atmosphere overall.",
                "Friendly staff and excellent coffee, highly recommend.",
              ],
            }),
            { status: 200 }
          )
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
    });

    render(<ReviewFlow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("5 stars - excellent"));
    await screen.findByText("What did you enjoy?");

    selectAFewTags(2);
    fireEvent.click(screen.getByRole("button", { name: "Generate Review" }));

    expect(
      await screen.findByText("Loved the coffee and the friendly staff today.")
    ).toBeInTheDocument();

    const generateCall = fetchSpy.mock.calls.find(
      (call) => call[0] === "/api/generate-reviews"
    );
    expect(generateCall).toBeDefined();
    const sentBody = JSON.parse((generateCall![1] as RequestInit).body as string);
    expect(sentBody.rating).toBe(5);
    expect(Array.isArray(sentBody.tags)).toBe(true);
    expect(sentBody.tags.length).toBe(2);
  });

  it("lets the customer copy a review and go to Google", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/generate-reviews") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              reviews: [
                "Loved the coffee and the friendly staff today.",
                "Great little spot, fast and friendly service.",
                "Really enjoyed my visit, will come back soon.",
                "Great taste and a relaxing atmosphere overall.",
                "Friendly staff and excellent coffee, highly recommend.",
              ],
            }),
            { status: 200 }
          )
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const redirectSpy = vi
      .spyOn(navigation, "redirectTo")
      .mockImplementation(() => {});

    render(<ReviewFlow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("5 stars - excellent"));
    await screen.findByText("What did you enjoy?");
    selectAFewTags(2);
    fireEvent.click(screen.getByRole("button", { name: "Generate Review" }));

    await screen.findByText("Loved the coffee and the friendly staff today.");
    fireEvent.click(screen.getAllByRole("button", { name: /copy review/i })[0]!);
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        "Loved the coffee and the friendly staff today."
      )
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Go to Google Reviews" })
    );
    await waitFor(() =>
      expect(redirectSpy).toHaveBeenCalledWith(defaultProps.googleReviewUrl)
    );
  });

  it("shows the AI error state when the API call fails, and can redirect straight to Google from there", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/generate-reviews") {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Not implemented" }), {
            status: 501,
          })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
    });
    const redirectSpy = vi
      .spyOn(navigation, "redirectTo")
      .mockImplementation(() => {});

    render(<ReviewFlow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("4 stars - good"));
    await screen.findByText("What did you enjoy?");
    selectAFewTags(1);
    fireEvent.click(screen.getByRole("button", { name: "Generate Review" }));

    expect(
      await screen.findByText("Couldn't generate a review right now.")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Write my own on Google" })
    );
    await waitFor(() =>
      expect(redirectSpy).toHaveBeenCalledWith(defaultProps.googleReviewUrl)
    );
  });
});
