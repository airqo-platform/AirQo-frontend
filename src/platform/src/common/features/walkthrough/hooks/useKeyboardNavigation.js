import { useEffect } from 'react';

export default function useKeyboardNavigation({
  isActive,
  onNext,
  onPrevious,
  onEscape,
  configuration = {},
}) {
  useEffect(() => {
    if (!isActive || configuration.keyboardNavigation === false) {
      return;
    }
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          onNext?.();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          onPrevious?.();
          break;
        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
        case 'Enter':
        case ' ':
          if (event.target.classList.contains('walkthrough-controls__button')) {
            return;
          }
          event.preventDefault();
          onNext?.();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isActive,
    onNext,
    onPrevious,
    onEscape,
    configuration.keyboardNavigation,
  ]);
}
