import React, { useEffect, useState, useCallback } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const Scroll_to_top = () => {
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = useCallback(() => {
    const shouldShowScroll = window.scrollY >= 400;
    if (showScroll !== shouldShowScroll) {
      setShowScroll(shouldShowScroll);
    }
  }, [showScroll]);

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [checkScrollTop]);

  const ScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    showScroll && (
      <div className="scroll-top" onClick={ScrollTop}>
        <ArrowUpwardIcon
          className="scroll-top-icon"
          sx={{
            width: '40px',
            height: '40px',
            color: '#FFF'
          }}
        />
      </div>
    )
  );
};

export default Scroll_to_top;
