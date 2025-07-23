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
  name: "AirQO Icons",
  description: "Free, beautiful, customizable React SVG icon library by AirQo.",
  brand: {
    "@type": "Brand",
    name: "AirQO Platform",
    url: "https://airqo.net/",
  },
  url: "https://airqo-icons.vercel.app",
  image: "https://airqo-icons.vercel.app/airqo_logo.svg",
  author: {
    "@type": "Organization",
    name: "AirQO Platform",
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
