import "./globals.css";
import type { Metadata } from "next";
import Navigation from "@/components/ui/Navigation";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AirQo Icons - Beautiful React Icons Library",
  description:
    "AirQo Icons: High-quality React icon components with TypeScript support. 1,376+ icons, flat import structure, tree-shakable, customizable, and optimized for modern web applications.",
  keywords: [
    "icons",
    "react",
    "nextjs",
    "typescript",
    "svg",
    "components",
    "airqo icons",
    "icon library",
    "react icons",
    "svg icons",
  ],
  authors: [{ name: "AirQo Platform", url: "https://airqo.net/" }],
  openGraph: {
    title: "AirQo Icons - Beautiful React Icons Library",
    description:
      "AirQo Icons: High-quality React icon components with TypeScript support. 1,376+ icons.",
    url: "https://airqo-icons.vercel.app",
    siteName: "AirQo Icons",
    images: [
      {
        url: "/airqo_logo.svg",
        width: 1200,
        height: 630,
        alt: "AirQO Icons Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AirQo Icons - Beautiful React Icons Library",
    description:
      "AirQo Icons: High-quality React icon components with TypeScript support. 1,376+ icons.",
    images: ["/airqo_logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Canonical link for SEO */}
        <link rel="canonical" href="https://airqo-icons.vercel.app/" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navigation />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
