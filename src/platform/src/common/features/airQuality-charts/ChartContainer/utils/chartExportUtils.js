import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image-more';

/**
 * Chart export utility for handling PNG, JPG, and PDF exports
 */
export class ChartExportUtils {
  static EXPORT_FORMATS = ['png', 'jpg', 'pdf'];

  static DEFAULT_OPTIONS = {
    quality: 0.95,
    scale: 2,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '12px',
    fontWeight: '500',
    exportDelay: 500,
    pdfMargin: 20,
  };

  /**
   * Export chart element to specified format
   * @param {HTMLElement} chartElement - The chart element to export
   * @param {string} format - Export format (png, jpg, pdf)
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  static async exportChart(chartElement, format, options = {}) {
    if (!chartElement || !this.EXPORT_FORMATS.includes(format)) {
      throw new Error(`Invalid format: ${format}`);
    }

    const config = { ...this.DEFAULT_OPTIONS, ...options };

    // Wait for chart rendering to complete
    await new Promise((resolve) => setTimeout(resolve, config.exportDelay));

    // Get the actual chart element (without padding container)
    const targetElement =
      chartElement.querySelector('.recharts-wrapper') || chartElement;

    // Apply temporary export class
    chartElement.classList.add('exporting');

    try {
      const exportOptions = this._buildExportOptions(
        targetElement,
        format,
        config,
      );
      const dataUrl = await this._generateDataUrl(
        targetElement,
        format,
        exportOptions,
      );

      if (format === 'pdf') {
        await this._exportToPdf(dataUrl, config);
      } else {
        this._downloadImage(dataUrl, format);
      }
    } finally {
      // Always remove temporary class
      chartElement.classList.remove('exporting');
    }
  }

  /**
   * Build export options for dom-to-image
   * @private
   */
  static _buildExportOptions(element, format, config) {
    const actualWidth = element.offsetWidth;
    const actualHeight = element.offsetHeight;
    const { scale, fontFamily, fontSize, fontWeight } = config;

    return {
      width: actualWidth * scale,
      height: actualHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${actualWidth}px`,
        height: `${actualHeight}px`,
        padding: '0',
        margin: '0',
        overflow: 'visible',
        backgroundColor: config.backgroundColor,
        fontFamily,
        fontSize,
        fontWeight,
      },
      quality: format === 'jpg' ? 0.98 : 1.0,
      bgcolor: config.backgroundColor,
      imagePlaceholder: '',
      cacheBust: true,
      filter: this._createElementFilter(),
    };
  }

  /**
   * Create filter function for dom-to-image
   * @private
   */
  static _createElementFilter() {
    return (node) => {
      // Filter out problematic elements
      if (node.classList) {
        const excludedClasses = [
          'dropdown',
          'tooltip',
          'recharts-tooltip-wrapper',
          'absolute',
        ];

        return (
          !excludedClasses.some((cls) => node.classList.contains(cls)) &&
          !node.id?.includes('dropdown')
        );
      }

      // Filter out whitespace-only text nodes
      if (node.nodeType === 3) {
        return node.textContent.trim() !== '';
      }

      return true;
    };
  }

  /**
   * Generate data URL based on format
   * @private
   */
  static async _generateDataUrl(element, format, options) {
    switch (format) {
      case 'png':
        return await domtoimage.toPng(element, options);
      case 'jpg':
        return await domtoimage.toJpeg(element, options);
      case 'pdf':
        // For PDF, first convert to PNG
        return await domtoimage.toPng(element, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export to PDF format
   * @private
   */
  static async _exportToPdf(dataUrl, config) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const pdf = new jsPDF('l', 'mm', 'a4');
          const dimensions = this._calculatePdfDimensions(
            pdf,
            img,
            config.pdfMargin,
          );

          // Add title
          this._addPdfTitle(pdf, config.chartTitle, dimensions);

          // Add image
          pdf.addImage(
            dataUrl,
            'PNG',
            dimensions.x,
            dimensions.y,
            dimensions.width,
            dimensions.height,
            '',
            'FAST',
          );

          // Add metadata
          this._addPdfMetadata(pdf, dimensions);

          // Save PDF
          const filename = `air-quality-chart-${new Date().toISOString().slice(0, 10)}.pdf`;
          pdf.save(filename);

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for PDF'));
      img.src = dataUrl;
    });
  }

  /**
   * Calculate PDF dimensions
   * @private
   */
  static _calculatePdfDimensions(pdf, img, margin) {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 3; // Extra margin for title

    const imgAspectRatio = img.width / img.height;
    const availableAspectRatio = availableWidth / availableHeight;

    let finalWidth, finalHeight;

    if (imgAspectRatio > availableAspectRatio) {
      finalWidth = availableWidth;
      finalHeight = finalWidth / imgAspectRatio;
    } else {
      finalHeight = availableHeight;
      finalWidth = finalHeight * imgAspectRatio;
    }

    return {
      width: finalWidth,
      height: finalHeight,
      x: (pdfWidth - finalWidth) / 2,
      y: margin + 20,
      pdfWidth,
      pdfHeight,
      margin,
    };
  }

  /**
   * Add title to PDF
   * @private
   */
  static _addPdfTitle(pdf, title, dimensions) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      title || 'Air Quality Chart',
      dimensions.pdfWidth / 2,
      dimensions.margin,
      { align: 'center' },
    );
  }

  /**
   * Add metadata to PDF
   * @private
   */
  static _addPdfMetadata(pdf, dimensions) {
    const { pdfWidth, pdfHeight, margin } = dimensions;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Timestamp
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated on: ${timestamp}`, margin, pdfHeight - 10);

    // Platform info
    pdf.text(
      'AirQo Platform - Air Quality Data',
      pdfWidth - margin,
      pdfHeight - 10,
      { align: 'right' },
    );
  }

  /**
   * Download image file
   * @private
   */
  static _downloadImage(dataUrl, format) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `air-quality-chart-${new Date().toISOString().slice(0, 10)}.${format}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get background color based on theme
   */
  static getBackgroundColor(isDark) {
    return isDark ? '#1F2937' : '#FFFFFF';
  }

  /**
   * Get text color based on theme
   */
  static getTextColor(isDark) {
    return isDark ? '#F9FAFB' : '#1F2937';
  }

  /**
   * Apply export styles to document
   */
  static applyExportStyles(isDark) {
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
        background: ${this.getBackgroundColor(isDark)};
      }
      
      .chart-content {
        transform-origin: top left;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        overflow: visible !important;
      }
      
      .chart-content.exporting {
        overflow: visible !important;
        height: auto !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        background: ${this.getBackgroundColor(isDark)} !important;
      }
      
      .chart-content.exporting .recharts-wrapper,
      .chart-content.exporting .recharts-surface {
        overflow: visible !important;
        background: ${this.getBackgroundColor(isDark)} !important;
      }
      
      .chart-content.exporting .recharts-tooltip-wrapper {
        display: none !important;
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
        fill: ${isDark ? '#D1D5DB' : '#4B5563'} !important;
      }
      
      .recharts-legend-item text {
        font-size: 14px !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        fill: ${this.getTextColor(isDark)} !important;
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
