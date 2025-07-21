import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import AirqoLogoRaw from '@/icons/airqo_logo.svg';

/* ---------- helpers ---------- */
const SIZES = {
  xs: { c: 'h-6 w-6', t: 'text-xs', p: 'p-0.5' },
  sm: { c: 'h-8 w-8', t: 'text-sm', p: 'p-0.5' },
  md: { c: 'h-10 w-10', t: 'text-sm', p: 'p-1' },
  lg: { c: 'h-12 w-12', t: 'text-base', p: 'p-1' },
  xl: { c: 'h-16 w-16', t: 'text-lg', p: 'p-1.5' },
  '2xl': { c: 'h-20 w-20', t: 'text-xl', p: 'p-2' },
};

const COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#F59E0B',
];

const hashColor = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
};

const initials = (str = '') => {
  const w = str.trim().split(/\s+/).filter(Boolean);
  if (!w.length) return 'ORG';
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return (w[0][0] + w[1][0]).toUpperCase();
};

/* ---------- component ---------- */
const GroupLogo = React.memo(
  ({
    className = '',
    size = 'md',
    imageUrl: customImageUrl = null,
    fallbackText = null,
    fallbackColor = null,
    showAirqoLogo = true,
    containerClassName = '',
    imageClassName = '',
    disabled = false,
  }) => {
    /* ---------- state ---------- */
    const userInfo = useSelector((s) => s.login?.userInfo);
    const activeGrp = useSelector((s) => s.groups?.activeGroup);

    const [key, setKey] = useState(0);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const mounted = useRef(true);
    useEffect(() => () => (mounted.current = false), []);

    /* ---------- data ---------- */
    const isCustom = customImageUrl !== null;
    const grp =
      !isCustom && activeGrp
        ? userInfo?.groups?.find((g) => g._id === activeGrp._id) || activeGrp
        : null;

    const isAirQo =
      !isCustom &&
      showAirqoLogo &&
      grp &&
      [grp._id, grp.grp_title, grp.grp_website, grp.grp_name].some((v) =>
        v?.toLowerCase().includes('airqo'),
      );

    const title = isCustom
      ? fallbackText || 'Logo'
      : grp?.grp_title || grp?.grp_name || 'Organization';
    const color = fallbackColor || hashColor(title);
    const initial = initials(title);

    const imgSrc = React.useMemo(() => {
      const src = isCustom
        ? customImageUrl
        : [
            grp?.grp_profile_picture,
            grp?.grp_image,
            grp?.logo_url,
            grp?.imageUrl,
            grp?.logo,
          ].find(Boolean);

      if (!src || error || disabled || isAirQo) return null;

      try {
        return new URL(src, window.location.origin).href;
      } catch {
        return null;
      }
    }, [isCustom, customImageUrl, grp, error, disabled, isAirQo]);

    /* ---------- refresh logic ---------- */
    const refresh = () =>
      mounted.current && (setKey((k) => k + 1), setError(false));
    useEffect(() => {
      if (isCustom) return;
      const on = (t, f) => window.addEventListener(t, f);
      const off = (t, f) => window.removeEventListener(t, f);
      const f = () => setTimeout(refresh, 100);
      const vis = () => document.visibilityState === 'visible' && refresh();
      on('focus', refresh);
      on('visibilitychange', vis);
      on('logoRefresh', refresh);
      on('groupDataUpdated', refresh);
      if (sessionStorage.logoRefreshNeeded) {
        sessionStorage.removeItem('logoRefreshNeeded');
        f();
      }
      window.addEventListener(
        'beforeunload',
        () => (sessionStorage.logoRefreshNeeded = true),
      );
      return () => {
        off('focus', refresh);
        off('visibilitychange', vis);
        off('logoRefresh', refresh);
        off('groupDataUpdated', refresh);
      };
    }, [isCustom]);

    /* ---------- image fetch ---------- */
    useEffect(() => {
      if (!imgSrc) return;
      setLoading(true);
      setError(false);
      const img = new window.Image(); // ← use the browser’s native constructor
      img.src = imgSrc;
      img.onload = () => mounted.current && setLoading(false);
      img.onerror = () =>
        mounted.current && (setLoading(false), setError(true));
    }, [imgSrc, key]);

    /* ---------- render ---------- */
    const cfg = SIZES[size] || SIZES.md;
    const base = `relative inline-flex items-center justify-center flex-shrink-0 ${cfg.c} ${containerClassName} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    /* AirQo logo (SVG must not have background) */
    if (isAirQo && !disabled)
      return (
        <div
          className={`
          ${base}
          border-none outline-none
        `}
          title={title}
          role="img"
          aria-label={`${title} logo`}
        >
          <div className="w-full h-full flex items-center justify-center">
            <AirqoLogoRaw />
          </div>
        </div>
      );

    /* Remote image */
    if (imgSrc && !error)
      return (
        <div
          className={`${base} overflow-hidden transition-all duration-300 ${loading ? 'animate-pulse' : ''}`}
          title={title}
          role="img"
          aria-label={`${title} logo`}
        >
          {loading && (
            <div className="absolute inset-0 bg-gray-200 rounded-lg" />
          )}
          <Image
            src={imgSrc}
            alt={`${title} logo`}
            fill
            sizes="100%"
            priority
            className={`object-cover transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'} ${imageClassName}`}
            onLoad={() => mounted.current && setLoading(false)}
            onError={() => mounted.current && setError(true)}
          />
        </div>
      );

    /* Initials fallback */
    return (
      <div
        className={`${base} rounded-lg text-white font-semibold shadow-sm ring-2 ring-white dark:ring-gray-800 select-none transition hover:shadow-md ${cfg.t}`}
        style={{ backgroundColor: color }}
        title={title}
        role="img"
        aria-label={`${title} initials`}
      >
        <span className="font-medium tracking-tight">{initial}</span>
      </div>
    );
  },
);

GroupLogo.displayName = 'GroupLogo';
GroupLogo.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(Object.keys(SIZES)),
  imageUrl: PropTypes.string,
  fallbackText: PropTypes.string,
  fallbackColor: PropTypes.string,
  showAirqoLogo: PropTypes.bool,
  containerClassName: PropTypes.string,
  imageClassName: PropTypes.string,
  disabled: PropTypes.bool,
};

export default GroupLogo;
