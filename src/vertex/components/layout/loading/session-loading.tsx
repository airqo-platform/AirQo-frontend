"use client";

// Loading component for session loading
const SessionLoadingState = () => (
    <div
        className={`fixed inset-0 bg-white flex items-center justify-center z-50`}
        style={{ backgroundColor: `rgba(255, 255, 255)` }}
        role="status"
        aria-live="polite"
    >
        <div className="SecondaryMainloader" aria-label="Loading"></div>
    </div>
);

export default SessionLoadingState;