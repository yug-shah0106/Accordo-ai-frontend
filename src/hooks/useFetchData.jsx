import { useState, useEffect } from "react";
import { authApi } from "../api/index";

const useFetchData = (
  url,
  initialLimit = 10,
  initialTotalCount = 0,
  initialPage = 1,
  additionalParams = {}
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalDoc, setTotalDoc] = useState(initialTotalCount);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState();
  const [search, setSearch] = useState("");
  const [additionalData, setAdditionalData] = useState({inactiveVendors:"",totalVendors:""});

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters && { filters }),
        ...(search && { search }),
        ...(additionalParams && { ...additionalParams }),
      }).toString();

      const response = await authApi.get(`${url}?${queryParams}`);
      
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
