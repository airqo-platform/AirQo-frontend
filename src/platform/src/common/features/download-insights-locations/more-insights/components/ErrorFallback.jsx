export default function ErrorFallback({ error, resetError }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-red-600 text-xl mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Reload
      </button>
    </div>
  );
}
