export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}));

export const usePathname = jest.fn(() => '/');
export const useSearchParams = jest.fn(() => new URLSearchParams());
export const useParams = jest.fn(() => ({}));
export const useSelectedLayoutSegment = jest.fn(() => null);
export const useSelectedLayoutSegments = jest.fn(() => []);
export const redirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT: ${url}`);
});

export const notFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
