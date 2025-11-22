import { useState, useEffect } from "react";
import { authApi } from "../api";

const useFetchData = (url, options = {}, key = "data") => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authApi.get(url, options);

        const result = response.data[key];

        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options, key]);

  return { data, loading, error };
};

export default useFetchData;
