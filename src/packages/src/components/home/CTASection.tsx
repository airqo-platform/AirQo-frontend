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
            Join thousands of developers using AirQo Icons across React, Vue,
            and Flutter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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

          {/* Package Links */}
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <a
              href="https://www.npmjs.com/package/@airqo/icons-react"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-medium transition-all"
            >
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              React Package
            </a>
            <a
              href="https://www.npmjs.com/package/@airqo/icons-vue"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-medium transition-all"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Vue Package
            </a>
            <a
              href="https://pub.dev/packages/airqo_icons_flutter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-medium transition-all"
            >
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Flutter Package
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
