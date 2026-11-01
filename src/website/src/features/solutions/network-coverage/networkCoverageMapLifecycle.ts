export const shouldInitializeNetworkCoverageMap = (options: {
  isOpen: boolean;
  isVisible: boolean;
  container: HTMLElement | null;
}): boolean =>
  options.isOpen && options.isVisible && options.container !== null;
