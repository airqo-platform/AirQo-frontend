// components/docs/FooterCTA.tsx
import React from "react";

const modernBlue = "#0A84FF";

export default function FooterCTA() {
  return (
    <div
      className="mt-16 p-8 rounded-2xl text-white"
      style={{ backgroundColor: modernBlue }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="mb-6 opacity-90">
          Check out these additional resources or reach out to our community.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/airqo-platform/airqo-libraries" // Update if needed
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow"
          >
            GitHub Repository
          </a>
          <a
            href="https://github.com/airqo-platform/airqo-libraries/issues" // Update if needed
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
          >
            Report Issues
          </a>
        </div>
      </div>
    </div>
  );
}
