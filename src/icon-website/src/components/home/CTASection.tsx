"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
const modernBlue = "#0A84FF";

export default function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className="text-center rounded-2xl p-12 text-white"
          style={{ backgroundColor: modernBlue }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of developers using AirQO Icons.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/icons"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-transform hover:scale-105"
            >
              Browse Icons <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-transform hover:scale-105"
            >
              Read Docs
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
