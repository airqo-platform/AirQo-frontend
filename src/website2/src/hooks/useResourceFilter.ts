import { useMemo, useState } from 'react';

import type { Resource } from '@/types/index';

export const useResourceFilter = (
  resources: Resource[],
  itemsPerPage: number,
) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredResources = useMemo(() => {
    if (selectedCategory === 'All') return resources;
    return resources.filter(
      (resource) =>
        resource.resource_category ===
        selectedCategory.toLowerCase().replace(' ', '_'),
    );
  }, [resources, selectedCategory]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  const paginatedResources = useMemo(
    () =>
      filteredResources.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [filteredResources, currentPage, itemsPerPage],
  );

  return {
    selectedCategory,
    setSelectedCategory,
    currentPage,
    setCurrentPage,
    filteredResources,
    paginatedResources,
    totalPages,
  };
};
