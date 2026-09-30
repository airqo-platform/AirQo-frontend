"use client"
import Link from "next/link"
import Image from "next/image"
import Navigation from "@/components/navigation/navigation"
import { BarChart3, BrainCircuit, LineChart, Layers, ArrowRight } from "lucide-react"

const pillars = [
  {
    icon: <Layers className="w-6 h-6 text-blue-700" />,
    title: "Data fusion",
    description: "Combine sensor readings with weather, mobility, satellite observations, and emissions inventories for richer context.",
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-blue-700" />,
    title: "Predictive modeling",
    description: "Use machine learning to forecast pollution levels, fill gaps, and detect anomalies in near real-time.",
  },
  {
    icon: <LineChart className="w-6 h-6 text-blue-700" />,
    title: "Insight delivery",
    description: "Serve dashboards, alerts, and exportable reports tuned to researchers, regulators, and communities.",
  },
]

const outputs = [
  "City and neighborhood air quality dashboards with trends and exceedances",
  "Forecasts to support planning around events, traffic, and weather shifts",
  "Automated QA/QC flags and anomaly detection for sensor health",
  "Report-ready downloads: CSV, charts, and embeddable widgets",
]

export default function DataAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-12 md:py-16 space-y-16">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              Data Analytics
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              How we turn raw air quality data into actionable insight
            </h1>
            <p className="text-lg text-gray-700">
              Our analytics layer blends AI models with domain expertise to clean, contextualize, and visualize air
              quality data for decision-makers. Every chart and alert is backed by transparent methods.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="https://analytics.airqo.net/"
                className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition"
              >
                Open Analytics
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
                  <BarChart3 className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">What “analytics” means here</h3>
                  <p className="text-gray-700">
                    Clean data pipelines, calibrated sensors, explainable models, and visual stories tailored to local
                    policy and community needs.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Inputs</p>
                  <p className="text-gray-700">
                    Continuous sensor feeds, weather and satellite layers, land use, traffic intensity, and historical baselines.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Outputs</p>
                  <p className="text-gray-700">
                    Forecasts, exceedance alerts, health-relevant indices, and exportable visuals for reports.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-blue-100 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-700/50 to-blue-400/50 z-10"></div>
              <Image
                src="/images/model/analyticsHome.webp"
                alt="Air quality analytics dashboard"
                width={1000}
                height={700}
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute bottom-4 left-4 z-20 bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold text-blue-900 shadow">
                AI-driven analytics and reporting
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
              Analytics outputs are ready for action—whether you are drafting policy, planning interventions, or informing the public.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold">Operational and transparent</h2>
            <p className="text-blue-50">
              Clear provenance, QA checks, and audit trails accompany every chart and forecast so teams can trust and act on the results.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Explainable</p>
                <p className="text-blue-50 text-sm">Show model drivers, data freshness, and uncertainty ranges.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm font-semibold">Action-ready</p>
                <p className="text-blue-50 text-sm">Subscribe to alerts, export charts, and share links with stakeholders.</p>
              </div>
            </div>
            <Link
              href="https://analytics.airqo.net/"
              className="inline-flex items-center gap-2 bg-white text-blue-800 px-5 py-3 rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
            >
              Explore analytics
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
