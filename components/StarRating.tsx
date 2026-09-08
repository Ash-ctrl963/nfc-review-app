"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number | null;
  onChange: (rating: 1 | 2 | 3 | 4 | 5) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "1 star - poor",
  2: "2 stars - fair",
  3: "3 stars - okay",
  4: "4 stars - good",
  5: "5 stars - excellent",
};

export function StarRating({ value, onChange }: StarRatingProps) {
  const [justSelected, setJustSelected] = useState<number | null>(null);

  function handleSelect(rating: 1 | 2 | 3 | 4 | 5) {
    setJustSelected(rating);
    onChange(rating);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Rate your experience from 1 to 5 stars"
      className="flex justify-center gap-2 sm:gap-3"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={RATING_LABELS[star]}
            onClick={() => handleSelect(star as 1 | 2 | 3 | 4 | 5)}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors sm:h-16 sm:w-16 ${
              justSelected === star ? "animate-star-pulse" : ""
            }`}
            onAnimationEnd={() => setJustSelected(null)}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-10 w-10 sm:h-11 sm:w-11 ${
                filled ? "text-gold" : "text-ink/25"
              }`}
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={filled ? 0 : 1.5}
              aria-hidden="true"
            >
              <path d="M12 2.5l2.9 6.03 6.6.83-4.83 4.6 1.27 6.54L12 17.77l-5.94 2.73 1.27-6.54-4.83-4.6 6.6-.83L12 2.5z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
