"use client";

import { NetworkMap } from "@/components/network-map/network-map";
import { StatusSummary } from "@/components/network-map/status-summary";

export default function NetworkMapPage() {
  return (
    <div className="h-screen w-full relative">
      <div 
        className="absolute z-10 h-screen overflow-y-auto m-2"
        style={{
          width: '280px',
          msOverflowStyle: 'none',  /* Hide scrollbar for IE and Edge */
          scrollbarWidth: 'none',   /* Hide scrollbar for Firefox */
          WebkitOverflowScrolling: 'touch', /* Smooth scrolling for iOS */
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;  /* Hide scrollbar for Chrome, Safari and Opera */
          }
        `}</style>
        <StatusSummary />
      </div>
      <div className="h-screen w-full">
        <NetworkMap />
      </div>
    </div>
  );
} 