/**
 * Central, easily-editable pool of experience tags shown on the
 * "What did you enjoy?" screen (4-5 star flow only).
 *
 * These are generic, genuine café experience attributes written for this
 * project - not scraped or copied from any real Google review, and not
 * derived from real review text in any way. Edit this list to fit a
 * different business; nothing else in the app needs to change.
 */
export const TAG_POOL: readonly string[] = [
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
  "Good presentation",
  "Comfortable seating",
  "Helpful service",
  "Relaxing atmosphere",
  "Good variety",
];

/** Maximum number of tags a customer may select at once. */
export const MAX_SELECTED_TAGS = 6;

/** How many tags are shown on screen at a time (before "More options"). */
export const VISIBLE_TAG_COUNT = 7;

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = temp;
  }
  return arr;
}

/**
 * Picks the set of tags to display next (initial load, or after "More
 * options"). Any tag the customer has already selected is always kept
 * visible - otherwise pressing "More options" could scroll a selection
 * out of view and make it look like it was lost. The remaining slots are
 * filled with a random, duplicate-free sample of the rest of the pool,
 * and the final order is shuffled.
 */
export function pickVisibleTags(
  pool: readonly string[],
  selected: readonly string[],
  size: number
): string[] {
  const pinnedSelected = selected.filter((tag) => pool.includes(tag));
  const rest = pool.filter((tag) => !pinnedSelected.includes(tag));
  const fillCount = Math.max(size - pinnedSelected.length, 0);
  const filler = shuffle(rest).slice(0, fillCount);
  return shuffle([...pinnedSelected, ...filler]);
}

/**
 * Server-side validation for a submitted tag selection (Section on
 * security: "enforce maximum selected tags server-side"). Deliberately
 * strict - tags are a closed, curated set, not free text, so anything
 * not in the pool is rejected rather than passed through to the AI.
 */
export function isValidTagSelection(
  value: unknown,
  pool: readonly string[],
  maxSelected: number
): value is string[] {
  if (!Array.isArray(value)) return false;
  if (value.length === 0 || value.length > maxSelected) return false;
  if (!value.every((t): t is string => typeof t === "string")) return false;
  const unique = new Set(value);
  if (unique.size !== value.length) return false;
  return value.every((t) => pool.includes(t));
}
