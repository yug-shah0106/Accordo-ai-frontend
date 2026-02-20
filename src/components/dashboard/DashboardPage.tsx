import { AlertCircle, RefreshCw } from 'lucide-react';
import OnboardingReminder from '../OnboardingReminder';
import DashboardHeader from './DashboardHeader';
import KpiCards from './KpiCards';
import NegotiationPipelineChart from './NegotiationPipelineChart';
import SavingsOverTimeChart from './SavingsOverTimeChart';
import SpendByCategoryChart from './SpendByCategoryChart';
import ActivityFeed from './ActivityFeed';
import NeedsAttentionSection from './NeedsAttentionSection';
import FloatingActionButton from './FloatingActionButton';
import DashboardSkeleton from './DashboardSkeleton';
import { useDashboardStats } from '../../hooks/dashboard';

const DashboardPage = () => {
  const { data, period, loading, error, setPeriod, refresh } = useDashboardStats('30d');

  return (
    <div className="flex flex-col min-h-full">
      <OnboardingReminder className="rounded-t-lg" />
      <DashboardHeader period={period} onPeriodChange={setPeriod} />

      <div className="flex-1 px-6 py-6">
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400 flex-1">{error}</p>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {loading && !data ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <KpiCards kpis={data?.kpis} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <NegotiationPipelineChart pipeline={data?.negotiationPipeline} />
              <SavingsOverTimeChart timeline={data?.savingsOverTime} />
              <SpendByCategoryChart categories={data?.spendByCategory} />
              <ActivityFeed activities={data?.recentActivity} />
            </div>

            <NeedsAttentionSection attention={data?.needsAttention} />
          </div>
        )}
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default DashboardPage;
