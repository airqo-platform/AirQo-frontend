import { useCallback } from 'react';
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
      // Show processing message
      setToastMessage({
        message: 'Generating screenshot...',
        type: 'success',
        bgColor: 'bg-blue-500',
      });

      // Get the map container and canvas
      const mapContainer = mapRef.current.getContainer();
      const mapCanvas = mapRef.current.getCanvas();
      const controls = mapContainer.querySelector('.mapboxgl-ctrl-container');

      // Hide map controls for clean capture
      if (controls) {
        controls.style.visibility = 'hidden';
      }

      // Ensure map is fully rendered
      mapRef.current.triggerRepaint();
      await new Promise((resolve) => {
        const checkLoaded = () => {
          if (!mapRef.current?.loaded() || !mapRef.current?.isStyleLoaded()) {
            setTimeout(checkLoaded, 100);
            return;
          }
          setTimeout(resolve, 300); // Short delay to ensure rendering
        };
        checkLoaded();
      });

      // Create a temporary canvas for the final image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = mapCanvas.width;
      tempCanvas.height = mapCanvas.height;
      const ctx = tempCanvas.getContext('2d');

      // Draw the map canvas
      ctx.drawImage(mapCanvas, 0, 0);

      // Capture markers layer
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

      // Create flash effect
      const flashElement = document.createElement('div');
      flashElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        opacity: 0.3;
        z-index: 1000;
        transition: opacity 0.3s ease-out;
      `;

      mapContainer.appendChild(flashElement);
      setTimeout(() => {
        flashElement.style.opacity = '0';
        setTimeout(() => {
          mapContainer.removeChild(flashElement);
        }, 300);
      }, 100);

      // Convert and download
      const timestamp = new Date()
        .toISOString()
        .replace(/[:T]/g, '-')
        .slice(0, 19);
      const finalImage = tempCanvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `airqo-map-${timestamp}.jpeg`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Update toast with success message
      setToastMessage({
        message: 'Screenshot saved successfully',
        type: 'success',
        bgColor: 'bg-green-500',
      });
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      setToastMessage({
        message: 'Failed to capture screenshot',
        type: 'error',
        bgColor: 'bg-red-500',
      });
    }
  }, [mapRef, setToastMessage]);

  return captureScreenshot;
};

export default useMapScreenshot;
