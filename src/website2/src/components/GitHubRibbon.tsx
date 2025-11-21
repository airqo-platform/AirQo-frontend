'use client';

import React from 'react';

interface GitHubRibbonProps {
  /** GitHub repository URL */
  href?: string;
  /** Text to display on the ribbon */
  text?: string;
  /** Position of the ribbon */
  position?: 'top-left' | 'top-right';
  /** Whether to show the ribbon */
  visible?: boolean;
}

/**
 * A professional GitHub corner ribbon component for the AirQo website.
 *
 * This component creates a small, unobtrusive ribbon in the corner of the page
 * that links to AirQo's GitHub repository. It uses CSS-only animations and
 * includes responsive design, accessibility features, and follows modern
 * design best practices.
 *
 * Features:
 * - Responsive design (hidden on mobile devices)
 * - Accessibility support (screen reader friendly, keyboard navigation)
 * - Smooth hover animations with proper contrast
 * - Uses AirQo's primary blue color (#0A84FF)
 * - Respects user's motion preferences
 */
const GitHubRibbon: React.FC<GitHubRibbonProps> = ({
  href = 'https://github.com/airqo-platform',
  text = 'Fork me on GitHub',
  position = 'top-right',
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <div className={`github-ribbon ${position}`}>
      <a
        href={href}
        className="github-ribbon-link"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${text} - Opens AirQo's GitHub repository in a new window`}
        title={`${text} - Fork and contribute to AirQo's Open Source Platform`}
      >
        {text}
      </a>
    </div>
  );
};

export default GitHubRibbon;
