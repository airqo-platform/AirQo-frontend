// components/icons/IconCard.tsx
import React from "react";
import type { IconMetadata } from "@airqo/icons-react";

interface Props {
  icon: IconMetadata;
  onClick: () => void;
}

export default function IconCard({ icon, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-2 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label={`Select icon ${icon.name}`} // Added aria-label
    >
      <div className="aspect-square flex justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-md p-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        {/* Ensure the component is rendered correctly */}
        <icon.component className="w-full h-full max-w-[30px] text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>
      <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate">
        {icon.name}
      </p>
    </button>
  );
}
