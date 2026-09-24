import { Mail } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation/navigation";

export default function ComingSoon() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-4">
            AirQo AI: Coming Soon
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Revolutionizing air quality monitoring in African cities with AI-powered insights. Get ready for real-time data, advanced analytics, and community-driven solutions!
          </p>
        </header>

        <section className="w-full max-w-md animate-fade-in-up">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Stay in the Loop
          </h2>
          <form className="flex items-center bg-white border rounded-lg p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <Mail className="h-6 w-6 text-blue-500 mx-2" aria-hidden="true" />
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="flex-1 p-2 outline-none text-gray-700 bg-transparent"
              aria-label="Email address for updates"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Subscribe
            </button>
          </form>
        </section>
      </main>

      <footer className="mt-12 text-center text-gray-600 py-6 animate-fade-in">
        <p>
          Learn more about us at{" "}
          <Link href="https://ai.aiqo.net" className="text-blue-600 hover:underline">
            ai.aiqo.net
          </Link>
        </p>
        <p className="mt-2">© 2025 AirQo AI. All rights reserved.</p>
      </footer>
    </div>
  );
}