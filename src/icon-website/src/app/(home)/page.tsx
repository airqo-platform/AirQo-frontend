"use client";
import React, { useEffect } from "react";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CodeExampleSection from "@/components/home/CodeExampleSection";
import CTASection from "@/components/home/CTASection";
import FooterSection from "@/components/home/FooterSection";
/* ---------- JSON-LD for SEO ---------- */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "AirQo Icons",
  description:
    "Free, beautiful, customizable multi-framework SVG icon library for React, Vue, and Flutter by AirQo.",
  brand: {
    "@type": "Brand",
    name: "AirQo Platform",
    url: "https://airqo.net/",
  },
  url: "https://aero-glyphs.vercel.app",
  image: "https://aero-glyphs.vercel.app/airqo_logo.svg",
  author: {
    "@type": "Organization",
    name: "AirQo Platform",
    url: "https://airqo.net/",
  },
};

export default function HomePage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "airqo-jsonld";
    script.innerHTML = JSON.stringify(JSON_LD);
    document.head.appendChild(script);
    return () => document.getElementById("airqo-jsonld")?.remove();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CodeExampleSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
