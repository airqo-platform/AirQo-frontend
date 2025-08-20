// Loading component for organization switching
const OrganizationLoadingState = ({ organizationName }: { organizationName: string }) => (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-center items-center transition-colors duration-300" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    }}>
        <div className="flex flex-col items-center space-y-6 max-w-md mx-auto px-6">
            {/* Spinner */}
            <div className="relative">
                <div className="border-blue-600 rounded-full animate-spin" style={{
                    background: "radial-gradient(farthest-side, var(--color-primary) 94%, #0000) top/8px 8px no-repeat, conic-gradient(#0000 30%, var(--color-primary))",
                    WebkitMask: "radial-gradient(farthest-side, #0000 calc(100% - 8px), #000 0)",
                    width: "50px",
                    aspectRatio: "1",
                    borderRadius: "50%",
                }}></div>
            </div>

            <div className="text-center space-y-2">
                {/* Organization name */}
                <h1 className="text-lg uppercase font-semibold transition-colors duration-300 text-gray-900">
                    {organizationName}
                </h1>

                {/* Loading text */}
                <p className="text-sm animate-pulse transition-colors duration-300 text-gray-600">
                    Loading organization content...
                </p>
            </div>
        </div>
    </div>
);

export default OrganizationLoadingState;