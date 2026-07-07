import { act, renderHook } from '@testing-library/react';

import { useResourceFilter } from '../useResourceFilter';

const createResources = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    resource_title: `Resource ${i + 1}`,
    resource_category:
      i % 3 === 0
        ? 'technical_report'
        : i % 3 === 1
          ? 'toolkit'
          : 'research_publication',
    resource_file_url: `https://example.com/file${i + 1}.pdf`,
    created: '2024-01-01',
    modified: '2024-01-02',
    is_deleted: false,
    resource_link: null,
    resource_file: `file${i + 1}.pdf`,
    author_title: `Author ${i + 1}`,
    resource_authors: `Author ${i + 1}`,
    order: i + 1,
  }));

describe('useResourceFilter', () => {
  it('should return initial state with selectedCategory All and currentPage 1', () => {
    const resources = createResources(5);
    const { result } = renderHook(() => useResourceFilter(resources, 10));

    expect(result.current.selectedCategory).toBe('All');
    expect(result.current.currentPage).toBe(1);
  });

  it('should return all resources when category is All', () => {
    const resources = createResources(5);
    const { result } = renderHook(() => useResourceFilter(resources, 10));

    expect(result.current.filteredResources).toEqual(resources);
    expect(result.current.paginatedResources).toEqual(resources);
  });

  it('should filter resources by category', () => {
    const resources = createResources(6);
    const { result } = renderHook(() => useResourceFilter(resources, 10));

    act(() => {
      result.current.setSelectedCategory('Toolkit');
    });

    expect(result.current.selectedCategory).toBe('Toolkit');
    expect(
      result.current.filteredResources.every(
        (r) => r.resource_category === 'toolkit',
      ),
    ).toBe(true);
  });

  it('should filter resources by technical_report category', () => {
    const resources = createResources(6);
    const { result } = renderHook(() => useResourceFilter(resources, 10));

    act(() => {
      result.current.setSelectedCategory('Technical Report');
    });

    expect(result.current.filteredResources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resource_category: 'technical_report' }),
      ]),
    );
    expect(
      result.current.filteredResources.every(
        (r) => r.resource_category === 'technical_report',
      ),
    ).toBe(true);
  });

  it('should return empty filteredResources for non-existent category', () => {
    const resources = createResources(3);
    const { result } = renderHook(() => useResourceFilter(resources, 10));

    act(() => {
      result.current.setSelectedCategory('NonExistent');
    });

    expect(result.current.filteredResources).toEqual([]);
    expect(result.current.paginatedResources).toEqual([]);
  });

  it('should calculate totalPages correctly', () => {
    const resources = createResources(10);
    const { result } = renderHook(() => useResourceFilter(resources, 3));

    expect(result.current.totalPages).toBe(4);
  });

  it('should return totalPages as 0 when no resources match', () => {
    const resources = createResources(3);
    const { result } = renderHook(() => useResourceFilter(resources, 10));

    act(() => {
      result.current.setSelectedCategory('NonExistent');
    });

    expect(result.current.totalPages).toBe(0);
  });

  it('should paginate resources correctly', () => {
    const resources = createResources(10);
    const { result } = renderHook(() => useResourceFilter(resources, 3));

    expect(result.current.paginatedResources).toHaveLength(3);
    expect(result.current.paginatedResources[0].id).toBe(1);
    expect(result.current.paginatedResources[2].id).toBe(3);
  });

  it('should change page and return correct slice', () => {
    const resources = createResources(10);
    const { result } = renderHook(() => useResourceFilter(resources, 3));

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedResources).toHaveLength(3);
    expect(result.current.paginatedResources[0].id).toBe(4);
    expect(result.current.paginatedResources[2].id).toBe(6);
  });

  it('should return remaining items on last page', () => {
    const resources = createResources(10);
    const { result } = renderHook(() => useResourceFilter(resources, 3));

    act(() => {
      result.current.setCurrentPage(4);
    });

    expect(result.current.paginatedResources).toHaveLength(1);
    expect(result.current.paginatedResources[0].id).toBe(10);
  });

  it('should return empty array when page exceeds totalPages', () => {
    const resources = createResources(5);
    const { result } = renderHook(() => useResourceFilter(resources, 10));

    act(() => {
      result.current.setCurrentPage(5);
    });

    expect(result.current.paginatedResources).toEqual([]);
  });

  it('should keep currentPage when category changes', () => {
    const resources = createResources(20);
    const { result } = renderHook(() => useResourceFilter(resources, 5));

    act(() => {
      result.current.setCurrentPage(3);
    });
    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.setSelectedCategory('Toolkit');
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('should handle empty resources array', () => {
    const { result } = renderHook(() => useResourceFilter([], 10));

    expect(result.current.filteredResources).toEqual([]);
    expect(result.current.paginatedResources).toEqual([]);
    expect(result.current.totalPages).toBe(0);
  });

  it('should return paginated resources from filtered results after category change', () => {
    const resources = createResources(9);
    const { result } = renderHook(() => useResourceFilter(resources, 2));

    act(() => {
      result.current.setSelectedCategory('Toolkit');
    });

    const toolkitCount = resources.filter(
      (r) => r.resource_category === 'toolkit',
    ).length;

    expect(result.current.filteredResources).toHaveLength(toolkitCount);
    expect(result.current.totalPages).toBe(Math.ceil(toolkitCount / 2));
    expect(result.current.paginatedResources.length).toBeLessThanOrEqual(2);
  });
});
