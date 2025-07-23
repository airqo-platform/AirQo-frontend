import React, { useMemo } from "react";
import { AirQOIconsUtils } from "@airqo/icons-react";

export default function IconLibraryHeader() {
  const count = useMemo(() => {
    try {
      return AirQOIconsUtils.getAllIcons().length;
    } catch (error) {
      console.error("Failed to load icons:", error);
      return 0;
    }
  }, []);
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Icon Library
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {count}+ high-quality icons ready to use
        </p>
      </div>
    </header>
  );
}
