"use client";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/report");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <div className="text-center">
        <h1 className="text-6xl text-white font-bold">404</h1>
        <p className="text-xl text-white mt-4 mb-8">Page Not Found</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 text-blue-600 font-semibold bg-white rounded"
        >
          Go back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
