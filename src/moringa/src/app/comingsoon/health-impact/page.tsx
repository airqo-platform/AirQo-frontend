"use client"
import Link from "next/link"
import Image from "next/image"
import Navigation from "@/components/navigation/navigation"
import { HeartPulse, Activity, Shield, Users, ArrowRight } from "lucide-react"

const pillars = [
  {
    icon: <Activity className="w-6 h-6 text-blue-700" />,
    title: "Exposure modeling",
    description: "Combine air quality fields with population distribution, time-activity patterns, and vulnerability indicators.",
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-700" />,
    title: "Risk estimation",
    description: "Translate exposures into health impact metrics using peer-reviewed concentration-response functions.",
  },
  {
    icon: <Users className="w-6 h-6 text-blue-700" />,
    title: "Equity insights",
    description: "Highlight groups and neighborhoods bearing disproportionate burden to guide targeted interventions.",
  },
]

const outputs = [
  "Health-weighted pollution burden by neighborhood and demographic group",
  "Attributable cases estimates (e.g., hospital visits) with uncertainty bands",
  "Scenario comparisons for interventions and seasonal changes",
  "Downloadable summaries and visualizations for policy briefs",
]

export default function HealthImpactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-12 md:py-16 space-y-16">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              <HeartPulse className="w-4 h-4 mr-2" />
              Health Impact
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              How AI links air quality to health outcomes
            </h1>
            <p className="text-lg text-gray-700">
              We pair exposure models with epidemiological evidence to estimate health impacts, helping policymakers
              prioritize interventions that matter most for communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/comingsoon"
                className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition"
              >
                View Roadmap
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
                  <HeartPulse className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Why health impact modeling</h3>
                  <p className="text-gray-700">
                    Translating pollution into health metrics puts urgency and equity into focus-showing where cleaner air delivers the biggest human gains.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Inputs</p>
                  <p className="text-gray-700">
                    High-resolution concentration fields, population and vulnerability data, baseline health rates, and weather modifiers.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Outputs</p>
                  <p className="text-gray-700">
                    Health burden estimates, uncertainty ranges, and maps that highlight priority areas.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-blue-100 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-700/50 to-blue-400/50 z-10"></div>
              <Image
                src="/images/model/calibration-header.webp"
                alt="Health impact visualization"
                width={1000}
                height={700}
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute bottom-4 left-4 z-20 bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold text-blue-900 shadow">
                Health burden modeling
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-1 bg-blue-700 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Our approach</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((item) => (
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
              Clear, defensible health impact estimates that connect air quality to human outcomes, ready for policy briefs and funding proposals.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold">Transparent and equitable</h2>
            <p className="text-blue-50">
              Every estimate carries context on data sources, assumptions, and uncertainty so communities and policymakers can trust the results.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Explainable</p>
                <p className="text-blue-50 text-sm">See which factors drive risk in each neighborhood.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Actionable</p>
                <p className="text-blue-50 text-sm">Compare scenarios to plan interventions and funding.</p>
              </div>
            </div>
            <Link
              href="/comingsoon"
              className="inline-flex items-center gap-2 bg-white text-blue-800 px-5 py-3 rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
            >
              Follow progress
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
