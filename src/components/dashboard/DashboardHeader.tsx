import type { DashboardPeriod } from '../../types/dashboard';

const periods: { label: string; value: DashboardPeriod }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: '1yr', value: '1y' },
  { label: 'All', value: 'all' },
];

interface DashboardHeaderProps {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
}

const DashboardHeader = ({ period, onPeriodChange }: DashboardHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border px-6 pt-6 pb-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-[Montserrat] text-gray-900 dark:text-dark-text">
          Dashboard
        </h1>
        <div className="flex items-center bg-gray-100 dark:bg-dark-bg rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === p.value
                  ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text shadow-sm'
                  : 'text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
