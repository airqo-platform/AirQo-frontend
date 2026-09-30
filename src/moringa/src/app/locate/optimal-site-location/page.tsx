"use client"
import Link from "next/link"
import Image from "next/image"
import Navigation from "@/components/navigation/navigation"
import { MapPin, Layers, Ruler, Gauge, Sparkles, ArrowRight } from "lucide-react"

const methodSteps = [
  {
    icon: <Layers className="w-6 h-6 text-blue-700" />,
    title: "Multi-layer data",
    description: "Blend population density, land use, pollution sources, terrain, and existing monitors for a full context of each candidate location.",
  },
  {
    icon: <Ruler className="w-6 h-6 text-blue-700" />,
    title: "Constraint-aware siting",
    description: "Respect minimum spacing, must-have points, and geographic boundaries so recommendations are actionable in the field.",
  },
  {
    icon: <Gauge className="w-6 h-6 text-blue-700" />,
    title: "Exposure coverage",
    description: "Prioritize areas with higher population or vulnerable groups while ensuring coverage of key emission hotspots.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-blue-700" />,
    title: "Iterative optimization",
    description: "Run simulations across thousands of candidates and keep the configuration that maximizes coverage with the fewest devices.",
  },
]

const deliveryItems = [
  "Downloadable CSV with recommended coordinates, tagged by priority",
  "Interactive map to review, adjust, and lock must-have locations",
  "Clear rationale for each suggested site: population, source proximity, and coverage gain",
  "Ability to rerun scenarios with new constraints in seconds",
]

export default function OptimalSiteLocationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-12 md:py-16 space-y-16">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4 mr-2" />
              Optimal Site Location
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              How we pick the best places to deploy air quality sensors
            </h1>
            <p className="text-lg text-gray-700">
              Our site locator blends geospatial data, demographic insights, and constraint-aware optimization to surface
              monitoring spots that maximize coverage and impact. Every recommendation comes with the evidence behind it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/locate"
                className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition"
              >
                Launch Site Locator
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
                  <h3 className="text-xl font-semibold">What makes a site optimal?</h3>
                  <p className="text-gray-700">
                    High coverage, strong signal on pollution sources, reliable access, and adherence to deployment
                    rules. We balance these factors automatically so you deploy fewer sensors with better insight.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Inputs</p>
                  <p className="text-gray-700">
                    Boundaries or drawn polygons, number of sensors, minimum spacing, must-have points, and optional CSV
                    uploads of important sites.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Outputs</p>
                  <p className="text-gray-700">
                    Ranked coordinates with scores for population coverage, source proximity, and marginal gain.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-blue-100 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-700/50 to-blue-400/50 z-10"></div>
              <Image
                src="/images/model/locate.webp"
                alt="Optimal site locator visualization"
                width={1000}
                height={700}
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute bottom-4 left-4 z-20 bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold text-blue-900 shadow">
                AI-assisted site placement
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
            {methodSteps.map((step) => (
              <div
                key={step.title}
                className="h-full bg-white border border-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-700 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-8 space-y-4">
            <h2 className="text-2xl font-bold">What you get</h2>
            <p className="text-gray-700">
              The tool translates complex geospatial analysis into a clear deployment plan. Each run is reproducible and
              can be tuned with new inputs at any time.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {deliveryItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold">Field-ready and transparent</h2>
            <p className="text-blue-50">
              We pair AI recommendations with the context teams need to validate sites on the ground: access hints,
              nearby infrastructure, and why each point was chosen.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Validation-friendly</p>
                <p className="text-blue-50 text-sm">
                  Export results for offline review and sync updates when back online.
                </p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Continuous improvement</p>
                <p className="text-blue-50 text-sm">
                  Rerun scenarios as new monitors come online or priorities shift.
                </p>
              </div>
            </div>
            <Link
              href="/locate"
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
