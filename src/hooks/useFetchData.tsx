import { useState, useEffect } from "react";
import { authApi } from "../api/index";

// ============================================================================
// Types
// ============================================================================

interface AdditionalData {
  inactiveVendors: string | number;
  totalVendors: string | number;
}

interface ApiResponse<T> {
  data?: T[];
  total?: number;
  inactiveVendors?: string | number;
  totalVendors?: string | number;
}

interface UseFetchDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  filters: string | undefined;
  setFilters: (filters: string | undefined) => void;
  search: string;
  setSearch: (search: string) => void;
  totalDoc: number;
  setTotalDoc: (total: number) => void;
  additionalData: AdditionalData;
  refetch: () => Promise<void>;
}

interface AdditionalParams {
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// Hook
// ============================================================================

const useFetchData = <T = any,>(
  url: string,
  initialLimit: number = 10,
  initialTotalCount: number = 0,
  initialPage: number = 1,
  additionalParams: AdditionalParams = {}
): UseFetchDataReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [totalDoc, setTotalDoc] = useState<number>(initialTotalCount);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [filters, setFilters] = useState<string | undefined>();
  const [search, setSearch] = useState<string>("");
  const [additionalData, setAdditionalData] = useState<AdditionalData>({
    inactiveVendors: "",
    totalVendors: "",
  });

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (filters) {
        queryParams.filters = filters;
      }
      if (search) {
        queryParams.search = search;
      }

      // Add additional params
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      });

      const queryString = new URLSearchParams(queryParams).toString();
      const response = await authApi.get<ApiResponse<T>>(`${url}?${queryString}`);

      // Set total count based on the total number of items
      const total = response.data?.total || 0;
      setTotalDoc(total);
      setTotalCount(Math.ceil(total / limit));

      setAdditionalData({
        inactiveVendors: response.data?.inactiveVendors ?? "",
        totalVendors: response.data?.totalVendors ?? "",
      });

      setData(response.data?.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, page, limit, filters, search]);

  return {
    data,
    loading,
    error,
    totalCount,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    setFilters,
    search,
    setSearch,
    totalDoc,
    setTotalDoc,
    additionalData,
    refetch: fetchData,
  };
};

export default useFetchData;
