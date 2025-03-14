import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import { event } from '@/core/hooks/useGoogleAnalytics';

/**
 * Hook for capturing and downloading map screenshots
 * @param {Object} mapRef - Reference to the map instance
 * @param {Function} setToastMessage - Function to display toast notifications
 * @returns {Function} captureScreenshot - Function to trigger screenshot capture
 */
const useMapScreenshot = (mapRef, setToastMessage) => {
  const captureScreenshot = useCallback(async () => {
    if (!mapRef.current) {
      setToastMessage({
        message: 'Map is not ready for screenshot',
        type: 'error',
        bgColor: 'bg-red-500',
      });
      return;
    }

    try {
      // Find the map container element
      const mapContainer = mapRef.current.getContainer();
      // Show capture feedback
      const flashElement = document.createElement('div');
      flashElement.style.position = 'absolute';
      flashElement.style.top = '0';
      flashElement.style.left = '0';
      flashElement.style.width = '100%';
      flashElement.style.height = '100%';
      flashElement.style.backgroundColor = 'white';
      flashElement.style.opacity = '0.3';
      flashElement.style.zIndex = '1000';
      flashElement.style.transition = 'opacity 0.3s ease-out';

      mapContainer.appendChild(flashElement);

      // Fade out the flash effect
      setTimeout(() => {
        flashElement.style.opacity = '0';
        setTimeout(() => {
          mapContainer.removeChild(flashElement);
        }, 300);
      }, 100);

      // Capture the map as canvas
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: false,
        logging: false,
        scale: window.devicePixelRatio || 1,
      });

      // Add watermark and attribution
      const ctx = canvas.getContext('2d');
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillText('© AirQo | Mapbox', 10, canvas.height - 10);

      // Convert to image and download
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;

      // Create filename with date
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];
      const formattedTime = date
        .toTimeString()
        .split(' ')[0]
        .replace(/:/g, '-');
      link.download = `airqo-map-${formattedDate}-${formattedTime}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track event in analytics
      event({
        action: 'map_screenshot',
        category: 'Map Interaction',
        label: `Zoom: ${mapRef.current.getZoom().toFixed(1)}`,
        value: 1,
      });

      // Show success message
      setToastMessage({
        message: 'Screenshot saved successfully',
        type: 'success',
        bgColor: 'bg-green-500',
      });
    } catch (error) {
      setToastMessage({
        message: 'Failed to capture screenshot',
        type: 'error',
        bgColor: 'bg-red-500',
      });

      // Track error
      event({
        action: 'map_screenshot_error',
        category: 'Error',
        label: error.message,
      });
    }
  }, [mapRef, setToastMessage]);

  return captureScreenshot;
};

export default useMapScreenshot;
