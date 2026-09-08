import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TagSelector } from "@/components/TagSelector";

const POOL = [
  "Great taste",
  "Friendly staff",
  "Fast service",
  "Great ambience",
  "Fresh food",
  "Good portions",
  "Clean space",
  "Good value",
];

describe("TagSelector", () => {
  it("shows the configured number of visible tags", () => {
    render(
      <TagSelector
        tagPool={POOL}
        maxSelected={6}
        visibleCount={7}
        onGenerate={() => {}}
        onWriteOwn={() => {}}
      />
    );
    expect(screen.getAllByRole("button", { pressed: false }).length).toBe(7);
  });

  it("selects a tag on click, shows it as pressed, and updates the counter", () => {
    render(
      <TagSelector
        tagPool={POOL}
        maxSelected={6}
        visibleCount={7}
        onGenerate={() => {}}
        onWriteOwn={() => {}}
      />
    );
    const firstTag = screen.getAllByRole("button", { pressed: false })[0]!;
    fireEvent.click(firstTag);
    expect(firstTag).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1 / 6 selected")).toBeInTheDocument();
  });

  it("deselects a tag on a second click", () => {
    render(
      <TagSelector
        tagPool={POOL}
        maxSelected={6}
        visibleCount={7}
        onGenerate={() => {}}
        onWriteOwn={() => {}}
      />
    );
    const firstTag = screen.getAllByRole("button", { pressed: false })[0]!;
    fireEvent.click(firstTag);
    fireEvent.click(firstTag);
    expect(firstTag).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("0 / 6 selected")).toBeInTheDocument();
  });

  it("does not allow selecting more than the maximum", () => {
    render(
      <TagSelector
        tagPool={POOL}
        maxSelected={2}
        visibleCount={7}
        onGenerate={() => {}}
        onWriteOwn={() => {}}
      />
    );
    const tags = screen.getAllByRole("button", { pressed: false });
    fireEvent.click(tags[0]!);
    fireEvent.click(tags[1]!);
    fireEvent.click(tags[2]!); // should be a no-op - already at the cap of 2

    expect(screen.getByText("2 / 2 selected")).toBeInTheDocument();
    expect(tags[2]!).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps the review-generation button disabled until at least one tag is selected", () => {
    render(
      <TagSelector
        tagPool={POOL}
        maxSelected={6}
        visibleCount={7}
        onGenerate={() => {}}
        onWriteOwn={() => {}}
      />
    );
    expect(
      screen.getByRole("button", { name: "Generate Review" })
    ).toBeDisabled();

    const firstTag = screen.getAllByRole("button", { pressed: false })[0]!;
    fireEvent.click(firstTag);

    expect(
      screen.getByRole("button", { name: "Generate Review" })
    ).not.toBeDisabled();
  });

  it("calls onGenerate with the selected tags", () => {
    const onGenerate = vi.fn();
    render(
      <TagSelector
        tagPool={POOL}
        maxSelected={6}
        visibleCount={7}
        onGenerate={onGenerate}
        onWriteOwn={() => {}}
      />
    );
    const tagButtons = screen.getAllByRole("button", { pressed: false });
    const firstTag = tagButtons[0]!;
    const secondTag = tagButtons[1]!;
    fireEvent.click(firstTag);
    fireEvent.click(secondTag);
    fireEvent.click(screen.getByRole("button", { name: "Generate Review" }));

    expect(onGenerate).toHaveBeenCalledWith([
      firstTag.textContent,
      secondTag.textContent,
    ]);
  });

  it("preserves a selection across 'More options' and never shows duplicate tags", () => {
    render(
      <TagSelector
        tagPool={POOL}
        maxSelected={6}
        visibleCount={7}
        onGenerate={() => {}}
        onWriteOwn={() => {}}
      />
    );
    const firstTag = screen.getAllByRole("button", { pressed: false })[0]!;
    const selectedLabel = firstTag.textContent;
    fireEvent.click(firstTag);

    fireEvent.click(screen.getByRole("button", { name: "More options" }));

    const visibleLabels = screen
      .getAllByRole("button")
      .filter((el) => el.getAttribute("aria-pressed") !== null)
      .map((el) => el.textContent);

    expect(visibleLabels).toContain(selectedLabel);
    expect(new Set(visibleLabels).size).toBe(visibleLabels.length);
    expect(screen.getByText("1 / 6 selected")).toBeInTheDocument();
  });

  it("calls onWriteOwn when 'Write my own review' is clicked", () => {
    const onWriteOwn = vi.fn();
    render(
      <TagSelector
        tagPool={POOL}
        maxSelected={6}
        visibleCount={7}
        onGenerate={() => {}}
        onWriteOwn={onWriteOwn}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Write my own review" })
    );
    expect(onWriteOwn).toHaveBeenCalled();
  });
});
