/**
 * Chart export utility for handling PDF and PNG exports using browser print functionality and canvas
 */
export class ChartExportUtils {
  static EXPORT_FORMATS = ['pdf', 'png'];

  static DEFAULT_OPTIONS = {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '12px',
    fontWeight: '500',
    exportDelay: 800,
    pageMargin: '15mm',
    pageSize: 'A4',
    orientation: 'landscape',
    scale: 2,
    quality: 0.95,
  };

  /**
   * Export chart element using browser print functionality or canvas
   * @param {HTMLElement} chartElement - The chart element to export
   * @param {string} format - Export format ('pdf' or 'png')
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  static async exportChart(chartElement, format = 'pdf', options = {}) {
    if (!chartElement || !this.EXPORT_FORMATS.includes(format)) {
      throw new Error(
        `Invalid format: ${format}. Supported formats: ${this.EXPORT_FORMATS.join(', ')}`,
      );
    }

    const config = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Wait for chart rendering to complete
      await new Promise((resolve) => setTimeout(resolve, config.exportDelay));

      if (format === 'pdf') {
        await this._printChart(chartElement, config);
      } else if (format === 'png') {
        await this._exportToPNG(chartElement, config);
      }
    } catch (error) {
      // Log error for debugging
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Export chart to PNG using canvas
   * @private
   */
  static async _exportToPNG(chartElement, config) {
    const chartContainer =
      chartElement.closest('.chart-container') || chartElement;
    const chartTitle = this._extractChartTitle(chartContainer);

    // Apply export class temporarily
    chartContainer.classList.add('exporting');

    try {
      // Use html2canvas for better chart rendering
      const canvas = await this._createCanvasFromElement(
        chartContainer,
        config,
      );

      // Download the canvas as PNG
      const link = document.createElement('a');
      link.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png', config.quality);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      chartContainer.classList.remove('exporting');
    }
  }

