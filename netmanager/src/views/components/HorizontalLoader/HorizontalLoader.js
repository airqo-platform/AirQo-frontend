import React, { useState, useEffect } from 'react';
import './loader.css';

const HorizontalLoader = ({ color, loading, initial, target, duration }) => {
  // horizontal loader custom hook
  const useProgress = (initial, target, duration) => {
    const [progress, setProgress] = useState(initial);
    const startProgress = () => {
      const increment = (target - initial) / (duration / 16.67);
      // Store the id in a variable
      let id = setInterval(() => {
        setProgress((prev) => {
          if (prev + increment >= target) {
            // Clear the interval with the id
            clearInterval(id);
            return target;
          }
          return prev + increment;
        });
      }, 16.67);
    };

    return [progress, startProgress];
  };

  const [progress, startProgress] = useProgress(initial, target, duration);

  // this will start the animation when loading is true
  useEffect(() => {
    if (loading) {
      startProgress();
    }
  }, [loading]);

  return (
    <div
      className="loader-container"
      style={{
        zIndex: loading ? 9999 : -1
      }}>
      {loading && (
        <div
          className="loader"
          style={{
            backgroundColor: color,
            width: `${progress}%`
          }}></div>
      )}
    </div>
  );
};

export default HorizontalLoader;
