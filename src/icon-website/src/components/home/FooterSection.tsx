import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
const modernBlue = "#0A84FF";

export default function FooterSection() {
  return (
    <footer className="py-12 text-white bg-gray-900">
      <div className="px-4 mx-auto text-center max-w-7xl">
        <div className="flex items-center justify-center mb-4 space-x-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: modernBlue }}
          >
            <Heart className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">AirQo Icons</span>
        </div>
        <p className="mb-4 text-gray-400">
          Built with ❤️ by the AirQo Platform team
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            href="https://github.com/airqo-platform/airqo-libraries"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-white"
          >
            GitHub
          </Link>
          <Link
            href="https://airqo.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-white"
          >
            AirQo
          </Link>
        </div>
      </div>
    </footer>
  );
}
