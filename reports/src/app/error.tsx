"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ErrorBoundaryImage from "@/public/images/ErrorBoundary.png";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error: React.FC<ErrorProps> = ({ error, reset }) => {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-4 space-y-8 text-center">
        <div className="flex items-center justify-center w-auto h-auto p-3 mx-auto bg-blue-100 rounded-full">
          <Image
            src={ErrorBoundaryImage}
            alt="icon"
            width={200}
            height={200}
            className="mix-blend-multiply"
          />
        </div>
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Oops! Something went wrong
          </h2>
          <p className="text-lg text-gray-500 max-w-lg">
            We&apos;re sorry for the inconvenience. Our team has been notified
            and we&apos;re working on a fix. Please try again later.
          </p>
        </div>
        <div>
          <button
            onClick={() => router.push("/report")}
            className="px-6 py-3 text-lg font-medium text-white bg-blue-700 rounded hover:bg-blue-800"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;
