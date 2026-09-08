import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { StarRating } from "@/components/StarRating";

describe("StarRating", () => {
  it("renders 5 accessible radio buttons", () => {
    render(<StarRating value={null} onChange={() => {}} />);
    const stars = screen.getAllByRole("radio");
    expect(stars).toHaveLength(5);
  });

  it("calls onChange with the correct rating when a star is tapped", () => {
    const onChange = vi.fn();
    render(<StarRating value={null} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("4 stars - good"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("marks the selected star as checked", () => {
    render(<StarRating value={3} onChange={() => {}} />);
    expect(screen.getByLabelText("3 stars - okay")).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByLabelText("5 stars - excellent")).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });
});
