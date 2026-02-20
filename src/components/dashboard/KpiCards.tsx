import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardKpis, KpiMetric, KpiTrend } from '../../types/dashboard';

interface KpiCardsProps {
  kpis: DashboardKpis | undefined;
  loading: boolean;
}

const trendIcon = (trend: KpiTrend) => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

const trendColor = (trend: KpiTrend) => {
  if (trend === 'up') return 'text-emerald-600';
  if (trend === 'down') return 'text-red-600';
  return 'text-gray-500';
};

const formatValue = (key: string, value: number): string => {
  if (key === 'totalSavings') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
    return `$${value.toFixed(0)}`;
  }
  if (key === 'avgDealImprovement') return `${value.toFixed(1)}%`;
  return value.toString();
};

const formatDelta = (key: string, delta: number): string => {
  const sign = delta >= 0 ? '+' : '';
  if (key === 'activeNegotiations') return `${sign}${delta}`;
  return `${sign}${delta.toFixed(1)}%`;
};

const cards: { key: keyof DashboardKpis; label: string }[] = [
  { key: 'totalSavings', label: 'TOTAL SAVINGS' },
  { key: 'activeNegotiations', label: 'ACTIVE NEGOTIATIONS' },
  { key: 'totalRequisitions', label: 'TOTAL REQUISITIONS' },
  { key: 'avgDealImprovement', label: 'AVG DEAL IMPROVEMENT' },
];

const KpiCardSkeleton = () => (
  <div className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
    <div className="h-3 w-28 bg-gray-200 dark:bg-dark-border rounded animate-pulse mb-3" />
    <div className="h-8 w-20 bg-gray-200 dark:bg-dark-border rounded animate-pulse mb-3" />
    <div className="h-3 w-24 bg-gray-100 dark:bg-dark-border rounded animate-pulse" />
  </div>
);

const KpiCard = ({ label, metric, metricKey }: { label: string; metric: KpiMetric; metricKey: string }) => (
  <div className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-dark-text-secondary mb-1">
      {label}
    </p>
    <p className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">
      {formatValue(metricKey, metric.value)}
    </p>
    <div className="flex items-center gap-1.5">
      {trendIcon(metric.trend)}
      <span className={`text-sm font-medium ${trendColor(metric.trend)}`}>
        {formatDelta(metricKey, metric.delta)}
      </span>
      <span className="text-xs text-gray-400 dark:text-dark-text-secondary">vs last period</span>
    </div>
  </div>
);

const KpiCards = ({ kpis, loading }: KpiCardsProps) => {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <KpiCard key={c.key} label={c.label} metric={kpis[c.key]} metricKey={c.key} />
      ))}
    </div>
  );
};

export default KpiCards;
