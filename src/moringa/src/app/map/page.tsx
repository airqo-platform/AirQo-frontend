"use client"
import type React from "react"
import dynamic from "next/dynamic"
import Loading from "../Loading"
import Navigation from "@/components/navigation/navigation"

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => <Loading />,
})

const MapPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Add Navigation Component */}
      <Navigation />

      {/* Map Container with Fixed Height */}
      <div className="flex-1">
        <LeafletMap />
      </div>
    </div>
  )
}

export default MapPage
