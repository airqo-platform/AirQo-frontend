"use client";
import React, { useState, useEffect } from "react";
import DocHeader from "@/components/docs/DocHeader";
import TableOfContents from "@/components/docs/TableOfContents";
import InstallationSection from "@/components/docs/InstallationSection";
import QuickStartSection from "@/components/docs/QuickStartSection";
import APIReferenceSection from "@/components/docs/APIReferenceSection";
import StylingSection from "@/components/docs/StylingSection";
import TypeScriptSection from "@/components/docs/TypeScriptSection";
import VueSection from "@/components/docs/VueSection";
import UtilitiesAndHooksSection from "@/components/docs/UtilitiesAndHooksSection"; // Renamed & Enhanced
import ExamplesSection from "@/components/docs/ExamplesSection";
import FlutterSection from "@/components/docs/FlutterSection";
import PerformanceSection from "@/components/docs/PerformanceSection"; // New Component
import FooterCTA from "@/components/docs/FooterCTA";

export default function DocsPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DocHeader />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex lg:gap-12">
          <main className="lg:w-3/4 prose prose-lg dark:prose-invert max-w-none">
            <InstallationSection />
            <QuickStartSection />
            <APIReferenceSection />
            <StylingSection />
            <TypeScriptSection />
            <VueSection />
            <UtilitiesAndHooksSection /> {/* Updated Component */}
            <PerformanceSection /> {/* New Component */}
            <ExamplesSection />
            <FlutterSection />
            <FooterCTA />
          </main>
          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-16">
              <TableOfContents />
            </div>
          </aside>
        </div>
      </div>
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
