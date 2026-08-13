'use client';

import { useCallback, useRef } from 'react';
import { ExportOptions, ExportOptionsPartial } from '../types';

const PAINT_ATTRIBUTES = ['fill', 'stroke', 'stop-color'] as const;

/**
 * Resolves CSS-var / color-mix paint values (fill, stroke, stop-color) on
 * SVG elements to their concrete computed colors.
 *
 * Recharts writes series colors as SVG presentation attributes. html2canvas
 * serializes the chart SVG into a standalone `data:image/svg+xml` image (and
 * exported .svg files are viewed outside the page) — neither context can
 * resolve `rgb(var(--primary))` or `color-mix(... var(--primary) ...)`
 * against the page's stylesheet, so those paints would rasterize black.
 * The live page (and html2canvas' cloned iframe document, which copies the
 * page's stylesheets) CAN compute them, so we replace the attribute values
 * with their computed colors before rendering/serializing.
 */
const resolveSvgPaintAttributes = (svgRoot: Element, win: Window): void => {
  const svg =
    svgRoot.tagName.toLowerCase() === 'svg'
      ? svgRoot
      : svgRoot.querySelector('svg');
  if (!svg) return;

  svg
    .querySelectorAll<SVGElement>('[fill], [stroke], [stop-color]')
    .forEach(element => {
      PAINT_ATTRIBUTES.forEach(attribute => {
        const raw = element.getAttribute(attribute);
        if (
          !raw ||
          (!raw.includes('var(') && !raw.includes('color-mix('))
        ) {
          return;
        }
        const computed = win.getComputedStyle(element).getPropertyValue(
          attribute
        );
        if (computed && computed.trim()) {
          element.setAttribute(attribute, computed.trim());
        }
      });
    });
};

/**
 * Copies computed paint values from the LIVE svg onto a detached clone.
 * The clone shares the live tree's structure 1:1 (same selectors, same
 * order), so elements are matched by index. Used by the standalone .svg
 * export where the clone is not attached to any document.
 */
const resolvePaintsOnDetachedClone = (
  liveSvg: SVGElement,
  cloneSvg: SVGElement
): void => {
  const selector = '[fill], [stroke], [stop-color]';
  const liveElements = Array.from(liveSvg.querySelectorAll<SVGElement>(selector));
  const cloneElements = Array.from(
    cloneSvg.querySelectorAll<SVGElement>(selector)
  );

  cloneElements.forEach((cloneElement, index) => {
    const liveElement = liveElements[index];
    if (!liveElement) return;
    PAINT_ATTRIBUTES.forEach(attribute => {
      const raw = cloneElement.getAttribute(attribute);
      if (!raw || (!raw.includes('var(') && !raw.includes('color-mix('))) {
        return;
      }
      const computed = window.getComputedStyle(liveElement).getPropertyValue(
        attribute
      );
      if (computed && computed.trim()) {
        cloneElement.setAttribute(attribute, computed.trim());
      }
    });
  });
};

