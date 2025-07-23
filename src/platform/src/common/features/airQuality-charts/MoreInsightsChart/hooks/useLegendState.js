import { useState } from 'react';

export default function useLegendState() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [legendLocked, setLegendLocked] = useState(false);

  const handleLegendMouseEnter = (idx) => {
    if (!legendLocked) setActiveIndex(idx);
  };
  const handleLegendMouseLeave = () => {
    if (!legendLocked) setActiveIndex(null);
  };
  const handleLegendClick = (idx) => {
    if (legendLocked && activeIndex === idx) {
      setLegendLocked(false);
      setActiveIndex(null);
    } else {
      setLegendLocked(true);
      setActiveIndex(idx);
    }
  };

  return {
    activeIndex,
    legendLocked,
    handleLegendMouseEnter,
    handleLegendMouseLeave,
    handleLegendClick,
  };
}
