import { useCallback } from 'react';
import { event } from '@/core/hooks/useGoogleAnalytics';
import html2canvas from 'html2canvas';

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
      // Hide map controls before capture
      const controls = mapRef.current
        .getContainer()
        .querySelector('.mapboxgl-ctrl-container');
      if (controls) {
        controls.style.visibility = 'hidden';
      }

      // Force a map render and wait for all sources and layers to load
      mapRef.current.triggerRepaint();
      await new Promise((resolve) => {
        const checkLoaded = () => {
          if (!mapRef.current.loaded() || !mapRef.current.isStyleLoaded()) {
            setTimeout(checkLoaded, 100);
            return;
          }
          setTimeout(resolve, 500); // Extra delay to ensure everything is rendered
        };
        checkLoaded();
      });

      // Get the map container and canvas
      const mapContainer = mapRef.current.getContainer();
      const mapCanvas = mapRef.current.getCanvas();

      // Create a temporary canvas for the final image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = mapCanvas.width;
      tempCanvas.height = mapCanvas.height;
      const ctx = tempCanvas.getContext('2d');

      // Draw the map canvas first
      ctx.drawImage(mapCanvas, 0, 0);

      // Capture markers layer using html2canvas
      const markersLayer = mapContainer.querySelector(
        '.mapboxgl-canvas-container',
      );
      if (markersLayer) {
        const markersImage = await html2canvas(markersLayer, {
          backgroundColor: null,
          logging: false,
          scale: window.devicePixelRatio,
          width: mapCanvas.width,
          height: mapCanvas.height,
          x: markersLayer.offsetLeft,
          y: markersLayer.offsetTop,
        });

        // Draw markers on top of the map
        ctx.drawImage(markersImage, 0, 0);
      }

      // Add watermark
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillText('© AirQo | Mapbox', 10, tempCanvas.height - 10);

      // Restore map controls
      if (controls) {
        controls.style.visibility = 'visible';
      }

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

      setTimeout(() => {
        flashElement.style.opacity = '0';
        setTimeout(() => {
          mapContainer.removeChild(flashElement);
        }, 300);
      }, 100);

      // Convert and download
      const finalImage = tempCanvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `airqo-map-${new Date().toISOString().split('T')[0]}-${new Date()
        .toTimeString()
        .split(' ')[0]
        .replace(/:/g, '-')}.jpeg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success message and analytics
      setToastMessage({
        message: 'Screenshot saved successfully',
        type: 'success',
        bgColor: 'bg-green-500',
      });

      event({
        action: 'map_screenshot',
        category: 'Map Interaction',
        label: `Zoom: ${mapRef.current.getZoom().toFixed(1)}`,
        value: 1,
      });
    } catch (error) {
      setToastMessage({
        message: 'Failed to capture screenshot',
        type: 'error',
        bgColor: 'bg-red-500',
      });

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
