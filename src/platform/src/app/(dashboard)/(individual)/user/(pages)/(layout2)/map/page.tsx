import React from 'react';
import { MapSidebar, MapBox } from '@/modules/airqo-map';
import { BottomNavigation } from '@/shared/components/ui/bottom-navigation';

const Page = () => {
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full overflow-hidden shadow rounded">
        {/* Left Sidebar */}
        <div className="flex-shrink-0 h-full">
          <MapSidebar>
            {/* Sidebar content will go here */}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Map Controls</h3>
              <p className="text-sm text-muted-foreground">
                Map controls and filters will be added here.
              </p>
            </div>
          </MapSidebar>
        </div>

        {/* Right Map Area */}
        <div className="flex-1 min-w-0 h-full">
          <MapBox />
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="flex flex-col h-full md:hidden">
        {/* Map Area - Top 1/3 */}
        <div className="h-1/2 flex-shrink-0">
          <MapBox />
        </div>

        {/* Sidebar Area - Bottom 2/3 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <MapSidebar className="h-full rounded-none">
            {/* Sidebar content will go here */}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Map Controls</h3>
              <p className="text-sm text-muted-foreground">
                Map controls and filters will be added here.
              </p>
            </div>
          </MapSidebar>
        </div>

        {/* Bottom Navigation */}
        <div className="flex-shrink-0">
          <BottomNavigation />
        </div>
      </div>
    </>
  );
};

export default Page;
