import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';

export default function AppLoading() {
  // Delay the loader slightly so normal navigation stays smooth and the
  // overlay only appears for genuinely slow suspense/delayed actions.
  return <LoadingOverlay delayMs={180} />;
}