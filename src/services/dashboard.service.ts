import { authApi } from '../api/index';
import type { DashboardPeriod, DashboardStatsResponse } from '../types/dashboard';

const DASHBOARD_BASE = '/dashboard';

export const dashboardService = {
  getStats: async (period: DashboardPeriod): Promise<DashboardStatsResponse> => {
    const res = await authApi.get<DashboardStatsResponse>(
      `${DASHBOARD_BASE}/stats`,
      { params: { period } }
    );
    return res.data;
  },
};

export default dashboardService;
