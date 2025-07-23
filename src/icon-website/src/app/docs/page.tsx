"use client";
import DocHeader from "@/components/docs/DocHeader";
import TableOfContents from "@/components/docs/TableOfContents";
import InstallationSection from "@/components/docs/InstallationSection";
import QuickStartSection from "@/components/docs/QuickStartSection";
import APIReferenceSection from "@/components/docs/APIReferenceSection";
import StylingSection from "@/components/docs/StylingSection";
import TypeScriptSection from "@/components/docs/TypeScriptSection";
import UtilitiesSection from "@/components/docs/UtilitiesSection";
import ExamplesSection from "@/components/docs/ExamplesSection";
import FlutterSection from "@/components/docs/FlutterSection";
import FooterCTA from "@/components/docs/FooterCTA";

export default function DocsPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DocHeader />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-4 lg:gap-12">
            <aside className="hidden lg:block">
              <TableOfContents />
            </aside>
            <main className="lg:col-span-3 prose prose-lg dark:prose-invert max-w-none">
              <InstallationSection />
              <QuickStartSection />
              <APIReferenceSection />
              <StylingSection />
              <TypeScriptSection />
              <UtilitiesSection />
              <ExamplesSection />
              <FlutterSection />
              <FooterCTA />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
