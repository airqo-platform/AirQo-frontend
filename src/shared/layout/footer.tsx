'use client';

import * as React from 'react';

/*
 * Copied from vertex/components/layout/Footer.tsx. Nexus's ui/footer.tsx is the
 * same apart from the product line, which is now a prop.
 */
interface FooterProps {
  /** e.g. "AirQo Vertex Platform", "Air Quality Nexus Platform". */
  productName: string;
}

export const Footer: React.FC<FooterProps> = ({ productName }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-2">
      <div className="container px-4 mx-auto text-center">
        <p className="text-xs m-0 text-muted-foreground">
          © {currentYear} AirQo. All rights reserved.
        </p>
        <p className="text-xs m-0 text-muted-foreground">{productName}</p>
      </div>
    </footer>
  );
};

export default Footer;
