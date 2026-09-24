import { BarChart, Bot, Map as MapIcon, Satellite, Thermometer, Wind, AlertTriangle, Database, MapPin } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation/navigation";
import { FeatureCard } from "@/components/feature-card"; // Assuming FeatureCard is in this path

export default function AIModels() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      <main className="flex-1 px-4 py-12">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            AI Models at AirQo
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            At AirQo, we leverage cutting-edge AI to revolutionize air quality monitoring across African cities. Explore our innovative models driving real-time insights, predictive analytics, and community empowerment.
          </p>
        </header>

        <section className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Our AI-Powered Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="AirQalibrate"
              description="AirQalibrate is a Machine Learning based calibration tool that eliminates the need for reference-grade monitors or on-site monitor calibration."
              Icon={Thermometer}
              href="https://airqo.net/products/calibrate"
              openInNewTab={true}
              imageSrc="/images/model/airqalibration.webp"
            />
            <FeatureCard
              title="Fault Detection"
              description="Uses the Isolation Forest model to detect anomalies in sensor devices, identifying issues like electromagnetic interference or dust accumulation."
              Icon={AlertTriangle}
              href="https://platform.airqo.net/api/v2/predict/faulty-devices?token={add-your-api-token-here}"
              openInNewTab={true}
              imageSrc="/images/model/calibration-header.webp"
            />
            <FeatureCard
              title="Air Quality Forecast"
              description="Predicts future air quality levels to inform individual and policy decisions, minimizing exposure to pollution."
              Icon={Wind}
              href="https://analytics.airqo.net/map"
              openInNewTab={true}
              imageSrc="/images/model/forecast.webp"
            />
            <FeatureCard
              title="Pollution Heatmap"
              description="Visualizes air pollution levels across regions, helping identify high-risk areas for targeted interventions."
              Icon={MapIcon} 
              href="https://ai.airqo.net/map"
              openInNewTab={true}
              imageSrc="/images/model/heatap.webp"
            />
            <FeatureCard
              title="PM2.5 Prediction"
              description="Leverages satellite data to predict PM2.5 concentrations, providing insights into fine particulate matter pollution."
              Icon={Satellite}
              href="https://ai.airqo.net/map"
              openInNewTab={true}
              imageSrc="/images/model/predictsatellite.webp"
            />
            <FeatureCard
              title="Locate"
              description="Pinpoints air quality monitoring stations, enabling communities to access localized pollution data."
              Icon={MapPin}
              href="https://ai.airqo.net/locate"
              openInNewTab={true}
              imageSrc="/images/model/locate.webp"
            />
            <FeatureCard
              title="Stationary Pollution Source"
              description="Identifies pollution sources using satellite imagery and TensorFlow models, aiding in targeted mitigation strategies."
              Icon={Database}
              href="https://ai.airqo.net/"
              openInNewTab={true}
              imageSrc="/images/model/calibration-header.webp"
            />
          </div>
        </section>

        <section className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Future Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Chatbot"
              description="An AI-powered chatbot to provide real-time air quality information and answer user queries interactively."
              Icon={Bot}
              href="https://airqo.net"
              openInNewTab={true}
              imageSrc="/images/model/chatbot.webp"
            />
            <FeatureCard
              title="Filling Missing Data"
              description="Advanced algorithms to impute missing air quality data, ensuring continuous and reliable monitoring."
              Icon={Database}
              href="https://airqo.net"
              openInNewTab={true}
              imageSrc="/images/model/fillingap.webp"
            />
            <FeatureCard
              title="Land Use Model"
              description="Analyzes land use patterns to understand their impact on air quality, supporting urban planning and policy."
              Icon={BarChart}
              href="https://airqo.net"
              openInNewTab={true}
              imageSrc="/images/model/landuse.webp"
            />
          </div>
        </section>

        <footer className="text-center text-gray-600 py-6 animate-fade-in">
          <p>
            Learn more about our mission at{" "}
            <Link href="https://airqo.net" className="text-blue-600 hover:underline">
              airqo.net
            </Link>
          </p>
          <p className="mt-2">© 2025 AirQo AI. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}