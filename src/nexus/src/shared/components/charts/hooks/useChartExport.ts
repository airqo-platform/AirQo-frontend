'use client';

import { useCallback, useRef } from 'react';
import { ExportOptions, ExportOptionsPartial } from '../types';

const PAINT_ATTRIBUTES = ['fill', 'stroke', 'stop-color'] as const;

/** Export canvas background — charts are shared as light documents. */
const EXPORT_BACKGROUND_COLOR = '#ffffff';

/** Brand watermark pinned to the bottom-right of PNG and PDF exports. */
const EXPORT_WATERMARK_TEXT = 'From AirQo Nexus';
const EXPORT_WATERMARK_COLOR = 'rgba(100, 116, 139, 0.9)'; // slate-500
const EXPORT_WATERMARK_BACKDROP = 'rgba(255, 255, 255, 0.85)';

/**
 * Paints the brand watermark on an export canvas (PNG) at the bottom-right.
 * A subtle white backdrop keeps the label legible over chart content.
 * `pixelRatio` scales the label with the canvas (html-to-image captures at
 * 2x), keeping the watermark the same visual size as the PDF's.
 */
const drawExportWatermark = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelRatio: number
): void => {
  const padding = 12 * pixelRatio;
  const fontSize = 13 * pixelRatio;
  ctx.save();
  ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  const textWidth = ctx.measureText(EXPORT_WATERMARK_TEXT).width;
  const textHeight = fontSize + 4 * pixelRatio;
  const x = width - textWidth - padding;
  const y = height - textHeight - 6 * pixelRatio;

  ctx.fillStyle = EXPORT_WATERMARK_BACKDROP;
  ctx.fillRect(x - 6 * pixelRatio, y - 3 * pixelRatio, textWidth + 12 * pixelRatio, textHeight + 6 * pixelRatio);
  ctx.fillStyle = EXPORT_WATERMARK_COLOR;
  ctx.textAlign = 'left';
  ctx.fillText(EXPORT_WATERMARK_TEXT, x, y + textHeight / 2 + 1 * pixelRatio);
  ctx.restore();
};

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
   * foreignObject). The capture uses the element's on-screen layout at a
   * high pixel ratio (4×) so the resulting PNG is document-quality
   * (A4/A3 ready) regardless of the current card size — no resizing
   * needed, which avoids the html-to-image rendering issues that come
   * with live element mutation (legend dropouts, animation timing).
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
      const canvas = await toCanvas(element, {
        backgroundColor: EXPORT_BACKGROUND_COLOR,
        // 4× supersampling — the chart at ~600px CSS renders to
        // 2400+ px, which is print-ready for A4/A3 documents.
        pixelRatio: 4,
        cacheBust: true,
        filter: node => !isExportIgnored(node),
      });
      return { canvas, cssWidth: width };
    } finally {
      element.removeAttribute(EXPORT_LIGHT_ATTR);
    }
  }, [getExportElement]);

  const exportToPNG = useCallback(
    async (options: ExportOptionsPartial = {}): Promise<void> => {
      try {
        const { canvas, cssWidth } = await renderChartToCanvas();
        const filename = ensureFilenameExtension(
          options.filename || `air-quality-chart-${Date.now()}`,
          'png'
        );

        drawExportWatermark(
          canvas.getContext('2d') as CanvasRenderingContext2D,
          canvas.width,
          canvas.height,
          canvas.width / cssWidth
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
        const { canvas } = await renderChartToCanvas();
        const filename = ensureFilenameExtension(
          options.filename || `air-quality-chart-${Date.now()}`,
          'pdf'
        );

        const imgData = canvas.toDataURL('image/png', options.quality || 0.9);
        const { jsPDF } = await import('jspdf');

        // Fit the rendered chart into the printable page area while preserving
        // aspect ratio. This avoids cropped PDFs when the chart is wide or tall.
        const margin = 20;
        // Bottom strip reserved for the brand watermark.
        const watermarkReserve = 14;

        // Create PDF
        const pdf = new jsPDF({
          orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const maxWidth = pageWidth - margin * 2;
        const maxHeight =
          pageHeight - margin * 2 - watermarkReserve;
        const scale = Math.min(
          maxWidth / canvas.width,
          maxHeight / canvas.height
        );
        const finalWidth = canvas.width * scale;
        const finalHeight = canvas.height * scale;

        // Add chart image
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          finalWidth,
          finalHeight
        );

        // Brand watermark — bottom-right, white backdrop for legibility.
        const watermarkText = EXPORT_WATERMARK_TEXT;
        pdf.setFontSize(9);
        const watermarkTextWidth = pdf.getTextWidth(watermarkText);
        const watermarkX = pageWidth - margin - watermarkTextWidth;
        const watermarkY = pageHeight - margin;
        pdf.setFillColor(255, 255, 255);
        pdf.rect(
          watermarkX - 3,
          watermarkY - 7,
          watermarkTextWidth + 6,
          9,
          'F'
        );
        pdf.setTextColor(100, 116, 139);
        pdf.text(watermarkText, pageWidth - margin, watermarkY, {
          align: 'right',
        });

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
