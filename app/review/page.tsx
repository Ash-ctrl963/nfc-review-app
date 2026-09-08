import { config } from "@/lib/config";
import { ReviewFlow } from "@/components/ReviewFlow";

export default function ReviewPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <ReviewFlow
        businessName={config.business.name}
        logoUrl={config.business.logoUrl}
        googleReviewUrl={config.googleReviewUrl}
      />
    </main>
  );
}
