export function LoadingState() {
  return (
    <div
      className="flex flex-col items-center gap-4 py-6 text-center"
      role="status"
      aria-live="polite"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 animate-spin text-gold motion-reduce:animate-none"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-sm text-ink/60">Putting your thoughts into words…</p>
    </div>
  );
}
