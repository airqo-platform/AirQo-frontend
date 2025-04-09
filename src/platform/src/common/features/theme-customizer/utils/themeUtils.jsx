export const applyTheme = (mode) => {
  // Remove existing theme classes
  document.documentElement.classList.remove('light', 'dark', 'system');

  // Apply new theme class
  document.documentElement.classList.add(mode);

  // Persist theme selection
  localStorage.setItem('app-theme', mode);
};

export const getInitialTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('app-theme');
  if (savedTheme) return savedTheme;

  // Check system preference
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    return prefersDark ? 'dark' : 'light';
  }

  // Default to light if no preference detected
  return 'light';
};
