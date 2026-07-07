import apiClient from '@/services/api/api-client';

import { BaseApiService } from '../base';

jest.mock('@/services/api/api-client', () => ({
  __esModule: true,
  default: {
    request: jest.fn(),
  },
}));

class TestService extends BaseApiService {
  constructor() {
    super('test');
  }

  public testGet<T>(url: string, params?: Record<string, any>, options?: any) {
    return this.get<T>(url, params, options);
  }

  public testPost<T>(url: string, data?: any, options?: any) {
    return this.post<T>(url, data, options);
  }

  public testPut<T>(url: string, data?: any, options?: any) {
    return this.put<T>(url, data, options);
  }

  public testPatch<T>(url: string, data?: any, options?: any) {
    return this.patch<T>(url, data, options);
  }

  public testDelete<T>(url: string, options?: any) {
    return this.delete<T>(url, options);
  }

  public testBuildUrlWithParams(baseUrl: string, params?: Record<string, any>) {
    return this.buildUrlWithParams(baseUrl, params);
  }

  public testTransformPaginatedResponse<T extends Record<string, any>>(
    data: any,
  ) {
    return this.transformPaginatedResponse<T>(data);
  }
}

describe('BaseApiService', () => {
  let service: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TestService();
  });

  describe('buildUrlWithParams', () => {
    it('returns baseUrl when params is undefined', () => {
      expect(service.testBuildUrlWithParams('/api/test')).toBe('/api/test');
    });

    it('returns baseUrl when params is empty object', () => {
      expect(service.testBuildUrlWithParams('/api/test', {})).toBe('/api/test');
    });

    it('appends single param to baseUrl', () => {
      const result = service.testBuildUrlWithParams('/api/test', { page: 1 });
      expect(result).toBe('/api/test?page=1');
    });

    it('appends multiple params to baseUrl', () => {
      const result = service.testBuildUrlWithParams('/api/test', {
        page: 1,
        limit: 10,
        search: 'hello',
      });
      expect(result).toBe('/api/test?page=1&limit=10&search=hello');
    });

    it('skips undefined values', () => {
      const result = service.testBuildUrlWithParams('/api/test', {
        page: 1,
        search: undefined,
        limit: 10,
      });
      expect(result).toBe('/api/test?page=1&limit=10');
    });

    it('skips null values', () => {
      const result = service.testBuildUrlWithParams('/api/test', {
        page: 1,
        search: null,
        limit: 10,
      });
      expect(result).toBe('/api/test?page=1&limit=10');
    });

    it('returns baseUrl when all param values are undefined', () => {
      const result = service.testBuildUrlWithParams('/api/test', {
        page: undefined,
        search: undefined,
      });
      expect(result).toBe('/api/test');
    });

    it('converts number values to strings', () => {
      const result = service.testBuildUrlWithParams('/api/test', {
        page: 42,
      });
      expect(result).toBe('/api/test?page=42');
    });

    it('converts boolean values to strings', () => {
      const result = service.testBuildUrlWithParams('/api/test', {
        active: true,
      });
      expect(result).toBe('/api/test?active=true');
    });

    it('encodes special characters in param values', () => {
      const result = service.testBuildUrlWithParams('/api/test', {
        search: 'hello world',
      });
      expect(result).toBe('/api/test?search=hello+world');
    });

    it('handles baseUrl that already contains a query string', () => {
      const result = service.testBuildUrlWithParams('/api/test?existing=1', {
        page: 2,
      });
      expect(result).toBe('/api/test?existing=1?page=2');
    });
  });

  describe('transformPaginatedResponse', () => {
    it('transforms response with results field', () => {
      const data = {
        results: [{ id: 1 }, { id: 2 }],
        count: 50,
        page_size: 10,
        current_page: 3,
        next: 'http://next-page',
        previous: 'http://prev-page',
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result).toEqual({
        data: [{ id: 1 }, { id: 2 }],
        pagination: {
          page: 3,
          limit: 10,
          total: 50,
          pages: 5,
          hasNext: true,
          hasPrevious: true,
        },
      });
    });

    it('transforms response with data field instead of results', () => {
      const data = {
        data: [{ id: 1 }],
        count: 25,
        page_size: 5,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result).toEqual({
        data: [{ id: 1 }],
        pagination: {
          page: 1,
          limit: 5,
          total: 25,
          pages: 5,
          hasNext: false,
          hasPrevious: false,
        },
      });
    });

    it('handles empty response with no results or data', () => {
      const data = {};

      const result = service.testTransformPaginatedResponse(data);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          pages: NaN,
          hasNext: false,
          hasPrevious: false,
        },
      });
    });

    it('handles null data gracefully', () => {
      const result = service.testTransformPaginatedResponse(null);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          pages: NaN,
          hasNext: false,
          hasPrevious: false,
        },
      });
    });

    it('handles undefined data gracefully', () => {
      const result = service.testTransformPaginatedResponse(undefined);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          pages: NaN,
          hasNext: false,
          hasPrevious: false,
        },
      });
    });

    it('defaults page to 1 when current_page is missing', () => {
      const data = {
        results: [],
        count: 0,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result.pagination.page).toBe(1);
    });

    it('calculates pages correctly with zero count', () => {
      const data = {
        results: [],
        count: 0,
        page_size: 10,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result.pagination.pages).toBe(1);
    });

    it('calculates pages correctly with fractional division', () => {
      const data = {
        results: [],
        count: 25,
        page_size: 10,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result.pagination.pages).toBe(3);
    });

    it('uses results.length as page_size fallback when page_size missing', () => {
      const data = {
        results: [{ id: 1 }, { id: 2 }, { id: 3 }],
        count: 30,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result.pagination.limit).toBe(3);
      expect(result.pagination.pages).toBe(10);
    });

    it('uses results.length (0) as page_size fallback when page_size and results are missing', () => {
      const data = {
        count: 50,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result.pagination.limit).toBe(0);
      expect(result.pagination.pages).toBe(Infinity);
    });

    it('sets hasNext to false when next is falsy', () => {
      const data = {
        results: [],
        count: 0,
        next: null,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result.pagination.hasNext).toBe(false);
    });

    it('sets hasPrevious to false when previous is falsy', () => {
      const data = {
        results: [],
        count: 0,
        previous: null,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result.pagination.hasPrevious).toBe(false);
    });

    it('prefers results over data when both exist', () => {
      const data = {
        results: [{ id: 'from-results' }],
        data: [{ id: 'from-data' }],
        count: 1,
      };

      const result = service.testTransformPaginatedResponse(data);

      expect(result.data).toEqual([{ id: 'from-results' }]);
    });
  });

  describe('HTTP method wrappers', () => {
    const mockResponse = {
      data: { id: 1 },
      success: true,
      statusCode: 200,
    };

    beforeEach(() => {
      (apiClient.request as jest.Mock).mockResolvedValue(mockResponse);
    });

    describe('get', () => {
      it('calls apiClient.request with GET method', async () => {
        await service.testGet('/api/test');

        expect(apiClient.request).toHaveBeenCalledTimes(1);
        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/api/test',
          data: undefined,
          params: undefined,
          headers: {},
          timeout: undefined,
        });
      });

      it('passes params to apiClient.request', async () => {
        await service.testGet('/api/test', { page: 1, limit: 10 });

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/api/test',
          data: undefined,
          params: { page: 1, limit: 10 },
          headers: {},
          timeout: undefined,
        });
      });

      it('passes Accept-Language header when language option is provided', async () => {
        await service.testGet('/api/test', undefined, { language: 'fr' });

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/api/test',
          data: undefined,
          params: undefined,
          headers: { 'Accept-Language': 'fr' },
          timeout: undefined,
        });
      });

      it('passes timeout to apiClient.request', async () => {
        await service.testGet('/api/test', undefined, { timeout: 5000 });

        expect(apiClient.request).toHaveBeenCalledWith(
          expect.objectContaining({ timeout: 5000 }),
        );
      });

      it('returns the response from apiClient.request', async () => {
        const result = await service.testGet('/api/test');

        expect(result).toEqual(mockResponse);
      });
    });

    describe('post', () => {
      it('calls apiClient.request with POST method and data', async () => {
        const postData = { name: 'test' };
        await service.testPost('/api/test', postData);

        expect(apiClient.request).toHaveBeenCalledTimes(1);
        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/test',
          data: postData,
          params: undefined,
          headers: {},
          timeout: undefined,
        });
      });

      it('calls apiClient.request with POST method without data', async () => {
        await service.testPost('/api/test');

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/test',
          data: undefined,
          params: undefined,
          headers: {},
          timeout: undefined,
        });
      });

      it('passes language option as Accept-Language header', async () => {
        await service.testPost('/api/test', { key: 'val' }, { language: 'en' });

        expect(apiClient.request).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: { 'Accept-Language': 'en' },
          }),
        );
      });
    });

    describe('put', () => {
      it('calls apiClient.request with PUT method and data', async () => {
        const putData = { id: 1, name: 'updated' };
        await service.testPut('/api/test/1', putData);

        expect(apiClient.request).toHaveBeenCalledTimes(1);
        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'PUT',
          url: '/api/test/1',
          data: putData,
          params: undefined,
          headers: {},
          timeout: undefined,
        });
      });
    });

    describe('patch', () => {
      it('calls apiClient.request with PATCH method and data', async () => {
        const patchData = { name: 'patched' };
        await service.testPatch('/api/test/1', patchData);

        expect(apiClient.request).toHaveBeenCalledTimes(1);
        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'PATCH',
          url: '/api/test/1',
          data: patchData,
          params: undefined,
          headers: {},
          timeout: undefined,
        });
      });
    });

    describe('delete', () => {
      it('calls apiClient.request with DELETE method', async () => {
        await service.testDelete('/api/test/1');

        expect(apiClient.request).toHaveBeenCalledTimes(1);
        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'DELETE',
          url: '/api/test/1',
          data: undefined,
          params: undefined,
          headers: {},
          timeout: undefined,
        });
      });

      it('passes options to apiClient.request', async () => {
        await service.testDelete('/api/test/1', { timeout: 10000 });

        expect(apiClient.request).toHaveBeenCalledWith(
          expect.objectContaining({ timeout: 10000 }),
        );
      });
    });

    describe('error handling', () => {
      it('throws error when throwOnError is true (default)', async () => {
        const error = new Error('Network error');
        (apiClient.request as jest.Mock).mockRejectedValue(error);

        await expect(service.testGet('/api/test')).rejects.toThrow(
          'Network error',
        );
      });

      it('returns error response when throwOnError is false', async () => {
        const apiError = new Error('Not found') as any;
        apiError.statusCode = 404;
        (apiClient.request as jest.Mock).mockRejectedValue(apiError);

        const result = await service.testGet('/api/test', undefined, {
          throwOnError: false,
        });

        expect(result).toEqual({
          data: null,
          success: false,
          message: 'Not found',
          statusCode: 404,
        });
      });

      it('defaults to statusCode 500 when error has no statusCode', async () => {
        const apiError = new Error('Unknown error');
        (apiClient.request as jest.Mock).mockRejectedValue(apiError);

        const result = await service.testGet('/api/test', undefined, {
          throwOnError: false,
        });

        expect(result.statusCode).toBe(500);
      });
    });
  });
});
