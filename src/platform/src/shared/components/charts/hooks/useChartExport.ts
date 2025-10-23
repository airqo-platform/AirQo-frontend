'use client';

import { useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ExportOptions, ExportOptionsPartial } from '../types';

export const useChartExport = () => {
  const exportRef = useRef<HTMLDivElement>(null);

  const exportToPNG = useCallback(
    async (options: ExportOptionsPartial = {}): Promise<void> => {
      if (!exportRef.current) {
        throw new Error('Chart container not found');
      }

      try {
        // Ensure the element is visible and has content
        const element = exportRef.current;
        if (element.offsetWidth === 0 || element.offsetHeight === 0) {
          throw new Error('Chart container has no visible content');
        }

        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher quality
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: options.width,
          height: options.height,
          ignoreElements: element => {
            // Ignore elements that might cause issues
            const htmlElement = element as HTMLElement;
            return (
              element.classList.contains('hidden') ||
              htmlElement.style?.display === 'none' ||
              htmlElement.style?.visibility === 'hidden'
            );
          },
          onclone: clonedDoc => {
            // Remove problematic CSS that html2canvas can't handle
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * {
                color: inherit !important;
                background-color: transparent !important;
                border-color: inherit !important;
              }

              /* Ensure chart container is properly centered */
              .recharts-wrapper {
                margin: 0 auto !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
              }

              /* Fix legend rendering */
              .recharts-legend-wrapper {
                background-color: transparent !important;
                color: #374151 !important;
                font-size: 12px !important;
                font-family: inherit !important;
              }

              .recharts-legend-item {
                color: #374151 !important;
                background-color: transparent !important;
              }

              .recharts-legend-item-text,
              .recharts-legend-item text {
                fill: #374151 !important;
                color: #374151 !important;
                font-size: 12px !important;
                font-family: inherit !important;
              }

              /* Interactive legend styling */
              button {
                color: inherit !important;
                background-color: transparent !important;
                border: none !important;
                cursor: default !important;
              }

              .recharts-cartesian-axis-line,
              .recharts-cartesian-axis-tick-line,
              .recharts-cartesian-grid-line {
                stroke: #e5e7eb !important;
              }

              .recharts-tooltip,
              .recharts-tooltip * {
                color: #000000 !important;
                fill: #000000 !important;
                background-color: #ffffff !important;
              }

              /* Ensure all text is visible */
              text, span, div {
                color: #374151 !important;
                fill: #374151 !important;
              }

              /* Fix button styling for interactive legend */
              button:hover {
                background-color: transparent !important;
              }

              /* Ensure legend items are visible */
              [class*="legend"] {
                background-color: transparent !important;
                color: #374151 !important;
              }
            `;
            clonedDoc.head.appendChild(style);

            // Remove any elements that might cause issues
            const elementsToRemove = clonedDoc.querySelectorAll(
              'button:not([class*="legend"]):not([class*="Legend"]), [onclick]:not([class*="legend"]):not([class*="Legend"]), [onmouseover]:not([class*="legend"]):not([class*="Legend"]), [onmouseout]:not([class*="legend"]):not([class*="Legend"])'
            );
            elementsToRemove.forEach(el => el.remove());

            // Ensure the chart container is centered
            const chartContainer = clonedDoc.querySelector('.recharts-wrapper');
            if (chartContainer) {
              (chartContainer as HTMLElement).style.margin = '0 auto';
              (chartContainer as HTMLElement).style.display = 'flex';
              (chartContainer as HTMLElement).style.justifyContent = 'center';
              (chartContainer as HTMLElement).style.alignItems = 'center';
            }
          },
        });

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
    []
  );

  const exportToPDF = useCallback(
    async (options: ExportOptionsPartial = {}): Promise<void> => {
      if (!exportRef.current) {
        throw new Error('Chart container not found');
      }

      try {
        // Ensure the element is visible and has content
        const element = exportRef.current;
        if (element.offsetWidth === 0 || element.offsetHeight === 0) {
          throw new Error('Chart container has no visible content');
        }

        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: options.width,
          height: options.height,
          ignoreElements: element => {
            // Ignore elements that might cause issues
            const htmlElement = element as HTMLElement;
            return (
              element.classList.contains('hidden') ||
              htmlElement.style?.display === 'none' ||
              htmlElement.style?.visibility === 'hidden'
            );
          },
          onclone: clonedDoc => {
            // Remove problematic CSS that html2canvas can't handle
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * {
                color: inherit !important;
                background-color: transparent !important;
                border-color: inherit !important;
              }

              /* Ensure chart container is properly centered */
              .recharts-wrapper {
                margin: 0 auto !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
              }

              /* Fix legend rendering */
              .recharts-legend-wrapper {
                background-color: transparent !important;
                color: #374151 !important;
                font-size: 12px !important;
                font-family: inherit !important;
              }

              .recharts-legend-item {
                color: #374151 !important;
                background-color: transparent !important;
              }

              .recharts-legend-item-text,
              .recharts-legend-item text {
                fill: #374151 !important;
                color: #374151 !important;
                font-size: 12px !important;
                font-family: inherit !important;
              }

              /* Interactive legend styling */
              button {
                color: inherit !important;
                background-color: transparent !important;
                border: none !important;
                cursor: default !important;
              }

              .recharts-cartesian-axis-line,
              .recharts-cartesian-axis-tick-line,
              .recharts-cartesian-grid-line {
                stroke: #e5e7eb !important;
              }

              .recharts-tooltip,
              .recharts-tooltip * {
                color: #000000 !important;
                fill: #000000 !important;
                background-color: #ffffff !important;
              }

              /* Ensure all text is visible */
              text, span, div {
                color: #374151 !important;
                fill: #374151 !important;
              }

              /* Fix button styling for interactive legend */
              button:hover {
                background-color: transparent !important;
              }

              /* Ensure legend items are visible */
              [class*="legend"] {
                background-color: transparent !important;
                color: #374151 !important;
              }
            `;
            clonedDoc.head.appendChild(style);

            // Remove any elements that might cause issues
            const elementsToRemove = clonedDoc.querySelectorAll(
              'button:not([class*="legend"]):not([class*="Legend"]), [onclick]:not([class*="legend"]):not([class*="Legend"]), [onmouseover]:not([class*="legend"]):not([class*="Legend"]), [onmouseout]:not([class*="legend"]):not([class*="Legend"])'
            );
            elementsToRemove.forEach(el => el.remove());

            // Ensure the chart container is centered
            const chartContainer = clonedDoc.querySelector('.recharts-wrapper');
            if (chartContainer) {
              (chartContainer as HTMLElement).style.margin = '0 auto';
              (chartContainer as HTMLElement).style.display = 'flex';
              (chartContainer as HTMLElement).style.justifyContent = 'center';
              (chartContainer as HTMLElement).style.alignItems = 'center';
            }
          },
        });

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
    []
  );

  const exportToSVG = useCallback(
    async (options: ExportOptionsPartial = {}): Promise<void> => {
      if (!exportRef.current) {
        throw new Error('Chart container not found');
      }

      try {
        // Find SVG element within the chart container
        const svgElement = exportRef.current.querySelector('svg');
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
    []
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
