'use client';

import * as React from 'react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-2">
            <div className="container px-4 mx-auto text-center">
                <p className="text-xs m-0 text-muted-foreground">
                    © {currentYear} AirQo. All rights reserved.
                </p>
                <p className="text-xs m-0 text-muted-foreground">
                    AirQo Vertex Platform
                </p>
            </div>
        </footer>
    );
};

export default Footer;
