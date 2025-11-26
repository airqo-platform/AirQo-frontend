import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | AirQO Icons",
  description:
    "Sorry, the page you are looking for does not exist. Discover AirQO Icons, a free, beautiful React icon library for developers.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "404 - Page Not Found | AirQO Icons",
    description:
      "Sorry, the page you are looking for does not exist. Discover AirQO Icons, a free, beautiful React icon library for developers.",
    url: "https://airqo-icons.vercel.app/404",
    siteName: "AirQO Icons",
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
    title: "404 - Page Not Found | AirQO Icons",
    description:
      "Sorry, the page you are looking for does not exist. Discover AirQO Icons, a free, beautiful React icon library for developers.",
    images: ["/airqo_logo.svg"],
  },
};
