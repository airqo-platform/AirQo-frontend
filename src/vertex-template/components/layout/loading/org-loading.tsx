"use client";

// Loading component for organization switching
const OrganizationLoadingState = ({ organizationName }: { organizationName: string }) => (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-center items-center transition-colors duration-300" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    }}>
        <div className="flex flex-col items-center space-y-6 max-w-md mx-auto px-6">
            {/* Spinner */}
            <div className="relative">
            <div className="secondary-main-loader" aria-label="Loading"></div>
            </div>

            <div className="text-center space-y-2">
                {/* Organization name */}
                <h1 className="text-lg uppercase font-semibold transition-colors duration-300 text-gray-900">
                    {organizationName}
                </h1>

                {/* Loading text */}
                <p className="text-sm animate-pulse transition-colors duration-300 text-gray-600">
                    Setting up workspace...
                </p>
            </div>
        </div>
    </div>
);

export default OrganizationLoadingState;