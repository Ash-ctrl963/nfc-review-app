"use client";

import { useState } from "react";
import { Button } from "./Button";
import { pickVisibleTags } from "@/lib/tags";

interface TagSelectorProps {
  tagPool: readonly string[];
  maxSelected: number;
  visibleCount: number;
  onGenerate: (tags: string[]) => void;
  onWriteOwn: () => void;
}

export function TagSelector({
  tagPool,
  maxSelected,
  visibleCount,
  onGenerate,
  onWriteOwn,
}: TagSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [visibleTags, setVisibleTags] = useState<string[]>(() =>
    pickVisibleTags(tagPool, [], visibleCount)
  );

  function toggleTag(tag: string) {
    setSelected((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= maxSelected) return prev; // at the cap - ignore
      return [...prev, tag];
    });
  }

  function handleMoreOptions() {
    setVisibleTags(pickVisibleTags(tagPool, selected, visibleCount));
  }

  function handleGenerate() {
    if (selected.length > 0) {
      onGenerate(selected);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">
          What did you enjoy?
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Select up to {maxSelected} things that stood out to you.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Experience tags"
      >
        {visibleTags.map((tag) => {
          const isSelected = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleTag(tag)}
              className={`min-h-[44px] rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-white/50 text-ink hover:bg-white/70"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-ink/60">
        <span aria-live="polite">
          {selected.length} / {maxSelected} selected
        </span>
        <button
          type="button"
          onClick={handleMoreOptions}
          className="font-medium text-ink/70 underline underline-offset-4 hover:text-ink"
        >
          More options
        </button>
      </div>

      <Button
        type="button"
        onClick={handleGenerate}
        disabled={selected.length === 0}
      >
        Generate Review
      </Button>

      <div className="text-center">
        <p className="text-xs text-ink/50">Prefer to write your own?</p>
        <button
          type="button"
          onClick={onWriteOwn}
          className="mt-1 text-sm text-ink/60 underline underline-offset-4 hover:text-ink/80"
        >
          Write my own review
        </button>
      </div>
    </div>
  );
}
