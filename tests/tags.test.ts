import { describe, it, expect } from "vitest";
import { pickVisibleTags, isValidTagSelection, TAG_POOL } from "@/lib/tags";

const POOL = [
  "Great taste",
  "Friendly staff",
  "Fast service",
  "Great ambience",
  "Fresh food",
  "Good portions",
  "Clean space",
  "Good value",
  "Great coffee",
  "Delicious desserts",
];

describe("pickVisibleTags", () => {
  it("returns the requested number of tags when the pool is large enough", () => {
    const visible = pickVisibleTags(POOL, [], 7);
    expect(visible).toHaveLength(7);
  });

  it("never returns duplicate tags within the visible set", () => {
    for (let i = 0; i < 20; i++) {
      const visible = pickVisibleTags(POOL, [], 7);
      expect(new Set(visible).size).toBe(visible.length);
    }
  });

  it("always includes every already-selected tag", () => {
    const selected = ["Great taste", "Friendly staff", "Clean space"];
    for (let i = 0; i < 20; i++) {
      const visible = pickVisibleTags(POOL, selected, 7);
      for (const tag of selected) {
        expect(visible).toContain(tag);
      }
    }
  });

  it("does not lose selections when called again (simulating 'More options')", () => {
    const selected = ["Great coffee", "Good value"];
    const first = pickVisibleTags(POOL, selected, 7);
    const second = pickVisibleTags(POOL, selected, 7);
    for (const tag of selected) {
      expect(first).toContain(tag);
      expect(second).toContain(tag);
    }
  });

  it("caps the visible set to the pool size if the pool is smaller than the requested size", () => {
    const smallPool = ["A", "B", "C"];
    const visible = pickVisibleTags(smallPool, [], 7);
    expect(visible.length).toBeLessThanOrEqual(3);
  });

  it("the real TAG_POOL has no duplicate entries", () => {
    expect(new Set(TAG_POOL).size).toBe(TAG_POOL.length);
  });
});

describe("isValidTagSelection", () => {
  it("accepts a valid subset of the pool within the max count", () => {
    expect(isValidTagSelection(["Great taste", "Friendly staff"], POOL, 6)).toBe(
      true
    );
  });

  it("rejects an empty selection", () => {
    expect(isValidTagSelection([], POOL, 6)).toBe(false);
  });

  it("rejects more tags than the maximum allowed", () => {
    const tooMany = POOL.slice(0, 7); // max is 6 in this test
    expect(isValidTagSelection(tooMany, POOL, 6)).toBe(false);
  });

  it("rejects a tag that isn't in the pool", () => {
    expect(isValidTagSelection(["Not a real tag"], POOL, 6)).toBe(false);
  });

  it("rejects duplicate tags in the same selection", () => {
    expect(
      isValidTagSelection(["Great taste", "Great taste"], POOL, 6)
    ).toBe(false);
  });

  it("rejects non-array input", () => {
    expect(isValidTagSelection("Great taste", POOL, 6)).toBe(false);
    expect(isValidTagSelection(null, POOL, 6)).toBe(false);
    expect(isValidTagSelection(undefined, POOL, 6)).toBe(false);
  });

  it("rejects an array containing non-string entries", () => {
    expect(isValidTagSelection(["Great taste", 5], POOL, 6)).toBe(false);
  });
});
