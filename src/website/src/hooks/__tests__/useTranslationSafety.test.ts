import { act, renderHook } from '@testing-library/react';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/utils/googleTranslate', () => ({
  isGoogleTranslationActive: jest.fn(),
}));

import { isGoogleTranslationActive } from '@/lib/utils/googleTranslate';

import { useSafeNavigation } from '../useTranslationSafety';

const mockIsGoogleTranslationActive =
  isGoogleTranslationActive as jest.MockedFunction<
    typeof isGoogleTranslationActive
  >;

describe('useSafeNavigation', () => {
  let capturedHref: string;
  let originalLocation: Location;

  beforeEach(() => {
    mockPush.mockClear();
    mockIsGoogleTranslationActive.mockClear();
    capturedHref = '';
    originalLocation = window.location;

    const locationObj = {
      get href() {
        return capturedHref || 'https://example.com';
      },
      set href(val: string) {
        capturedHref = val;
      },
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn(),
      toString: () => capturedHref || 'https://example.com',
    };

    Object.defineProperty(window, 'location', {
      value: locationObj,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('should use router.push when translation is not active', () => {
    mockIsGoogleTranslationActive.mockReturnValue(false);

    const { result } = renderHook(() => useSafeNavigation());

    act(() => {
      result.current.navigateSafely('/about');
    });

    expect(mockPush).toHaveBeenCalledWith('/about');
    expect(capturedHref).toBe('');
  });

  it('should use window.location.href when translation is active', () => {
    mockIsGoogleTranslationActive.mockReturnValue(true);

    const { result } = renderHook(() => useSafeNavigation());

    act(() => {
      result.current.navigateSafely('/about');
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(capturedHref).toBe('/about');
  });

  it('should fallback to window.location.href on error', () => {
    mockIsGoogleTranslationActive.mockImplementation(() => {
      throw new Error('Translation check failed');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useSafeNavigation());

    act(() => {
      result.current.navigateSafely('/fallback');
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(capturedHref).toBe('/fallback');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Navigation error:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('should handle full URLs', () => {
    mockIsGoogleTranslationActive.mockReturnValue(false);

    const { result } = renderHook(() => useSafeNavigation());

    act(() => {
      result.current.navigateSafely('https://example.com/page');
    });

    expect(mockPush).toHaveBeenCalledWith('https://example.com/page');
  });

  it('should handle query parameters', () => {
    mockIsGoogleTranslationActive.mockReturnValue(true);

    const { result } = renderHook(() => useSafeNavigation());

    act(() => {
      result.current.navigateSafely('/search?q=test&page=1');
    });

    expect(capturedHref).toBe('/search?q=test&page=1');
  });

  it('should handle hash fragments', () => {
    mockIsGoogleTranslationActive.mockReturnValue(false);

    const { result } = renderHook(() => useSafeNavigation());

    act(() => {
      result.current.navigateSafely('/page#section');
    });

    expect(mockPush).toHaveBeenCalledWith('/page#section');
  });

  it('should handle empty href', () => {
    mockIsGoogleTranslationActive.mockReturnValue(false);

    const { result } = renderHook(() => useSafeNavigation());

    act(() => {
      result.current.navigateSafely('');
    });

    expect(mockPush).toHaveBeenCalledWith('');
  });
});
