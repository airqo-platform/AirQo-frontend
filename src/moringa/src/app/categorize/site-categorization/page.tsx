"use client"
import Link from "next/link"
import Image from "next/image"
import Navigation from "@/components/navigation/navigation"
import { Layers, MapPin, Activity, ShieldCheck, Sparkles, ArrowRight } from "lucide-react"

const approach = [
  {
    icon: <Layers className="w-6 h-6 text-blue-700" />,
    title: "Data-rich context",
    description: "Blend land use, road networks, night lights, vegetation, and industrial footprints to understand each site's environment.",
  },
  {
    icon: <Activity className="w-6 h-6 text-blue-700" />,
    title: "Signal vs. background",
    description: "Differentiate near-source hotspots from representative background areas so monitoring is balanced and meaningful.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-700" />,
    title: "Robust features",
    description: "Use features resilient to noisy data: proximity bands, traffic intensity, urban density, elevation, and upwind/downwind cues.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-blue-700" />,
    title: "Model transparency",
    description: "Expose the evidence behind each classification so teams can trust the recommendation and override when needed.",
  },
]

const outputs = [
  "Category label for every coordinate: Urban, Urban Background, or Background",
  "Supporting attributes: nearest road class, land cover, and point-of-interest density",
  "Downloadable CSV of results for bulk uploads",
  "Interactive map to verify, edit, and re-run scenarios quickly",
]

export default function SiteCategorizationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-12 md:py-16 space-y-16">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4 mr-2" />
              Site Categorization
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              How we classify monitoring sites for clean, comparable data
            </h1>
            <p className="text-lg text-gray-700">
              We combine geospatial layers and machine learning to assign each coordinate to a category that reflects
              its local environment. That keeps your network balanced between hotspots and representative background sites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/categorize"
                className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition"
              >
                Launch Categorize
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-blue-200 text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <MapPin className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Why categorization matters</h3>
                  <p className="text-gray-700">
                    Consistent categories let you compare pollution levels across contexts, evaluate interventions, and
                    ensure models and policies are anchored in representative data.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Inputs</p>
                  <p className="text-gray-700">
                    Single clicks on the map, CSV uploads of coordinates, or pasted lists. Optional: area of interest for focused analysis.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Outputs</p>
                  <p className="text-gray-700">
                    Category, nearby context indicators, and rationale for each point—ready for download or immediate use.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-blue-100 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-700/50 to-blue-400/50 z-10"></div>
              <Image
                src="/images/model/categorisemap.webp"
                alt="Categorization map visualization"
                width={1000}
                height={700}
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute bottom-4 left-4 z-20 bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold text-blue-900 shadow">
                AI-assisted site categorization
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-1 bg-blue-700 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Our approach</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map((item) => (
              <div
                key={item.title}
                className="h-full bg-white border border-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-700 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-8 space-y-4">
            <h2 className="text-2xl font-bold">What you get</h2>
            <p className="text-gray-700">
              Each run produces a transparent, defensible classification for every site. Results can be exported or
              iterated on as your network evolves.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold">Built for planning and QA</h2>
            <p className="text-blue-50">
              Use the map to verify categories visually, override edge cases, and keep a clean audit trail for every
              decision.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Explainability</p>
                <p className="text-blue-50 text-sm">See the features and context that drove each classification.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Fast iteration</p>
                <p className="text-blue-50 text-sm">Rerun with new coordinate sets or AOIs in seconds.</p>
              </div>
            </div>
            <Link
              href="/categorize"
              className="inline-flex items-center gap-2 bg-white text-blue-800 px-5 py-3 rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
            >
              Start a run
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
