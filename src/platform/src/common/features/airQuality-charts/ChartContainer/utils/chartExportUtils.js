// src/common/features/charts/utils/chartExportUtils.js (or your relevant path)

/**
 * Modern Chart Export Utility
 * Clean, professional exports with proper spacing and typography
 * Refactored PDF export using pdfmake instead of window.print()
 */
export class ChartExportUtils {
  static EXPORT_FORMATS = ['pdf', 'png'];
  static FORMATS = ['pdf', 'png']; // Legacy compatibility
  static CONFIG = {
    fonts:
      '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    colors: {
      background: '#ffffff',
      text: '#1f2937',
      muted: '#6b7280',
      border: '#e5e7eb',
      accent: '#3b82f6',
    },
    spacing: {
      header: '32px',
      content: '24px',
      footer: '20px',
    },
    export: {
      delay: 800,
      scale: 2,
      quality: 0.95,
    },
  };

  /**
   * Main export function
   */
  static async exportChart(element, format = 'pdf', options = {}) {
    if (!element || !this.EXPORT_FORMATS.includes(format)) {
      throw new Error(`Invalid element or format: ${format}`);
    }
    const config = { ...this.CONFIG, ...options };
    try {
      await this._wait(config.export.delay);
      if (format === 'pdf') {
        return await this._exportPDF(element, config);
      } else {
        return await this._exportPNG(element, config);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * PNG Export
   */
  static async _exportPNG(element, config) {
    const container = this._findContainer(element);
    const title = this._getTitle(container);
    container.classList.add('exporting');
    try {
      const canvas = await this._createCanvas(container, config);
      await this._downloadFile(canvas, title, 'png', config.export.quality);
    } finally {
      container.classList.remove('exporting');
    }
  }

  /**
   * PDF Export using pdfmake for a professional layout
   * Generates a canvas image of the chart and embeds it in a PDF.
   */
  static async _exportPDF(element, config) {
    const container = this._findContainer(element);
    const title = this._getTitle(container);

    container.classList.add('exporting');
    try {
      // 1. Capture the chart as a high-quality canvas image
      const canvas = await this._createCanvas(container, config);

      // 2. Convert canvas to Data URL (base64)
      const imgData = canvas.toDataURL('image/png');

      // 3. Define PDF specific configuration
      const pdfConfig = {
        pageMargins: [40, 60, 40, 60], // [left, top, right, bottom] in points
        // Note: Do not specify defaultStyle.font here if relying on built-in fonts
        // and automatic bold simulation. Let pdfmake handle it.
      };

      // 4. Prepare PDF content structure
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: pdfConfig.pageMargins,
        // Remove defaultStyle.font to let pdfmake use built-ins correctly
        // defaultStyle: pdfConfig.defaultStyle,
        content: [
          // Header
          {
            columns: [
              {
                text: title,
                style: 'header',
                // bold: true, // Move bold here or keep in style
              },
              {
                stack: [
                  { text: date, style: 'date', alignment: 'right' },
                  {
                    text: 'AirQo Platform',
                    style: 'brand',
                    alignment: 'right',
                  },
                ],
                width: 'auto',
              },
            ],
            columnGap: 10,
          },
          // Add a line separator
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 595 - 2 * 40, // A4 landscape width (595pt) minus margins
                y2: 0,
                lineWidth: 1,
                lineColor: config.colors.border.replace('#', ''), // Simple conversion for pdfmake
              },
            ],
            margin: [0, 10, 0, 15], // Add some vertical spacing
          },
          // Chart Image - Centered
          {
            image: imgData,
            width: 515, // Fit within margins (595 - 2*40 = 515)
            alignment: 'center',
            margin: [0, 0, 0, 20], // Add bottom margin
          },
        ],
        footer: () => {
          return {
            columns: [
              {
                text: `© ${new Date().getFullYear()} AirQo Platform - Air Quality Analytics`,
                style: 'footer',
                alignment: 'center',
                margin: [0, 10, 0, 0],
              },
            ],
          };
        },
        styles: {
          header: {
            fontSize: 20,
            bold: true, // Define bold here in the style
            color: config.colors.text,
          },
          date: {
            fontSize: 10,
            bold: true, // Define bold here
            color: config.colors.text,
            margin: [0, 0, 0, 2],
          },
          brand: {
            fontSize: 8,
            color: config.colors.muted,
            italics: true, // Use italics if preferred
          },
          footer: {
            fontSize: 8,
            color: config.colors.muted,
          },
        },
        // Crucially, define the fonts section to map standard font names
        // to their built-in representations. This allows bold/italics to work.
        fonts: {
          // Map 'Helvetica' (and common aliases) to the built-in font
          Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold', // Built-in bold variant name
            italics: 'Helvetica-Oblique', // Built-in italic variant name
            bolditalics: 'Helvetica-BoldOblique', // Built-in bold-italic variant name
          },
          // Optionally map other standard fonts if used
          // Times: { ... },
          // Courier: { ... }
          // If you want to use 'Roboto' as default, you'd need to provide the .ttf files
          // via vfs and define them here. For now, stick to built-ins.
        },
        // Page margins are already set above
      };

      // 5. Dynamically import pdfmake
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      const pdfMake = pdfMakeModule.default;
      const vfs = pdfFontsModule.default;

      // Assign the virtual file system for fonts to pdfmake
      if (vfs && typeof vfs === 'object') {
        pdfMake.vfs = vfs;
      } else {
        console.warn(
          'pdfmake vfs_fonts not loaded correctly, using default (built-in) fonts only.',
        );
      }

      // 6. Create and download the PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      const filename = `${this._sanitizeFilename(title)}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdfDocGenerator.download(filename);
    } finally {
      container.classList.remove('exporting');
    }
  }

  /**
   * Create optimized canvas
   */
  static async _createCanvas(element, config) {
    const html2canvas = await import('html2canvas').then((m) => m.default);
    return html2canvas(element, {
      scale: config.export.scale,
      backgroundColor: config.colors.background,
      useCORS: true,
      allowTaint: false,
      logging: false,
      onclone: (doc) => this._cleanClone(doc, config),
    });
  }

  /**
   * Clean cloned document for PNG export (and potentially for consistent canvas capture)
   */
  static _cleanClone(doc, config) {
    // Remove interactive elements
    const interactive = doc.querySelectorAll(
      'button, .dropdown, .tooltip, [data-tooltip], .recharts-tooltip-wrapper',
    );
    interactive.forEach((el) => {
      // Hide visually and remove from layout
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.setAttribute('aria-hidden', 'true');
    });
    // Apply chart optimizations to the cloned document
    this._optimizeChart(doc.body, config);
  }

  /**
   * Optimize chart elements (for image capture consistency)
   */
  static _optimizeChart(element, config) {
    // Style reference lines
    const refLines = element.querySelectorAll('.recharts-reference-line line');
    refLines.forEach((line) => {
      line.setAttribute('stroke', '#ef4444');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '5 5');
    });
    // Style grid
    const gridLines = element.querySelectorAll('.recharts-cartesian-grid line');
    gridLines.forEach((line) => {
      line.setAttribute('stroke', config.colors.border);
      line.setAttribute('stroke-opacity', '0.4');
    });
    // Ensure legends are visible
    const legends = element.querySelectorAll('.recharts-legend-wrapper');
    legends.forEach((legend) => {
      legend.style.display = 'block';
      legend.style.visibility = 'visible';
      legend.style.position = 'relative';
      legend.style.marginTop = '24px';
    });
  }

  /**
   * Helper methods
   */
  static _findContainer(element) {
    return (
      element.closest('.chart-container') ||
      element.closest('[class*="chart"]') ||
      element
    );
  }
  static _getTitle(container) {
    const selectors = ['h1', 'h2', 'h3', '[data-chart-title]', '.chart-title'];
    for (const selector of selectors) {
      const el =
        container.querySelector(selector) ||
        container.parentElement?.querySelector(selector);
      if (el?.textContent?.trim()) {
        return el.textContent.trim();
      }
    }
    return (
      container.title ||
      container.getAttribute('aria-label') ||
      'Air Quality Chart'
    );
  }
  static _escape(text) {
    return text.replace(
      /[<>&"']/g,
      (match) =>
        ({
          '<': '<',
          '>': '>',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;',
        })[match],
    );
  }
  static _sanitizeFilename(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  static async _downloadFile(canvas, title, format, quality) {
    const filename = `${this._sanitizeFilename(title)}-${new Date().toISOString().slice(0, 10)}.${format}`;
    const mimeType = `image/${format}`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(mimeType, quality);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  static async _wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
