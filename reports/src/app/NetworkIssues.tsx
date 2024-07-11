import React from "react";
import Image from "next/image";
import ErrorBoundaryImage from "@/public/images/ErrorBoundary.png";

const NetworkIssues = () => {
  return (
    <div className="flex flex-col items-center p-4 justify-center min-h-screen">
      <Image
        src={ErrorBoundaryImage}
        alt="icon"
        width={250}
        height={250}
        className="mix-blend-multiply mb-4"
      />
      <p className="text-lg text-gray-500 max-w-lg text-center">
        You are offline. Please check your connection.
      </p>
    </div>
  );
};

export default NetworkIssues;
