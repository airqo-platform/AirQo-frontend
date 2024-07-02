// Import global styles
import "./globals.scss";

// Import required modules
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/services/themeProvider/ThemeProvider";
import StoreProvider from "./StoreProvider";
import SessionProviderWrapper from "@/services/sessionProvider";
import { Toaster } from "@/components/ui/sonner";

// Set up the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define the metadata for the app
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

// Define the RootLayout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProviderWrapper>
              <>{children}</>
            </SessionProviderWrapper>
          </ThemeProvider>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}