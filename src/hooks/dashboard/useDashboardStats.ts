import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { dashboardService } from '../../services/dashboard.service';
import type { DashboardPeriod, DashboardStatsData } from '../../types/dashboard';

export function useDashboardStats(initialPeriod: DashboardPeriod = '30d') {
  const [data, setData] = useState<DashboardStatsData | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchStats = useCallback(async (p: DashboardPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getStats(p);
      if (mountedRef.current) {
        setData(res.data);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        const message = err?.response?.data?.message || 'Failed to load dashboard data';
        setError(message);
        toast.error(message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchStats(period);
    return () => {
      mountedRef.current = false;
    };
  }, [period, fetchStats]);

  const refresh = useCallback(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  return { data, period, loading, error, setPeriod, refresh };
}
