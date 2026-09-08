import { Button } from "./Button";

interface AIErrorStateProps {
  onRetry: () => void;
  onWriteOwn: () => void;
}

export function AIErrorState({ onRetry, onWriteOwn }: AIErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="font-display text-xl font-semibold text-ink">
        Couldn't generate a review right now.
      </h1>
      <p className="text-sm text-ink/60">
        You can try again, or go straight to Google and write your own.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
        <Button type="button" variant="secondary" onClick={onWriteOwn}>
          Write my own on Google
        </Button>
      </div>
    </div>
  );
}
