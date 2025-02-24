import React, { useState, useEffect } from 'react';
import './loader.css';

const HorizontalLoader = ({ loading }) => {
  const color = '#FFCC00';
  const initial = 0;
  const target = 100;
  const duration = 2000;

  // horizontal loader custom hook
  const useProgress = (initial, target, duration) => {
    const [progress, setProgress] = useState(initial);
    useEffect(() => {
      let id;
      if (loading) {
        setProgress(initial);
        const increment = (target - initial) / (duration / 16.67);
        id = setInterval(() => {
          setProgress((prev) => {
            if (prev + increment >= target) {
              clearInterval(id);
              return target;
            }
            return prev + increment;
          });
        }, 16.67);
      } else {
        setProgress(initial);
      }
      return () => clearInterval(id);
    }, [loading]);

    return progress;
  };

  const progress = useProgress(initial, target, duration);

  return (
    <div
      className="loader-container"
      style={{
        zIndex: loading ? 9999 : -1,
        position: 'fixed',
        width: '100%',
        left: 0,
        height: '4px'
      }}>
      {loading && (
        <div
          className="loader"
          style={{
            backgroundColor: color,
            width: `${progress}%`,
            height: '100%'
          }}></div>
      )}
    </div>
  );
};

export default HorizontalLoader;
