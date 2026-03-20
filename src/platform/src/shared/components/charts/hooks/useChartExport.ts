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
      const fallbackStyle = (element as any).style;
      if (!fallbackStyle || typeof fallbackStyle.setProperty !== 'function')
        return;
    }

    const styleObj: CSSStyleDeclaration | undefined = (element as any).style;
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

        // Create download link
        const link = document.createElement('a');
        link.download =
          options.filename || `air-quality-chart-${Date.now()}.png`;
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

        const imgData = canvas.toDataURL('image/png', options.quality || 0.9);

        // Calculate PDF dimensions
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgHeight / imgWidth;

        // A4 page dimensions in mm
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        const contentHeight = contentWidth * ratio;

        // Create PDF
        const pdf = new jsPDF({
          orientation:
            contentHeight > pageHeight - margin * 2 ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });

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
        const finalWidth = contentWidth;
        const finalHeight = Math.min(
          contentHeight,
          pageHeight - margin * 2 - 20
        );

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin + 20,
          finalWidth,
          finalHeight
        );

        // Save PDF
        pdf.save(options.filename || `air-quality-chart-${Date.now()}.pdf`);
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
        link.download =
          options.filename || `air-quality-chart-${Date.now()}.svg`;
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
