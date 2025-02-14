'use client'
import React, { useEffect, useRef } from 'react'
import { Input } from '../ui/input'
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const NetManagerMap = () => {

        const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpYWxpZ2h0IiwiYSI6ImNtNzJsMnZnbjBhajIyanIwN3A3eWY2YmUifQ.x0x411yjbETiJ-F8ebivHQ';

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [-74.5, 40], // starting position [lng, lat]
        zoom: 9 // starting zoom
      });
    }
  });
  return (
        <div className="flex h-screen gap-2 "> 
        <div className="flex bg-blue-500 p-1 rounded-lg">
          <div className="flex flex-col gap-3">
            <h1 className="font-bold">Net Manager Map</h1>
            <Input placeholder="Search" name="Search" className="w-full" /> 
          </div>
        </div>
      
        <div className="flex-grow ml-[1%] "> 
          <div ref={mapContainerRef} className="rounded-lg map-container w-full h-full"></div>
        </div>
      </div>
  )
}

export default NetManagerMap