"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid3X3,
  BookOpen,
  Menu,
  X,
  Github,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Icons", href: "/icons", icon: Grid3X3 },
  { name: "Docs", href: "/docs", icon: BookOpen },
];

const modernBlue = "#0A84FF";

export default function Navigation() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/80 backdrop-blur transition-all",
        scrolled ? "fixed top-0 inset-x-0 z-50 shadow-sm" : "relative"
      )}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center space-x-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-md"
              style={{ backgroundColor: modernBlue }}
            >
              <Grid3X3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              AirQo Icons
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="items-center hidden space-x-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center space-x-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  )}
                  style={{ backgroundColor: active ? modernBlue : undefined }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* GitHub link */}
            <a
              href="https://github.com/airqo-platform/airqo-libraries"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* ── Mobile Toggle ── */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex items-center justify-center w-8 h-8 text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="py-2 border-t border-gray-200 md:hidden dark:border-gray-800">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  )}
                  style={{ backgroundColor: active ? modernBlue : undefined }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <a
              href="https://github.com/airqo-platform/airqo-libraries"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <div className="flex items-center space-x-2">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </div>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
