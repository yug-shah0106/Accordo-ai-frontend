import { useState, useEffect } from "react";
import { authApi } from "../api";
import { AxiosRequestConfig } from "axios";

// ============================================================================
// Types
// ============================================================================

interface UseFetchWholeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Hook
// ============================================================================

const useFetchWholeData = <T = any,>(
  url: string,
  options: AxiosRequestConfig = {},
  key: string = "data"
): UseFetchWholeDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await authApi.get<Record<string, T>>(url, options);

        const result = response.data[key];

        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key]);

  return { data, loading, error };
};

export default useFetchWholeData;
