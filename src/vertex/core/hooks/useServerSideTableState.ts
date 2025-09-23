import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SortingState } from "@/components/shared/table/ReusableTable";

interface UseServerSideTableStateProps {
  initialPageSize?: number;
}

export const useServerSideTableState = ({
  initialPageSize = 25,
}: UseServerSideTableStateProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPagination = useMemo(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("limit") || String(initialPageSize), 10);
    return {
      pageIndex: page > 0 ? page - 1 : 0,
      pageSize: pageSize > 0 ? pageSize : initialPageSize,
    };
  }, [searchParams, initialPageSize]);

  const initialSearchTerm = useMemo(() => searchParams.get("search") || "", [searchParams]);

  const initialSorting = useMemo((): SortingState => {
    const sortBy = searchParams.get("sortBy");
    const order = searchParams.get("order");
    if (sortBy) {
      return [{ id: sortBy, desc: order === "desc" }];
    }
    return [];
  }, [searchParams]);

  const [pagination, setPagination] = useState(initialPagination);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pagination.pageIndex + 1));
    params.set("limit", String(pagination.pageSize));
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");

    if (sorting.length > 0) {
      params.set("sortBy", sorting[0].id);
      params.set("order", sorting[0].desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("order");
    }

    if (params.toString() !== searchParams.toString()) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pagination, searchTerm, sorting, router, pathname, searchParams]);

  return { pagination, setPagination, searchTerm, setSearchTerm, sorting, setSorting };
};