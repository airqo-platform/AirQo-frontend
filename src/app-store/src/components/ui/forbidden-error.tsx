'use client';

import { useRouter } from 'next/navigation';
import ReusableButton from '@/components/shared/button/ReusableButton';

export interface ForbiddenErrorProps {
  message?: string;
  onGoBack?: () => void;
  showBackButton?: boolean;
}

export function ForbiddenError({
  message = "You don't have access rights to this page.",
  onGoBack,
  showBackButton = true,
}: ForbiddenErrorProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
      return;
    }
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Access denied
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">{message}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reach out to your administrator if you think this is a mistake.
        </p>
      </div>

      {showBackButton && (
        <ReusableButton onClick={handleGoBack} className="min-w-[160px]">
          Go back
        </ReusableButton>
      )}

      <p className="text-xs text-muted-foreground">Error code: 403 forbidden access</p>
    </div>
  );
}