  /**
   * Create canvas from element using html2canvas
   * @private
   */
  static async _createCanvasFromElement(element, config) {
    // Dynamic import of html2canvas
    const html2canvas = await import('html2canvas').then(
      (module) => module.default,
    );

    return html2canvas(element, {
      scale: config.scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Ensure all SVG elements are properly rendered
        const svgElements = clonedDoc.querySelectorAll('svg');
        svgElements.forEach((svg) => {
          const rect = svg.getBoundingClientRect();
          svg.setAttribute('width', Math.max(rect.width, 800));
          svg.setAttribute('height', Math.max(rect.height, 400));
          svg.style.background = 'white';
        });

        // Hide buttons and dropdowns in cloned document
        const buttonsAndDropdowns = clonedDoc.querySelectorAll(
          'button, .dropdown, .chart-header-dropdown',
        );
        buttonsAndDropdowns.forEach((el) => {
          el.style.display = 'none';
        });

        // Ensure legend is visible
        const legends = clonedDoc.querySelectorAll('.recharts-legend-wrapper');
        legends.forEach((legend) => {
          legend.style.display = 'block';
          legend.style.visibility = 'visible';
          legend.style.opacity = '1';
        });

        // Ensure reference lines are visible
        const refLines = clonedDoc.querySelectorAll('.recharts-reference-line');
        refLines.forEach((line) => {
          line.style.stroke = '#EF4444';
          line.style.strokeWidth = '2.5';
          line.style.opacity = '1';
        });
      },
    });
  }

  /**
   * Print chart using browser's print functionality
   * @private
   */
  static async _printChart(chartElement, config) {
    // Find the chart container and get chart data
    const chartContainer =
      chartElement.closest('.chart-container') || chartElement;
    const chartTitle = this._extractChartTitle(chartContainer);

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups and try again.');
    }

    try {
      // Clone the chart content
      const clonedChart = chartContainer.cloneNode(true);

      // Create print document
      this._createPrintDocument(printWindow, clonedChart, chartTitle, config);

      // Wait for content to load
      await new Promise((resolve) => {
        printWindow.onload = resolve;
        setTimeout(resolve, 1000); // Fallback timeout
      });

      // Focus and print
      printWindow.focus();
      printWindow.print();

      // Close window after a delay to allow printing
      setTimeout(() => {
        printWindow.close();
      }, 500);
    } catch (error) {
      printWindow.close();
      throw error;
    }
  }

  /**
   * Extract chart title from container
   * @private
   */
  static _extractChartTitle(container) {
    // Try to find title in parent elements working upward
    let current = container;
    while (current && current !== document.body) {
      const titleElement = current.querySelector(
        'h1, h2, h3, h4, h5, h6, [data-chart-title]',
      );
      if (titleElement) {
        return titleElement.textContent?.trim() || 'Air Quality Chart';
      }

      // Check if current element itself has a title
      if (current.title) {
        return current.title.trim();
      }

      // Check for aria-label
      if (current.getAttribute('aria-label')) {
        return current.getAttribute('aria-label').trim();
      }

      current = current.parentElement;
    }

    // Fallback: try to find in the entire chart container hierarchy
    const chartTitleElement = document.querySelector(
      '.chart-container h3, .chart-container h2, .chart-container h1',
    );
    if (chartTitleElement) {
      return chartTitleElement.textContent?.trim() || 'Air Quality Chart';
    }

    return 'Air Quality Chart';
  }

  /**
   * Create print document HTML
   * @private
   */
  static _createPrintDocument(printWindow, chartElement, title, config) {
    const { fontFamily, pageMargin, pageSize, orientation } = config;

    // Clean up the chart element for better print rendering
    const cleanedChart = this._cleanChartForPrint(chartElement);

    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Export</title>
        <style>
          ${this._getPrintStyles(fontFamily, pageMargin, pageSize, orientation)}
        </style>
      </head>
      <body>
        <div class="print-container">
          <header class="print-header">
            <h1>${title}</h1>
            <div class="print-meta">
              <span>Generated on: ${new Date().toLocaleString()}</span>
              <span>AirQo Platform - Air Quality Data</span>
            </div>
          </header>
          <main class="print-content">
            ${cleanedChart.outerHTML}
          </main>
          <footer class="print-footer">
            <span>© ${new Date().getFullYear()} AirQo Platform</span>
          </footer>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
  }

  /**
   * Clean chart element for better print rendering
   * @private
   */
  static _cleanChartForPrint(chartElement) {
    const cloned = chartElement.cloneNode(true);

    // Remove any buttons or dropdowns
    const buttons = cloned.querySelectorAll(
      'button, .dropdown, .chart-header-dropdown',
    );
    buttons.forEach((btn) => btn.remove());

    // Ensure legend is visible and properly styled
    const legends = cloned.querySelectorAll('.recharts-legend-wrapper');
    legends.forEach((legend) => {
      legend.style.display = 'block';
      legend.style.visibility = 'visible';
      legend.style.opacity = '1';
      legend.style.position = 'relative';
    });

    // Enhance reference lines
    const refLines = cloned.querySelectorAll('.recharts-reference-line line');
    refLines.forEach((line) => {
      line.setAttribute('stroke', '#EF4444');
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-dasharray', '8 4');
      line.setAttribute('opacity', '1');
    });

    // Enhance reference line labels
    const refLabels = cloned.querySelectorAll(
      '.recharts-reference-line .recharts-label',
    );
    refLabels.forEach((label) => {
      label.setAttribute('fill', '#EF4444');
      label.style.fontWeight = '700';
      label.style.fontSize = '12px';
    });

    return cloned;
  }

  /**
   * Generate print-specific CSS styles
   * @private
   */
  static _getPrintStyles(fontFamily, pageMargin, pageSize, orientation) {
    return `
      @page {
        size: ${pageSize} ${orientation};
        margin: ${pageMargin};
      }
      
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: ${fontFamily};
        background: white !important;
        color: #1F2937 !important;
        line-height: 1.4;
        overflow: hidden;
      }

      .print-container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 10px;
        margin: 0;
        page-break-inside: avoid;
        overflow: hidden;
      }

      .print-header {
        text-align: center;
        margin-bottom: 15px;
        border-bottom: 2px solid #E5E7EB;
        padding-bottom: 10px;
        flex-shrink: 0;
      }

      .print-header h1 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: #1F2937 !important;
      }

      .print-meta {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #6B7280 !important;
      }

      .print-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
        overflow: hidden;
        padding: 10px 0;
      }

      .print-footer {
        text-align: center;
        font-size: 9px;
        color: #9CA3AF !important;
        border-top: 1px solid #E5E7EB;
        padding-top: 8px;
        margin-top: 10px;
        flex-shrink: 0;
      }

      /* Chart specific styles */
      .chart-container,
      .export-chart-container {
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        background: white !important;
        overflow: visible !important;
        page-break-inside: avoid;
      }

      .recharts-wrapper {
        background: white !important;
        overflow: visible !important;
        width: 100% !important;
        height: 100% !important;
      }

      .recharts-surface {
        background: white !important;
        overflow: visible !important;
      }

      /* Ensure all chart elements are visible */
      .recharts-cartesian-grid line {
        stroke: #E5E7EB !important;
        stroke-opacity: 0.5 !important;
      }

      .recharts-text {
        font-family: ${fontFamily} !important;
        font-size: 11px !important;
        fill: #374151 !important;
      }

      .recharts-legend-wrapper {
        overflow: visible !important;
        position: relative !important;
      }

      .recharts-legend-item {
        margin-right: 12px !important;
        margin-bottom: 4px !important;
      }

      .recharts-legend-item text {
        font-size: 12px !important;
        fill: #1F2937 !important;
        font-weight: 500 !important;
        font-family: ${fontFamily} !important;
      }

      .recharts-cartesian-axis-tick text {
        font-size: 10px !important;
        fill: #6B7280 !important;
        font-family: ${fontFamily} !important;
      }

      .recharts-tooltip-wrapper {
        display: none !important;
      }

      /* Hide any buttons or interactive elements */
      button,
      .dropdown,
      .chart-header-dropdown,
      .relative.w-full:has(button),
      .chart-refresh-indicator {
        display: none !important;
      }

      /* Reference line - ensure it's visible and prominent */
      .recharts-reference-line {
        stroke: #EF4444 !important;
        stroke-width: 2.5 !important;
        stroke-dasharray: 8 4 !important;
        opacity: 1 !important;
      }

      .recharts-reference-line line {
        stroke: #EF4444 !important;
        stroke-width: 2.5 !important;
        stroke-dasharray: 8 4 !important;
        opacity: 1 !important;
      }

      .recharts-label,
      .recharts-reference-line .recharts-label {
        fill: #EF4444 !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        font-family: ${fontFamily} !important;
        opacity: 1 !important;
      }

      /* Ensure proper spacing */
      .chart-content {
        width: 100% !important;
        height: 100% !important;
        overflow: visible !important;
      }

      /* Bar chart specific fixes */
      .recharts-bar-rectangle,
      .recharts-bar-rectangle path {
        fill-opacity: 1 !important;
        stroke: none !important;
      }

      .recharts-bar rect {
        fill-opacity: 1 !important;
        stroke: none !important;
      }

      /* Line chart specific fixes */
      .recharts-line .recharts-line-curve {
        stroke-width: 2.5 !important;
        fill: none !important;
        opacity: 1 !important;
      }

      .recharts-line .recharts-line-dots .recharts-dot {
        fill-opacity: 1 !important;
        stroke-width: 2 !important;
        opacity: 1 !important;
      }

      .recharts-active-dot {
        display: none !important;
      }

      /* Force single page */
      @media print {
        body, .print-container {
          height: 100vh !important;
          overflow: hidden !important;
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
        }
        
        .print-content {
          height: calc(100vh - 120px) !important;
          overflow: hidden !important;
        }
      }
    `;
  }

  /**
   * Get background color for print
   */
  static getBackgroundColor() {
    return '#FFFFFF'; // Always white for print
  }

  /**
   * Get text color for print
   */
  static getTextColor() {
    return '#1F2937'; // Always dark for print
  }

  /**
   * Apply export styles to document (simplified for print-only export)
   */
  static applyExportStyles() {
    const styleId = 'chart-export-styles';

    // Remove existing styles if present
    const existingStyles = document.getElementById(styleId);
    if (existingStyles) {
      existingStyles.remove();
    }

    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.innerHTML = `
      .export-chart-container {
        position: relative;
        overflow: visible !important;
        background: ${this.getBackgroundColor()};
      }
      
      .chart-content {
        transform-origin: top left;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        overflow: visible !important;
      }
      
      /* Only hide tooltips during export */
      .exporting .recharts-tooltip-wrapper {
        display: none !important;
      }
      
      .recharts-wrapper,
      .recharts-surface {
        overflow: visible !important;
        background: white !important;
      }
      
      .recharts-cartesian-grid line {
        stroke-opacity: 0.3;
      }
      
      .recharts-legend-item {
        margin-right: 16px !important;
      }
      
      .recharts-text {
        font-family: system-ui, -apple-system, sans-serif !important;
        font-weight: 500 !important;
      }
      
      .recharts-cartesian-axis-tick text {
        font-size: 12px !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        fill: #4B5563 !important;
      }
      
      .recharts-legend-item text {
        font-size: 14px !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        fill: #1F2937 !important;
      }
    `;

    document.head.appendChild(styleTag);

    // Return cleanup function
    return () => {
      const styles = document.getElementById(styleId);
      if (styles) {
        styles.remove();
      }
    };
  }
}
