import { normalizeListResponse } from '../listResponseNormalizer';

describe('normalizeListResponse', () => {
  it('normalizes a standard paginated response', () => {
    const response = {
      count: 25,
      next: 'https://api.example.com/items?page=2',
      previous: null,
      results: [{ id: 1 }, { id: 2 }],
    };
    const params = { page: 1, page_size: 10 };

    const result = normalizeListResponse(response, params);

    expect(result.count).toBe(25);
    expect(result.next).toBe('https://api.example.com/items?page=2');
    expect(result.previous).toBeNull();
    expect(result.results).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.page_size).toBe(10);
    expect(result.total_pages).toBe(3);
    expect(result.current_page).toBe(1);
  });

  it('defaults page to 1 when not provided', () => {
    const response = {
      count: 5,
      next: null,
      previous: null,
      results: [1, 2, 3],
    };
    const result = normalizeListResponse(response, {});

    expect(result.current_page).toBe(1);
  });

  it('uses results length as page_size when page_size is not provided', () => {
    const response = {
      count: 5,
      next: null,
      previous: null,
      results: [1, 2, 3],
    };
    const result = normalizeListResponse(response, {});

    expect(result.page_size).toBe(3);
  });

  it('defaults page_size to 10 when results are empty and no page_size given', () => {
    const response = { count: 0, next: null, previous: null, results: [] };
    const result = normalizeListResponse(response, {});

    expect(result.page_size).toBe(10);
  });

  it('defaults page_size to 10 when both results and page_size are missing', () => {
    const response = { count: 0, next: null, previous: null, results: [] };
    const result = normalizeListResponse(response, { page_size: 0 });

    expect(result.page_size).toBe(10);
  });

  it('handles empty results array', () => {
    const response = { count: 0, next: null, previous: null, results: [] };
    const result = normalizeListResponse(response, { page: 1, page_size: 10 });

    expect(result.count).toBe(0);
    expect(result.results).toEqual([]);
    expect(result.total_pages).toBe(1);
  });

  it('handles missing count field', () => {
    const response = { next: null, previous: null, results: [1] } as any;
    const result = normalizeListResponse(response, { page: 1, page_size: 10 });

    expect(result.count).toBe(0);
    expect(result.total_pages).toBe(1);
  });

  it('handles missing next and previous fields', () => {
    const response = { count: 1, results: [1] } as any;
    const result = normalizeListResponse(response, { page: 1, page_size: 10 });

    expect(result.next).toBeNull();
    expect(result.previous).toBeNull();
  });

  it('handles missing results field', () => {
    const response = { count: 5, next: null, previous: null } as any;
    const result = normalizeListResponse(response, { page: 1, page_size: 10 });

    expect(result.results).toEqual([]);
  });

  it('calculates total_pages correctly with exact division', () => {
    const response = { count: 20, next: null, previous: null, results: [] };
    const result = normalizeListResponse(response, { page: 1, page_size: 10 });

    expect(result.total_pages).toBe(2);
  });

  it('calculates total_pages correctly with remainder', () => {
    const response = { count: 21, next: null, previous: null, results: [] };
    const result = normalizeListResponse(response, { page: 1, page_size: 10 });

    expect(result.total_pages).toBe(3);
  });

  it('preserves generic type in results', () => {
    interface Item {
      id: number;
      name: string;
    }
    const response = {
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, name: 'test' }],
    };
    const result = normalizeListResponse<Item>(response, {
      page: 1,
      page_size: 10,
    });

    expect(result.results[0].id).toBe(1);
    expect(result.results[0].name).toBe('test');
  });

  it('handles null next and non-null previous', () => {
    const response = {
      count: 30,
      next: null,
      previous: 'https://api.example.com/items?page=1',
      results: [],
    };
    const result = normalizeListResponse(response, { page: 3, page_size: 10 });

    expect(result.previous).toBe('https://api.example.com/items?page=1');
    expect(result.next).toBeNull();
  });

  it('handles count of 0 with empty results', () => {
    const response = { count: 0, next: null, previous: null, results: [] };
    const result = normalizeListResponse(response, { page: 1, page_size: 10 });

    expect(result.total_pages).toBe(1);
    expect(result.current_page).toBe(1);
  });
});
