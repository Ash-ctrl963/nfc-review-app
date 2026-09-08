import { Button } from "./Button";
import { ReviewCard } from "./ReviewCard";

interface ReviewCardListProps {
  reviews: string[];
  onCopy: (text: string) => void;
  onGoToGoogle: () => void;
}

export function ReviewCardList({
  reviews,
  onCopy,
  onGoToGoogle,
}: ReviewCardListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">
          Pick one and copy it.
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          You'll paste it on Google - feel free to tweak it there.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.map((review, i) => (
          <ReviewCard key={i} text={review} onCopy={onCopy} />
        ))}
      </div>

      <Button type="button" onClick={onGoToGoogle}>
        Go to Google Reviews
      </Button>
    </div>
  );
}
