"use client"
import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin, Wind, BarChart3, BrainCircuit, Shield, Database, Cpu, LineChart } from "lucide-react"
import Navigation from "@/components/navigation/navigation"
import { FeatureCard } from "@/components/feature-card"

const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center bg-blue-50 p-8 dark:bg-slate-900">
        <div className="absolute inset-0 bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-slate-950 dark:text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                AI-Powered Air Quality Monitoring
              </h1>
              <p className="text-lg text-slate-700 dark:text-slate-300 md:text-xl">
                AirQo AI provides advanced tools for monitoring, analyzing, and optimizing air quality across African
                cities using artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/map"
                  className="flex items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white px-6 py-3 font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
                >
                  Explore Air Quality Map <ArrowRight size={18} />
                </Link>
                <Link
                  href="/locate"
                  className="bg-blue-700 text-white hover:bg-blue-600 border border-blue-500 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Try Site Locator
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div
                className="relative h-[500px] w-full max-w-[900px] rounded-xl overflow-hidden shadow-2xl mx-auto"
                onDoubleClick={() => (window.location.href = "/map")}
              >
                <Image
                  src="/images/homemap.webp"
                  alt="Air quality monitoring dashboard"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-white py-16 dark:bg-slate-950 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Artificial Intelligence</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-slate-300">
              Our platform leverages cutting-edge AI to provide accurate, real-time air quality data and insights for
              researchers, policymakers, and citizens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              imageSrc="/images/model/locate.webp"
              Icon={MapPin}
              title="Optimal Site Location"
              description="Use AI algorithms to determine the best locations for air quality monitors based on population density, pollution sources, and geographic factors."
              href="/locate/optimal-site-location"
            />
            <FeatureCard
              Icon={Wind}
              title="Air Quality Categorization"
              description="Automatically categorize monitoring sites based on surrounding land use, traffic patterns, and environmental factors."
              href="/categorize/site-categorization"
              imageSrc="/images/model/categorisemap.webp"
            />
            <FeatureCard
              Icon={BarChart3}
              title="Data Analytics"
              description="Generate comprehensive reports with trends, forecasts, and actionable insights from air quality data."
              href="/analytics/data-analytics"
              imageSrc="/images/model/analyticsHome.webp"
            />
            <FeatureCard
              Icon={BrainCircuit}
              title="Machine Learning Models"
              description="Continuously improving prediction models that account for seasonal variations, weather patterns, and human activities."
              href="/models"
              imageSrc="/images/model/modelapi.webp"
            />
            <FeatureCard
              Icon={Shield}
              title="Health Impact Assessment"
              description="Evaluate potential health impacts of air pollution on different population groups and geographic areas."
              href="/comingsoon/health-impact"
              imageSrc="/images/model/calibration-header.webp"
            />
            <FeatureCard
              Icon={MapPin}
              title="Interactive Mapping"
              description="Visualize air quality data across regions with interactive maps showing real-time pollution levels."
              href="/map/interactive-mapping"
              imageSrc="/images/homemap.webp"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section - Redesigned */}
      <section className="bg-gradient-to-b from-gray-50 to-blue-50 py-8 dark:from-slate-900 dark:to-slate-950 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How AirQo AI Works</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-slate-300">
              Our platform combines low-cost sensors, advanced algorithms, and user-friendly interfaces to democratize
              air quality monitoring.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-blue-500 -translate-y-1/2 z-0"></div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              <ProcessCard
                icon={<Database className="w-8 h-8 text-blue-500" />}
                number="01"
                title="Data Collection"
                description="Our network of sensors continuously collects air quality data across multiple locations."
                imageSrc="/images/model/calibration-header.webp"
              />
              <ProcessCard
                icon={<Cpu className="w-8 h-8 text-blue-500" />}
                number="02"
                title="AI Processing"
                description="Advanced algorithms clean, analyze, and interpret the data to generate insights."
                imageSrc="/images/model/modelapi.webp"
              />
              <ProcessCard
                icon={<LineChart className="w-8 h-8 text-blue-500" />}
                number="03"
                title="Actionable Insights"
                description="Users access visualizations, reports, and recommendations through our various platform."
                imageSrc="/images/model/analyticsHome.webp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 py-8 text-slate-950 dark:bg-slate-900 dark:text-white md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Improve Air Quality?</h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-slate-700 dark:text-slate-300">
            Start using our AI-powered tools to make data-driven decisions for cleaner air.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/map"
              className="rounded-lg border border-blue-100 bg-white px-8 py-4 font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
            >
              Explore the Map
            </Link>
            <Link
              href="/locate"
              className="bg-blue-700 text-white hover:bg-blue-600 border border-blue-500 px-8 py-4 rounded-lg font-medium transition-colors"
            >
              Try Site Locator
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mb-12 rounded-lg bg-blue-50 p-8 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <div className="mt-8 border-t border-gray-300 pt-8 text-center text-sm dark:border-slate-700">
          &copy; {new Date().getFullYear()} AirQo. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

// Process Card Component - Redesigned
const ProcessCard = ({
  icon,
  number,
  title,
  description,
  imageSrc,
}: {
  icon: React.ReactNode
  number: string
  title: string
  description: string
  imageSrc?: string
}) => {
  return (
    <div className="relative h-full transform overflow-hidden rounded-xl border border-blue-100 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
      {imageSrc && (
        <div className="absolute inset-0 w-full h-full">
          <Image src={imageSrc || "/placeholder.svg"} alt={title} fill className="object-cover" />
        </div>
      )}
      <div className="flex flex-col items-center relative z-10 bg-gray-900/50 p-4 rounded-2xl backdrop-blur-sm">
        <div className="mb-4 rounded-full bg-white/80 p-2 dark:bg-slate-100/90">{icon}</div>

        {/* Enhanced Number Display */}
        <div className="relative mb-6 mt-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 rounded-full blur-md opacity-75 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full shadow-lg">
            <div className="absolute inset-0.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{number}</span>
            </div>
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-50 shadow-md dark:bg-slate-200"></div>
            <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-blue-50 shadow-md dark:bg-slate-200"></div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3 text-white drop-shadow-md">{title}</h3>
        <p className="text-white text-center drop-shadow-md font-medium">{description}</p>
      </div>
    </div>
  )
}

export default Home