const applyCloneStyles = (clonedDoc: Document) => {
  const view = clonedDoc.defaultView;
  const HTMLElementCtor = view?.HTMLElement;
  const SVGElementCtor = view?.SVGElement;

  const applyStyles = (
    element: Element | null,
    styles: Partial<CSSStyleDeclaration>
  ) => {
    if (!element) {
      return;
    }
    const hasRealmCtors = Boolean(HTMLElementCtor || SVGElementCtor);

    if (hasRealmCtors) {
      const isHTMLElement = HTMLElementCtor
        ? element instanceof HTMLElementCtor
        : false;
      const isSVGElement = SVGElementCtor
        ? element instanceof SVGElementCtor
        : false;

      // If the cloned document provides realm-specific constructors, use them
      // to verify element instances. If the element does not belong to the
      // cloned realm, skip styling it.
      if (!isHTMLElement && !isSVGElement) return;
    } else {
      // Fallback: if we can't access realm constructors, ensure the element
      // exposes a style object we can mutate (safely skip otherwise).
      try {
        const candidate = element as unknown as {
          style?: { setProperty?: unknown };
        };
        if (
          !candidate.style ||
          typeof candidate.style.setProperty !== 'function'
        )
          return;
      } catch {
        return;
      }
    }

    let styleObj: CSSStyleDeclaration | undefined;
    const maybeHTMLElement = element as HTMLElement;
    const maybeSVGElement = element as SVGElement;

    if (
      maybeHTMLElement &&
      maybeHTMLElement.style &&
      typeof (maybeHTMLElement.style as unknown as { setProperty?: unknown })
        .setProperty === 'function'
    ) {
      styleObj = maybeHTMLElement.style as unknown as CSSStyleDeclaration;
    } else if (
      maybeSVGElement &&
      maybeSVGElement.style &&
      typeof (maybeSVGElement.style as unknown as { setProperty?: unknown })
        .setProperty === 'function'
    ) {
      styleObj = maybeSVGElement.style as unknown as CSSStyleDeclaration;
    } else {
      return;
    }

    if (!styleObj || typeof styleObj.setProperty !== 'function') return;

    Object.entries(styles).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        styleObj.setProperty(
          key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`),
          String(value)
        );
      }
    });
  };

  clonedDoc.querySelectorAll('*').forEach(element => {
    applyStyles(element, {
      color: 'inherit',
      backgroundColor: 'transparent',
      borderColor: 'inherit',
    });
  });

  // Export-root text (title/subtitle/metadata) renders on a white document
  // background — pin it to dark so dark-mode themes don't produce
  // invisible or washed-out headings in the exported image.
  clonedDoc
    .querySelectorAll('[data-export-root] h1, [data-export-root] h2, [data-export-root] h3, [data-export-root] p')
    .forEach(element => {
      applyStyles(element, {
        color: '#111827',
      });
    });

  clonedDoc.querySelectorAll('.recharts-wrapper').forEach(element => {
    applyStyles(element, {
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    });
  });

  clonedDoc.querySelectorAll('.recharts-legend-wrapper').forEach(element => {
    applyStyles(element, {
      backgroundColor: 'transparent',
      fontSize: '12px',
      fontFamily: 'inherit',
    });
  });

  clonedDoc
    .querySelectorAll(
      '.recharts-legend-item, .recharts-legend-item-text, .recharts-legend-item text'
    )
    .forEach(element => {
      applyStyles(element, {
        fill: '#000000',
        color: '#000000',
        fontSize: '12px',
        fontFamily: 'inherit',
      });
    });

  clonedDoc
    .querySelectorAll(
      '.recharts-cartesian-axis-line, .recharts-cartesian-axis-tick-line, .recharts-cartesian-grid-line'
    )
    .forEach(element => {
      applyStyles(element, {
        stroke: '#e5e7eb',
      });
    });

  clonedDoc
    .querySelectorAll('.recharts-tooltip, .recharts-tooltip *')
    .forEach(element => {
      applyStyles(element, {
        color: '#000000',
        fill: '#000000',
        backgroundColor: '#ffffff',
      });
    });

  // Resolve CSS-var / color-mix paints to concrete colors: html2canvas
  // rasterizes the chart SVG as an isolated image where the page's CSS
  // custom properties don't exist (theme-shade series, palette index 0 and
  // legend swatches would otherwise export black).
  const clonedWindow = clonedDoc.defaultView;
  if (clonedWindow) {
    // Recharts renders one SVG per chart (plot + per-item legend swatches) —
    // resolve paints on every one of them.
    clonedDoc
      .querySelectorAll('.recharts-wrapper svg')
      .forEach(svg => {
        resolveSvgPaintAttributes(svg, clonedWindow);
      });
  }
};

const ensureFilenameExtension = (filename: string, extension: string) => {
  const normalizedExtension = extension.startsWith('.')
    ? extension
    : `.${extension}`;

  return filename.toLowerCase().endsWith(normalizedExtension)
    ? filename
    : `${filename}${normalizedExtension}`;
};

export const useChartExport = () => {
  const exportRef = useRef<HTMLDivElement>(null);

  const getExportElement = useCallback((): HTMLDivElement => {
    if (!exportRef.current) {
      throw new Error('Chart container not found');
    }

    const element = exportRef.current;
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      throw new Error('Chart container has no visible content');
    }

    return element;
  }, []);

  const renderChartToCanvas = useCallback(
    async (options: ExportOptionsPartial = {}) => {
      const element = getExportElement();
      const { default: html2canvas } = await import('html2canvas');

      // Full-size exports: measure the live element and pin the cloned
      // export root to the same pixel size so fluid containers render at
      // their real dimensions in the detached clone.
      const measuredWidth = options.width ?? element.offsetWidth;
      const measuredHeight = options.height ?? element.offsetHeight;

      return html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: measuredWidth,
        height: measuredHeight,
        ignoreElements: element => {
          const htmlElement = element as HTMLElement;
          return (
            element.classList.contains('hidden') ||
            element.hasAttribute('data-export-ignore') ||
            htmlElement.style?.display === 'none' ||
            htmlElement.style?.visibility === 'hidden'
          );
        },
        onclone: (clonedDoc: Document) => {
          applyCloneStyles(clonedDoc);
          const exportRoot = clonedDoc.querySelector<HTMLElement>(
            '[data-export-root]'
          );
          if (exportRoot) {
            exportRoot.style.width = `${measuredWidth}px`;
            exportRoot.style.height = `${measuredHeight}px`;
            exportRoot.style.overflow = 'hidden';
          }
        },
      });
    },
    [getExportElement]
  );

  const exportToPNG = useCallback(
    async (options: ExportOptionsPartial = {}): Promise<void> => {
      try {
        const canvas = await renderChartToCanvas(options);
        const filename = ensureFilenameExtension(
          options.filename || `air-quality-chart-${Date.now()}`,
          'png'
        );

        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png', options.quality || 0.9);

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting to PNG:', error);
        throw error;
      }
    },
    [renderChartToCanvas]
  );

  const exportToPDF = useCallback(
    async (options: ExportOptionsPartial = {}): Promise<void> => {
      try {
        const canvas = await renderChartToCanvas(options);
        const filename = ensureFilenameExtension(
          options.filename || `air-quality-chart-${Date.now()}`,
          'pdf'
        );

        const imgData = canvas.toDataURL('image/png', options.quality || 0.9);
        const { jsPDF } = await import('jspdf');

        // Fit the rendered chart into the printable page area while preserving
        // aspect ratio. This avoids cropped PDFs when the chart is wide or tall.
        const margin = 20;
        const titleSpace = 20;

        // Create PDF
        const pdf = new jsPDF({
          orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2 - titleSpace;
        const scale = Math.min(
          maxWidth / canvas.width,
          maxHeight / canvas.height
        );
        const finalWidth = canvas.width * scale;
        const finalHeight = canvas.height * scale;

        // Add title
        const title = options.filename || 'Air Quality Chart';
        pdf.setFontSize(16);
        pdf.text(title, margin, margin);

        // Add timestamp
        pdf.setFontSize(10);
        pdf.text(
          `Generated on: ${new Date().toLocaleString()}`,
          margin,
          margin + 10
        );

        // Add chart image
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin + titleSpace,
          finalWidth,
          finalHeight
        );

        // Save PDF
        pdf.save(filename);
      } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw error;
      }
    },
    [renderChartToCanvas]
  );

  const exportToSVG = useCallback(
    async (options: ExportOptionsPartial = {}): Promise<void> => {
      try {
        const element = getExportElement();

        // Find SVG element within the chart container
        const svgElement = element.querySelector('svg');
        if (!svgElement) {
          throw new Error('No SVG element found in chart');
        }

        // Clone the SVG
        const svgClone = svgElement.cloneNode(true) as SVGElement;

        // The clone is detached — resolve CSS-var / color-mix paints to
        // their computed colors (from the live tree) so the standalone .svg
        // renders series colors in any external viewer.
        resolvePaintsOnDetachedClone(svgElement, svgClone);

        // Set proper dimensions
        if (options.width)
          svgClone.setAttribute('width', String(options.width));
        if (options.height)
          svgClone.setAttribute('height', String(options.height));

        // Add XML declaration and convert to string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);
        const svgBlob = new Blob(
          [`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`],
          { type: 'image/svg+xml' }
        );

        // Create download link
        const link = document.createElement('a');
        link.download = ensureFilenameExtension(
          options.filename || `air-quality-chart-${Date.now()}`,
          'svg'
        );
        link.href = URL.createObjectURL(svgBlob);

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Error exporting to SVG:', error);
        throw error;
      }
    },
    [getExportElement]
  );

  const exportChart = useCallback(
    async (options: ExportOptions): Promise<void> => {
      switch (options.format) {
        case 'png':
          return exportToPNG(options);
        case 'pdf':
          return exportToPDF(options);
        case 'svg':
          return exportToSVG(options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    },
    [exportToPNG, exportToPDF, exportToSVG]
  );

  return {
    exportRef,
    exportChart,
    exportToPNG,
    exportToPDF,
    exportToSVG,
  };
};
