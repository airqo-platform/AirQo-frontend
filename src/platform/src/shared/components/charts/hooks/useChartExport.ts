'use client';

import { useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ExportOptions, ExportOptionsPartial } from '../types';

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

      return html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: options.width,
        height: options.height,
        ignoreElements: element => {
          const htmlElement = element as HTMLElement;
          return (
            element.classList.contains('hidden') ||
            htmlElement.style?.display === 'none' ||
            htmlElement.style?.visibility === 'hidden'
          );
        },
        onclone: applyCloneStyles,
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
