import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import type { SpendCategory } from '../../types/dashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface SpendByCategoryChartProps {
  categories: SpendCategory[] | undefined;
}

const SpendByCategoryChart = ({ categories }: SpendByCategoryChartProps) => {
  const { isDark } = useTheme();

  if (!categories || categories.length === 0) return null;

  const sorted = [...categories].sort((a, b) => b.amount - a.amount);

  const data = {
    labels: sorted.map((c) => c.category),
    datasets: [
      {
        data: sorted.map((c) => c.amount),
        backgroundColor: isDark
          ? ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE']
          : ['#234BF3', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
        borderRadius: 4,
        barThickness: 22,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.raw as number;
            const pct = sorted[ctx.dataIndex]?.percentage ?? 0;
            if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M (${pct}%)`;
            if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k (${pct}%)`;
            return `$${val} (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
        ticks: {
          color: isDark ? '#a0aec0' : '#6B7280',
          font: { size: 11 },
          callback: (val: any) => {
            if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`;
            if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
            return `$${val}`;
          },
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#e2e8f0' : '#374151',
          font: { size: 12 },
        },
      },
    },
  };

  const height = Math.max(180, sorted.length * 40);

  return (
    <div className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-4">
        Spend by Category
      </h3>
      <div style={{ height }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default SpendByCategoryChart;
