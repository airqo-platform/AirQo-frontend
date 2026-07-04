"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { vertexConfig } from '@/vertex.config';

const APP_TITLE = vertexConfig.org.name;

interface PageTitleValue {
  title: string;
  section?: string;
}

interface PageTitleContextValue extends PageTitleValue {
  setPageTitle: (value: PageTitleValue) => void;
  clearPageTitle: () => void;
}

type PageTitleOverride = PageTitleValue & {
  pathname: string | null;
};

const PageTitleContext = createContext<PageTitleContextValue | undefined>(
  undefined
);

const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const cleanDocumentTitle = () => {
  if (typeof document === "undefined") return "";
  return document.title
    .replace(new RegExp(`\\s*\\|\\s*${APP_TITLE}$`), "")
    .trim();
};

const getFallbackTitle = (pathname: string | null): PageTitleValue => {
  if (!pathname) return { title: "this page" };

  const exactRouteTitles: Record<string, PageTitleValue> = {
    "/home": { title: "Home" },
    "/devices/my-devices": { title: "My Devices", section: "Devices" },
    "/devices/overview": { title: "Devices" },
    "/sites/overview": { title: "Sites" },
    "/cohorts": { title: "Cohorts" },
    "/admin/networks": {
      title: "Sensor Manufacturers",
      section: "Administrative Panel",
    },
    "/admin/networks/requests": {
      title: "Manufacturer Requests",
      section: "Administrative Panel",
    },
    "/admin/cohorts": { title: "Cohorts", section: "Administrative Panel" },
    "/admin/sites": { title: "Sites", section: "Administrative Panel" },
  };

  if (exactRouteTitles[pathname]) return exactRouteTitles[pathname];

  const dynamicRouteTitles: Array<[RegExp, PageTitleValue]> = [
    [
      /^\/admin\/sites\/[^/]+\/devices\/[^/]+$/,
      { title: "Device Details", section: "Sites" },
    ],
    [/^\/admin\/sites\/[^/]+$/, { title: "Site Details", section: "Sites" }],
    [/^\/sites\/[^/]+$/, { title: "Site Details", section: "Sites" }],
    [
      /^\/admin\/cohorts\/[^/]+\/devices\/[^/]+$/,
      { title: "Device Details", section: "Cohorts" },
    ],
    [
      /^\/admin\/cohorts\/[^/]+$/,
      { title: "Cohort Details", section: "Cohorts" },
    ],
    [/^\/cohorts\/[^/]+$/, { title: "Cohort Details", section: "Cohorts" }],
    [
      /^\/admin\/networks\/[^/]+\/devices\/[^/]+$/,
      { title: "Device Details", section: "Sensor Manufacturers" },
    ],
    [
      /^\/admin\/networks\/[^/]+$/,
      { title: "Sensor Manufacturer Details", section: "Sensor Manufacturers" },
    ],
    [
      /^\/devices\/overview\/[^/]+$/,
      { title: "Device Details", section: "Devices" },
    ],
  ];

  const dynamicMatch = dynamicRouteTitles.find(([pattern]) =>
    pattern.test(pathname)
  );
  if (dynamicMatch) return dynamicMatch[1];

  const lastSegment = pathname.split("/").filter(Boolean).pop();
  const documentTitle = cleanDocumentTitle();

  return {
    title: documentTitle || (lastSegment ? titleCase(lastSegment) : "this page"),
  };
};

const formatBrowserTitle = ({ title, section }: PageTitleValue) => {
  if (!title || title === "this page") return APP_TITLE;
  if (section && section !== title) return `${title} | ${section} | ${APP_TITLE}`;
  return `${title} | ${APP_TITLE}`;
};

export const PageTitleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [overrideTitle, setOverrideTitle] = useState<PageTitleOverride | null>(
    null
  );

  const fallbackTitle = useMemo(() => getFallbackTitle(pathname), [pathname]);
  const currentTitle =
    overrideTitle?.pathname === pathname ? overrideTitle : fallbackTitle;
  const setPageTitle = useCallback(
    (value: PageTitleValue) => setOverrideTitle({ ...value, pathname }),
    [pathname]
  );
  const clearPageTitle = useCallback(() => setOverrideTitle(null), []);

  useEffect(() => {
    const expectedTitle = formatBrowserTitle(currentTitle);
    const applyTitle = () => {
      if (document.title !== expectedTitle) {
        document.title = expectedTitle;
      }
    };

    applyTitle();

    const timeoutId = window.setTimeout(applyTitle, 0);
    const animationFrameId = window.requestAnimationFrame(applyTitle);

    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [currentTitle]);

  const value = useMemo<PageTitleContextValue>(
    () => ({
      ...currentTitle,
      setPageTitle,
      clearPageTitle,
    }),
    [clearPageTitle, currentTitle, setPageTitle]
  );

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitleContext = () => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitleContext must be used within PageTitleProvider");
  }
  return context;
};

export const usePageTitle = ({ title, section }: PageTitleValue) => {
  const { setPageTitle, clearPageTitle } = usePageTitleContext();

  useEffect(() => {
    if (!title) return;
    setPageTitle({ title, section });
    return () => clearPageTitle();
  }, [clearPageTitle, section, setPageTitle, title]);
};
