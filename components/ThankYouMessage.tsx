export function ThankYouMessage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-sage"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-display text-xl font-semibold text-ink">
        Thank you for your feedback.
      </h1>
      <p className="text-sm text-ink/60">
        We read every rating and use it to do better.
      </p>
    </div>
  );
}
