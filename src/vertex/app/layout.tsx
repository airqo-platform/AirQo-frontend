import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';
import { Inter } from 'next/font/google';
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import logger from '@/lib/logger';
import { vertexConfig } from '@/vertex.config';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${vertexConfig.org.name}`,
    default: vertexConfig.org.name,
  },
  description: vertexConfig.org.name + " is a leading air quality monitoring platform.",
  keywords: [
    'air quality',
    'monitoring',
    'analytics',
    'environment',
    'data',
    'management',
    'device',
  ],
  authors: [{ name: `${vertexConfig.org.shortName} Team` }],
  creator: vertexConfig.org.name,
  publisher: vertexConfig.org.name,
  openGraph: {
    title: vertexConfig.org.name,
    description: "Leading air quality device management platform",
    type: 'website',
    url: vertexConfig.org.websiteUrl,
    images: [
      {
        url: vertexConfig.org.logo,
        width: 1200,
        height: 630,
        alt: vertexConfig.org.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: vertexConfig.org.name,
    description: "Leading air quality device management platform",
    images: ['/favicon.ico'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

import { getThemeScript } from '@/lib/theme-utils';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getServerSession(options);
  } catch (error) {
    logger.error("Failed to fetch session:", { error });
  }

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: getThemeScript() }}
        />
      </head>
      <ClientLayout session={session}>{children}</ClientLayout>
    </html>
  );
}
