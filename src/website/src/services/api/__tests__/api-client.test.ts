import apiClient from '../api-client';

const originalFetch = global.fetch;
const mockFetch = jest.fn();

describe('ApiClient Network Coverage cache behavior', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
    global.fetch = originalFetch;
  });

  it.each([
    'devices/network-coverage',
    'devices/network-coverage/countries/kenya/monitors',
  ])('bypasses browser caching for %s requests', async (url) => {
    await apiClient.request({ method: 'GET', url });

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/v2/${url}`,
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('does not match a route that only shares the Network Coverage prefix', async () => {
    const url = 'devices/network-coverage-v2';

    await apiClient.request({ method: 'GET', url });

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/v2/${url}`,
      expect.not.objectContaining({ cache: 'no-store' }),
    );
  });
});
