import { Component, ReactNode } from "react";
import { QRScanner } from "../../devices/qr-scanner";
import CohortAssignmentBanner from "./CohortAssignmentBanner";
import logger from "@/lib/logger";

// ============================================================
// ERROR BOUNDARY
// ============================================================

interface QRScannerErrorBoundaryProps {
  children: ReactNode;
  onError?: () => void;
}

interface QRScannerErrorBoundaryState {
  hasError: boolean;
}

class QRScannerErrorBoundary extends Component<QRScannerErrorBoundaryProps, QRScannerErrorBoundaryState> {
  constructor(props: QRScannerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): QRScannerErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('QR Scanner error caught by boundary:', error);
    }
    this.props.onError?.();
  }

  render(): ReactNode {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const QRScanStep = ({
  isOpen,
  isPersonalContext,
  isExternalOrg,
  defaultCohort,
  activeGroupTitle,
  onScan,
  onManualEntry,
  onError,
}: {
  isOpen: boolean;
  isPersonalContext: boolean;
  isExternalOrg: boolean;
  defaultCohort: string | null;
  activeGroupTitle?: string;
  onScan: (result: string) => void;
  onManualEntry: () => void;
  onError: () => void;
}) => (
  <QRScannerErrorBoundary onError={onError}>
    <div className="space-y-4">
      {!isPersonalContext && defaultCohort && (
        <CohortAssignmentBanner
          isExternalOrg={isExternalOrg}
          isPersonalContext={isPersonalContext}
          activeGroupTitle={activeGroupTitle}
        />
      )}
      {isOpen && <QRScanner onScan={onScan} />}
      <button onClick={onManualEntry} className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">
        Having trouble? Enter details manually
      </button>
    </div>
  </QRScannerErrorBoundary>
);

export default QRScanStep;