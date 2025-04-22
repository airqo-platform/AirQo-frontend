'use client';

import { useEffect } from 'react';

export default function ExternalLinkDecorator() {
  useEffect(() => {
    const decorate = () => {
      const origin = window.location.origin;
      document
        .querySelectorAll<HTMLAnchorElement>('a[href^="http"]')
        .forEach((link) => {
          if (!link.href.startsWith(origin)) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          }
        });
    };

    // Initial pass
    decorate();

    // Watch for any new links added later (optional, but covers dynamic content)
    const observer = new MutationObserver(decorate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
