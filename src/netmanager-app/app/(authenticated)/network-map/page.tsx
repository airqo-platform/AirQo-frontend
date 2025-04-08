"use client";

import { NetworkMap } from "@/components/network-map/network-map";
import { StatusSummary } from "@/components/network-map/status-summary";
import { useEffect, useState } from "react";

export default function NetworkMapPage() {
  const [sidebarOffset, setSidebarOffset] = useState(64);

  useEffect(() => {
    const updateSidebarOffset = () => {
      const sidebar = document.querySelector('.desktop-sidebar');
      if (sidebar) {
        // Get the actual width of the sidebar
        const width = sidebar.getBoundingClientRect().width;
        setSidebarOffset(width);
      }
    };

    // Initial update
    updateSidebarOffset();

    // Create a MutationObserver to watch for changes in the sidebar's width
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateSidebarOffset();
        }
      });
    });

    const sidebar = document.querySelector('.desktop-sidebar');
    if (sidebar) {
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Update on window resize
    window.addEventListener('resize', updateSidebarOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSidebarOffset);
    };
  }, []);

  return (
    <div className="h-screen w-full relative">
      <div 
        className="absolute z-10 h-screen overflow-y-auto"
        style={{ 
          left: `${sidebarOffset}px`,
          top: '0',
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
      <div className="h-full w-full">
        <NetworkMap />
      </div>
    </div>
  );
} 