'use client';

import { Monitor, ShieldCheck, Copy, Check, Download } from 'lucide-react';
import { FaLinux } from 'react-icons/fa';
import { useEffect, useState } from 'react';

import ReusableButton from '@/components/shared/button/ReusableButton';
import {
  VERTEX_DESKTOP_DOWNLOAD_FALLBACKS,
  LINUX_INSTALL_COMMAND,
  type DesktopReleaseUrls,
} from '@/core/constants/app-downloads';
import { useDetectedPlatform } from '@/core/hooks/useDetectedPlatform';
import { vertexConfig } from '@/vertex.config';

const WindowsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 9.151h9.75v9.6L0 20.551V12.6zm10.55-10.701L24 0v11.7h-13.45V1.899zm0 10.701H24V24l-13.45-1.899V12.6z" />
  </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Copy install command"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function getPrimaryRelease(platform: string, release: DesktopReleaseUrls) {
  switch (platform) {
    case 'win':
      return { label: 'Download for Windows', href: release.windows.exe, Icon: WindowsIcon };
    case 'mac':
      return { label: 'Download for macOS', href: release.mac.arm64Dmg, Icon: AppleIcon };
    case 'linux':
      return { label: 'Download for Linux', href: release.linux.appImage, Icon: FaLinux };
    default:
      return { label: 'Get Desktop app', href: '#releases', Icon: Download };
  }
}

export default function DownloadHero() {
  const [mounted, setMounted] = useState(false);
  const [release, setRelease] = useState<DesktopReleaseUrls>(VERTEX_DESKTOP_DOWNLOAD_FALLBACKS);
  const { platform } = useDetectedPlatform();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/latest-release')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data && !data.error) setRelease(data); })
      .catch(() => {});
  }, []);

  const primary = getPrimaryRelease(platform, release);

  const platformCards = [
    {
      id: 'mac',
      label: 'macOS',
      Icon: AppleIcon,
      links: [
        { label: 'Apple Silicon', suffix: '.dmg', href: release.mac.arm64Dmg },
        { label: 'Intel', suffix: '.dmg', href: release.mac.intelDmg },
      ],
    },
    {
      id: 'win',
      label: 'Windows',
      Icon: WindowsIcon,
      links: [
        { label: 'Installer', suffix: '.exe', href: release.windows.exe },
      ],
    },
    {
      id: 'linux',
      label: 'Linux',
      Icon: FaLinux,
      links: [
        { label: 'AppImage', suffix: '', href: release.linux.appImage },
        { label: 'Debian / Ubuntu', suffix: '.deb', href: release.linux.deb },
      ],
      terminal: true,
    },
  ];

  return (
    <section className="bg-primary-50 dark:bg-background px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Hero row */}
        <div className="grid items-center gap-10 lg:min-h-[calc(60vh)] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
          <div className="max-w-3xl">
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-heading sm:text-5xl lg:text-6xl">
              Deploy Devices. Share Air Data
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-7">
              Install {vertexConfig.org.name} Desktop for a focused workspace built around field
              deployment, device visibility, and trusted air quality data workflows.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <ReusableButton
                path={primary.href ?? '#releases'}
                target={primary.href?.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                variant="filled"
                Icon={primary.Icon}
                iconClassName="h-3.5 w-3.5"
                className="inline-flex w-full justify-center gap-2 rounded-md border-border bg-primary text-sm font-medium text-white shadow-none transition-all hover:border-foreground/20 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
                padding="px-4 py-2"
              >
                {primary.label}
              </ReusableButton>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-lg border border-border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {vertexConfig.org.name} Desktop
                </span>
              </div>
              <div className="grid gap-4 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-white">
                  <div>
                    <p className="text-sm font-semibold text-white">Device rollout</p>
                    <p className="text-xs text-white/80">24 devices ready for deployment</p>
                  </div>
                  <Monitor className="h-8 w-8 text-white" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-heading">Deployment checks</p>
                    <div className="mt-4 space-y-3">
                      {['Add devices', 'Verify metadata', 'Share data'].map((step) => (
                        <div key={step} className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-heading">Network visibility</p>
                    <div className="mt-4 space-y-3">
                      {[82, 64, 48].map((width, index) => (
                        <div key={width} className="space-y-1.5">
                          <div className="h-2 rounded-full bg-secondary animate-pulse" />
                          <div
                            className="h-2 rounded-full bg-primary animate-pulse transition-all duration-1000 ease-out"
                            style={{ width: mounted ? `${width}%` : '0%' }}
                          />
                          {index === 2 && (
                            <p className="text-xs text-muted-foreground">Recent sync activity</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform cards */}
        <div id="releases" className="mt-12 pt-10 border-t border-border">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6">
            All releases
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {platformCards.map(({ id, label, Icon, links, terminal }) => {
              const isDetected = platform === id;
              return (
                <div
                  key={id}
                  className={`rounded-xl border bg-card p-5 flex flex-col gap-4 ${
                    isDetected ? 'border-primary/30 ring-1 ring-primary/20' : 'border-border'
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-foreground" />
                    <span className="font-semibold text-heading">{label}</span>
                  </div>

                  {/* Download links */}
                  <div className="flex flex-col gap-2">
                    {links.map(({ label: linkLabel, suffix, href }) =>
                      href ? (
                        <a
                          key={linkLabel + suffix}
                          href={href}
                          className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50 hover:border-primary/30 transition-colors group"
                          download
                        >
                          <span className="text-foreground">
                            {linkLabel}
                            {suffix && (
                              <span className="ml-1 text-xs text-muted-foreground">{suffix}</span>
                            )}
                          </span>
                          <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      ) : null
                    )}
                  </div>

                  {/* Linux terminal snippet */}
                  {terminal && (
                    <div className="mt-auto pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Install via terminal
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-md bg-muted px-3 py-2 overflow-x-auto">
                          <code className="text-xs font-mono text-foreground whitespace-nowrap">
                            {LINUX_INSTALL_COMMAND}
                          </code>
                        </div>
                        <CopyButton text={LINUX_INSTALL_COMMAND} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
