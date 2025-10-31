import React from 'react';
import { MapSidebar, MapBox } from '@/modules/airqo-map';

const Page = () => {
  return (
    <div className="flex h-full gap-2">
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
  );
};

export default Page;
