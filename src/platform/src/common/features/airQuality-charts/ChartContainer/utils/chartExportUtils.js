/**
 * Modern Chart Export Utility
 * Clean, professional exports with proper spacing and typography
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
   */
  static async _exportPDF(element, config) {
    const container = this._findContainer(element);
    let title = this._getTitle(container);

    // Use custom title if provided in export options
    if (config.title) {
      title = config.title;
    }

    container.classList.add('exporting');
    try {
      // Capture the chart as a high-quality canvas image
      const canvas = await this._createCanvas(container, config);
      const imgData = canvas.toDataURL('image/png');

      // Prepare PDF content structure
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [40, 60, 40, 60],
        fonts: {
          Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
          },
        },
        content: [
          // Header
          {
            columns: [
              {
                text: title,
                style: 'header',
                bold: true,
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
                x2: 595 - 2 * 40, // A4 landscape width minus margins
                y2: 0,
                lineWidth: 1,
                lineColor: config.colors.border.replace('#', ''),
              },
            ],
            margin: [0, 10, 0, 15],
          },
          // Chart Image - Centered
          {
            image: imgData,
            width: 515, // Fit within margins
            alignment: 'center',
            margin: [0, 0, 0, 20],
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
            color: config.colors.text,
          },
          date: {
            fontSize: 10,
            color: config.colors.text,
            bold: true,
          },
          brand: {
            fontSize: 8,
            color: config.colors.muted,
            italics: true,
          },
          footer: {
            fontSize: 8,
            color: config.colors.muted,
          },
        },
      };

      // Dynamically import pdfmake and vfs_fonts
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      const pdfMake = pdfMakeModule.default;
      const vfs = pdfFontsModule.default;
      if (vfs && typeof vfs === 'object') {
        pdfMake.vfs = vfs;
      } else {
        console.warn(
          'pdfmake vfs_fonts not loaded correctly, using default (built-in) fonts only.',
        );
      }

      // Create and download the PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      const filename = `${this._sanitizeFilename(title)}-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdfDocGenerator.download(filename);
    } finally {
      container.classList.remove('exporting');
    }
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
        // Trim long titles to avoid clutter
        return el.textContent.trim().split(' ')[0]; // Use only the first word or part of the title
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
