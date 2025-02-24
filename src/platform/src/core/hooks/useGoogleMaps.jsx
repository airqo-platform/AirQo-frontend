import { useState, useEffect } from 'react';

const useGoogleMaps = (apiKey) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => setIsGoogleLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setIsGoogleLoaded(true);
    }
  }, [apiKey]);

  return isGoogleLoaded;
};

export default useGoogleMaps;
