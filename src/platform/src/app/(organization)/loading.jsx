export default function OrganizationLoading() {
  return (
    <div className="w-full h-screen flex flex-grow justify-center items-center bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="SecondaryMainloader" aria-label="Loading"></div>
        <p className="text-sm text-gray-600 animate-pulse">
          Loading organization content...
        </p>
      </div>
    </div>
  );
}
