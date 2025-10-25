'use client';

import * as React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-2">
      <div className="container px-4 mx-auto text-center">
        <p className="text-xs text-muted-foreground">
          © 2025 AirQo. All rights reserved.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Air Quality Analytics Platform
        </p>
      </div>
    </footer>
  );
};

export default Footer;
