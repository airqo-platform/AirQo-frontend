import { useMemo } from 'react';

/**
 * Custom hook for calculating responsive chart dimensions
 * @param {number|string} width - Desired width
 * @param {number|string} height - Desired height
 * @param {Object} options - Additional options
 * @returns {Object} Chart dimensions and styles
 */
export const useChartDimensions = (width, height, options = {}) => {
  const {
    defaultHeight = 250,
    minHeight = 220,
    maxHeight = 600,
    aspectRatio = 16 / 9,
    containerPadding = '0.5rem',
  } = options;

  return useMemo(() => {
    const containerWidth = width || '100%';

    // Calculate height based on provided value or default
    let calculatedHeight = height || defaultHeight;

    // If width is provided and no height, calculate based on aspect ratio
    if (width && !height && typeof width === 'number') {
      calculatedHeight = Math.round(width / aspectRatio);
    }

    // Ensure height is within reasonable bounds
    if (typeof calculatedHeight === 'number') {
      calculatedHeight = Math.max(
        minHeight,
        Math.min(maxHeight, calculatedHeight),
      );
    }

    // Convert to pixel value for consistent styling
    const finalHeight =
      typeof calculatedHeight === 'number'
        ? `${calculatedHeight}px`
        : calculatedHeight;

    return {
      width: containerWidth,
      height: calculatedHeight,
      containerStyle: {
        width: containerWidth,
        height: finalHeight,
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
        position: 'relative',
        overflow: 'hidden',
      },
      chartStyle: {
        width: '100%',
        height: '100%',
        padding: containerPadding,
        margin: 0,
        overflow: 'hidden',
      },
      dimensions: {
        width: containerWidth,
        height: calculatedHeight,
        minHeight,
        maxHeight,
        aspectRatio,
      },
    };
  }, [
    width,
    height,
    defaultHeight,
    minHeight,
    maxHeight,
    aspectRatio,
    containerPadding,
  ]);
};
