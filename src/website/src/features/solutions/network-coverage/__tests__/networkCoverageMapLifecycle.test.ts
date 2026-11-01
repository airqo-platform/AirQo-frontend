import { shouldInitializeNetworkCoverageMap } from '../networkCoverageMapLifecycle';

describe('shouldInitializeNetworkCoverageMap', () => {
  it('requires the dialog and picker to be visible', () => {
    expect(
      shouldInitializeNetworkCoverageMap({
        isOpen: false,
        isVisible: true,
        container: {} as HTMLElement,
      }),
    ).toBe(false);
    expect(
      shouldInitializeNetworkCoverageMap({
        isOpen: true,
        isVisible: false,
        container: {} as HTMLElement,
      }),
    ).toBe(false);
  });

  it('does not initialize after the dialog DOM has been removed', () => {
    expect(
      shouldInitializeNetworkCoverageMap({
        isOpen: false,
        isVisible: true,
        container: null,
      }),
    ).toBe(false);
  });

  it('initializes only with a committed container', () => {
    expect(
      shouldInitializeNetworkCoverageMap({
        isOpen: true,
        isVisible: true,
        container: {} as HTMLElement,
      }),
    ).toBe(true);
    expect(
      shouldInitializeNetworkCoverageMap({
        isOpen: true,
        isVisible: true,
        container: null,
      }),
    ).toBe(false);
  });
});
