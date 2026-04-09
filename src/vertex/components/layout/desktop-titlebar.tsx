'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

/**
 * DesktopTitleBar
 *
 * A React component that renders a persistent native-like title bar when the
 * app is running inside Electron (AirQo Vertex Desktop). It survives all
 * Next.js page transitions because it lives in the root client layout shell —
 * not in any individual page.
 *
 * Layout interaction:
 *   - Fixed at top: 0, height 37px — matching the titleBarOverlay height set
 *     in the Electron BrowserWindow config.
 *   - On Windows: padding-right 148px leaves space for native window controls
 *     (minimize / maximize / close) provided by titleBarOverlay.
 *   - The preload script sets --vertex-ui-top-offset: 37px on <html> so that
 *     the web app's own header and sidebars sit below this bar automatically.
 */

const TITLEBAR_HEIGHT = 37;
type AppRegion = 'drag' | 'no-drag';
type AppRegionStyle = React.CSSProperties & { WebkitAppRegion?: AppRegion };

export default function DesktopTitleBar() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [brandingIcon, setBrandingIcon] = useState<string | null>(null);

  // Detect Electron and check initial nav state after mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.vertexDesktop) {
      setIsDesktop(true);

      // Check initial back-button state
      window.vertexDesktop.canGoBack().then(setCanGoBack).catch(() => setCanGoBack(false));
      window.vertexDesktop.getBranding?.().then((branding) => {
        if (branding?.iconDataUrl) {
          setBrandingIcon(branding.iconDataUrl);
        }
      }).catch(() => setBrandingIcon(null));

      // Helper: sync theme to both React state AND the native Win32 titlebar overlay
      const syncTheme = () => {
        const dark = document.documentElement.classList.contains('dark');
        setIsDark(dark);
        // Tell the Electron main process to call setTitleBarOverlay() so the
        // native minimize/maximize/close buttons match the current theme.
        const color = 'rgba(0, 0, 0, 0)';
        const symbolColor = dark ? '#f8fafc' : '#111827';
        window.vertexDesktop?.setTitleBarColors?.({ color, symbolColor });
        // Fallback for older desktop builds that don't expose setTitleBarColors.
        window.vertexDesktop?.setTheme?.(dark ? 'dark' : 'light');
      };

      // Watch the <html> element for dark-mode class changes
      const observer = new MutationObserver(syncTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

      // Sync immediately on mount — handles apps that start in dark mode
      syncTheme();

      return () => observer.disconnect();
    }
  }, []);

  // Re-sync back-button state on every route change. We piggy-back on the
  // `vertex-desktop:navigated` DOM event dispatched by the preload bridge.
  useEffect(() => {
    if (!isDesktop) return;

    const handleNavStateChange = () => {
      window.vertexDesktop?.canGoBack().then(setCanGoBack).catch(() => setCanGoBack(false));
    };

    // Poll once on mount and listen for popstate (covers client-side SPA nav)
    window.addEventListener('popstate', handleNavStateChange);
    // Also listen for custom event that the preload can dispatch on did-navigate
    window.addEventListener('vertex-desktop:navigated', handleNavStateChange);

    return () => {
      window.removeEventListener('popstate', handleNavStateChange);
      window.removeEventListener('vertex-desktop:navigated', handleNavStateChange);
    };
  }, [isDesktop]);

  const handleBack = useCallback(async () => {
    if (!window.vertexDesktop) return;
    await window.vertexDesktop.navBack();
    // Give the webContents a moment then re-check nav state
    setTimeout(() => {
      window.vertexDesktop?.canGoBack().then(setCanGoBack).catch(() => setCanGoBack(false));
    }, 150);
  }, []);

  const handleReload = useCallback(async () => {
    if (!window.vertexDesktop) return;
    setIsLoading(true);
    try {
      await window.vertexDesktop.navReload();
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, []);

  // Don't render anything in the browser (web-only) context
  if (!isDesktop) return null;

  const bg = 'rgb(var(--background))';
  const border = isDark ? '#334155' : '#e5e7eb';
  const text = isDark ? '#f8fafc' : '#111827';
  const mutedText = isDark ? '#94a3b8' : '#6b7280';
  const hoverBg = isDark ? '#334155' : '#e5e7eb';
  const logoSrc = brandingIcon || '/images/airqo_logo.svg';

  const titlebarStyle: AppRegionStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: TITLEBAR_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    // Reserve space for the native Windows OS controls on the right
    paddingRight: 148,
    background: bg,
    borderBottom: 'none',
    zIndex: 2147483647,
    // Make the bar draggable (moves the window) â€” buttons below use no-drag
    WebkitAppRegion: 'drag',
    userSelect: 'none',
    transition: 'background 0.3s, border-color 0.3s',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const navControlsStyle: AppRegionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingRight: 8,
    borderRight: `1px solid ${border}`,
    WebkitAppRegion: 'no-drag',
  };

  return (
    <div
      id="vertex-desktop-titlebar"
      style={titlebarStyle}
    >
      {/* Navigation controls — no-drag so clicks register */}
      <div
        style={navControlsStyle}
      >
        <NavButton
          title="Go Back"
          disabled={!canGoBack}
          onClick={handleBack}
          hoverBg={hoverBg}
          color={canGoBack ? text : mutedText}
        >
          {/* ChevronLeft */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </NavButton>

        <NavButton
          title="Reload"
          onClick={handleReload}
          hoverBg={hoverBg}
          color={text}
          style={isLoading ? { animation: 'vertex-titlebar-spin 0.8s linear infinite' } : undefined}
        >
          {/* RotateCw */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={isLoading ? { animation: 'vertex-titlebar-spin 0.8s linear infinite' } : undefined}
          >
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </NavButton>
      </div>

      {/* App icon + title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Image
          src={logoSrc}
          alt="AirQo"
          width={47}
          height={32}
          unoptimized
          style={{ height: 16, width: 'auto', display: 'block' }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: text, letterSpacing: '0.01em', transition: 'color 0.3s' }}>
          AirQo Vertex
        </span>
      </div>

      {/* Spin animation for reload button */}
      <style>{`
        @keyframes vertex-titlebar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Reusable nav button ─────────────────────────────────────────────────────

interface NavButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
  hoverBg: string;
  color: string;
  style?: React.CSSProperties;
}

function NavButton({ children, onClick, title, disabled, hoverBg, color, style }: NavButtonProps) {
  const [hovered, setHovered] = useState(false);
  const buttonStyle: AppRegionStyle = {
    width: 26,
    height: 26,
    border: 0,
    borderRadius: 5,
    background: hovered && !disabled ? hoverBg : 'transparent',
    color,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    transition: 'background 0.15s, opacity 0.15s',
    // Must be no-drag so click events fire
    WebkitAppRegion: 'no-drag',
    padding: 0,
    ...style,
  };

  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={buttonStyle}
    >
      {children}
    </button>
  );
}
