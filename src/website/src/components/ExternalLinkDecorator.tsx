'use client';

import { useEffect, useRef } from 'react';

interface ExternalLinkDecoratorProps {
  excludeDomains?: string[];
  debounceTime?: number;
  disabled?: boolean;
}

export default function ExternalLinkDecorator({
  excludeDomains = [],
  debounceTime = 200,
  disabled = false,
}: ExternalLinkDecoratorProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef<boolean>(false);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (disabled) return;

    // Get the origin once to avoid repeated access
    const origin = window.location.origin;
    const excludePatterns = excludeDomains.map(
      (domain) =>
        new RegExp(`^https?://(www\\.)?${domain.replace(/\./g, '\\.')}`),
    );

    // Debounced decorator function with safeguards for existing attributes
    const decorateLinks = () => {
      if (processingRef.current) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        processingRef.current = true;

        try {
          const links =
            document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]');

          // Use a single batch to minimize reflows
          requestAnimationFrame(() => {
            links.forEach((link) => {
              // Skip already processed links
              if (link.dataset.externalDecorated === 'true') return;

              // Skip links that have explicitly set target or rel attributes
              // This respects existing developer choices
              const hasExplicitTarget = link.hasAttribute('target');
              const hasExplicitRel = link.hasAttribute('rel');

              // Check if the link points to an external domain
              const isExternal =
                !link.href.startsWith(origin) &&
                !excludePatterns.some((pattern) => pattern.test(link.href));

              if (isExternal) {
                // Only set target if not already specified
                if (!hasExplicitTarget) {
                  link.target = '_blank';
                }

                // Add security attributes to rel if not explicitly set
                // If rel already exists, preserve it and add security attributes
                if (!hasExplicitRel) {
                  link.rel = 'noopener noreferrer';
                } else if (!link.rel.includes('noopener')) {
                  link.rel += ' noopener noreferrer';
                }
              }

              // Mark as processed to avoid redundant operations
              // Use a different data attribute to avoid collisions
              link.dataset.externalDecorated = 'true';
            });

            processingRef.current = false;
          });
        } catch (error) {
          console.error('Error processing external links:', error);
          processingRef.current = false;
        }
      }, debounceTime);
    };

    // Delay initial execution slightly to let the page finish loading
    // This helps avoid processing links before they're fully initialized
    const initialTimer = setTimeout(() => {
      decorateLinks();

      // Watch for DOM changes with optimized config
      observerRef.current = new MutationObserver((mutations) => {
        // Filter mutations for added nodes that might contain links
        const hasRelevantChanges = mutations.some((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            return Array.from(mutation.addedNodes).some((node) => {
              // Check if the node is or could contain anchor elements
              return (
                node.nodeType === Node.ELEMENT_NODE &&
                ((node as Element).tagName === 'A' ||
                  (node as Element).querySelector('a'))
              );
            });
          }
          return false;
        });

        if (hasRelevantChanges) {
          decorateLinks();
        }
      });

      // Configure observer to only watch for changes relevant to links
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      });
    }, 50); // Small delay for initial load

    // Cleanup
    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [excludeDomains, debounceTime, disabled]);

  return null;
}
