import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ReviewCard } from "@/components/ReviewCard";

const REVIEW_TEXT = "Really enjoyed the coffee and the friendly service.";

describe("ReviewCard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("copies the exact review text to the clipboard and shows confirmation", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const onCopy = vi.fn();

    render(<ReviewCard text={REVIEW_TEXT} onCopy={onCopy} />);
    fireEvent.click(screen.getByRole("button", { name: /copy review/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(REVIEW_TEXT));
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
    expect(onCopy).toHaveBeenCalledWith(REVIEW_TEXT);
  });

  it("does not remove the review after copying", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    render(<ReviewCard text={REVIEW_TEXT} onCopy={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /copy review/i }));

    await screen.findByText("Copied!");
    expect(screen.getByText(REVIEW_TEXT)).toBeInTheDocument();
  });

  it("handles clipboard failure gracefully instead of crashing", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const onCopy = vi.fn();

    render(<ReviewCard text={REVIEW_TEXT} onCopy={onCopy} />);
    fireEvent.click(screen.getByRole("button", { name: /copy review/i }));

    expect(await screen.findByText("Couldn't copy")).toBeInTheDocument();
    expect(onCopy).not.toHaveBeenCalled();
    // The review itself is still on screen - failure doesn't crash the flow.
    expect(screen.getByText(REVIEW_TEXT)).toBeInTheDocument();
  });

  it("handles a browser with no Clipboard API at all", async () => {
    vi.stubGlobal("navigator", {});
    const onCopy = vi.fn();

    render(<ReviewCard text={REVIEW_TEXT} onCopy={onCopy} />);
    fireEvent.click(screen.getByRole("button", { name: /copy review/i }));

    expect(await screen.findByText("Couldn't copy")).toBeInTheDocument();
    expect(onCopy).not.toHaveBeenCalled();
  });
});
