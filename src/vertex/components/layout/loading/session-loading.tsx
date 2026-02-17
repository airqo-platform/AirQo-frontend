"use client";

// Loading component for session loading
const SessionLoadingState = () => (
    <div
        className={`fixed inset-0 bg-white flex items-center justify-center z-50`}
        style={{ backgroundColor: `rgba(255, 255, 255)` }}
        role="status"
        aria-live="polite"
    >
        <div className="flex flex-col items-center gap-3">
            <div className="secondary-main-loader" aria-label="Loading"></div>
        </div>
    </div>
);

export default SessionLoadingState;
