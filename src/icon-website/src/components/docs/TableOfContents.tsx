"use client";
import React, { useState, useEffect } from "react";
import clsx from "clsx";

export default function TableOfContents() {
  const [activeId, setActiveId] = useState<string>("");

  const sections = [
    { id: "installation", title: "Installation" },
    { id: "quick-start", title: "Quick Start" },
    { id: "api-reference", title: "API Reference" },
    { id: "styling", title: "Styling" },
    { id: "typescript", title: "TypeScript" },
    { id: "vue", title: "Vue 3 Package" },
    { id: "utilities-hooks", title: "Utilities & Hooks" },
    { id: "performance", title: "Performance" },
    { id: "examples", title: "Examples" },
    { id: "flutter", title: "Flutter Package" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66% 0px" }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Table of Contents
      </h3>
      <nav className="space-y-1">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              setActiveId(s.id);
            }}
            className={clsx(
              "block py-1.5 px-3 text-sm rounded-md transition-colors",
              activeId === s.id
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            {s.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
