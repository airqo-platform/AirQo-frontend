/**
 * Utility functions for responsive design
 */

export const isDesktop = (width: number): boolean => width >= 1024;

export const isMobile = (width: number): boolean => width < 1024;

export const isTablet = (width: number): boolean => width >= 768 && width < 1024;
