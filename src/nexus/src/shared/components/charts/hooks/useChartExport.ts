'use client';

import { useCallback, useRef } from 'react';
import { ExportOptions, ExportOptionsPartial } from '../types';

const PAINT_ATTRIBUTES = ['fill', 'stroke', 'stop-color'] as const;

/** Export canvas background — charts are shared as light documents. */
const EXPORT_BACKGROUND_COLOR = '#ffffff';

/**
 * Transient marker pinned on the export root while a PNG/PDF capture runs.
 * With html-to-image the capture is rendered by the BROWSER (SVG
 * `<foreignObject>`), so the clone inherits the live computed styles —
 * including dark-mode `text-foreground` colors, which would be invisible on
 * the white export canvas. globals.css scopes `[data-export-light]` rules
 * that pin export typography (headings, legend) to dark while the marker is
 * present; it is removed as soon as the capture resolves.
 */
export const EXPORT_LIGHT_ATTR = 'data-export-light';

/**
 * Elements excluded from PNG/PDF exports: interactive chrome (More menu,
 * filters, inline title editor, footer actions, zoom controls) and loading
 * overlays. html-to-image clones the element's own box — unlike html2canvas
 * it never captures surrounding page content — so the exported image is
 * exactly the card the user sees (title, chart, legend included).
 */
const isExportIgnored = (node: unknown): boolean => {
  if (!(node instanceof HTMLElement)) return false;
  return (
    node.hasAttribute('data-export-ignore') ||
    node.hasAttribute('data-html2canvas-ignore')
  );
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
  const liveElements = Array.from(
    liveSvg.querySelectorAll<SVGElement>(selector)
  );
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

  /**
   * Renders the export root to a canvas via html-to-image (SVG
   * foreignObject). The capture covers the element's OWN bounding box, so
   * the title/subtitle, chart and legend are all included exactly as laid
   * out on screen — no page-level cropping, no clone re-layout.
   */
  const renderChartToCanvas = useCallback(async () => {
    const element = getExportElement();
    const { width, height } = element.getBoundingClientRect();
    if (width === 0 || height === 0) {
      throw new Error('Chart container has no visible content');
    }

    // Wait for webfonts so the captured text is complete and crisp.
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const { toCanvas } = await import('html-to-image');

    element.setAttribute(EXPORT_LIGHT_ATTR, 'true');
    try {
      return await toCanvas(element, {
        backgroundColor: EXPORT_BACKGROUND_COLOR,
        // 2x supersampling keeps lines/text crisp in PNG and PDF.
        pixelRatio: 2,
        cacheBust: true,
        filter: node => !isExportIgnored(node),
      });
    } finally {
      element.removeAttribute(EXPORT_LIGHT_ATTR);
    }
  }, [getExportElement]);

  const exportToPNG = useCallback(
    async (options: ExportOptionsPartial = {}): Promise<void> => {
      try {
        const canvas = await renderChartToCanvas();
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
        const canvas = await renderChartToCanvas();
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
