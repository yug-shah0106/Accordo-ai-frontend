import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { TrendingUp, Calendar, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { SavingsTimeline } from '../../types/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

interface SavingsOverTimeChartProps {
  timeline: SavingsTimeline | undefined;
}

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
  return `$${val.toLocaleString()}`;
};

const formatCurrencyCompact = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val}`;
};

const SavingsOverTimeChart = ({ timeline }: SavingsOverTimeChartProps) => {
  const { isDark } = useTheme();

  if (!timeline) return null;

  const hasData = timeline.data.some((v) => v > 0);
  const hasPrevData = timeline.previousPeriodCumulative.some((v) => v > 0);

  if (!hasData && !hasPrevData) {
    return (
      <div className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-4">
          Savings Over Time
        </h3>
        <div className="h-72 flex items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-dark-text-secondary">
            No savings data for this period
          </p>
        </div>
      </div>
    );
  }

  const { summary } = timeline;

  // ---- Chart data: bars (per-bucket) + line (cumulative) + dashed line (prev period) ----
  const chartData = {
    labels: timeline.labels,
    datasets: [
      // Per-bucket savings bars
      {
        type: 'bar' as const,
        label: 'Period Savings',
        data: timeline.data,
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(35, 75, 243, 0.18)',
        hoverBackgroundColor: isDark ? 'rgba(99, 102, 241, 0.55)' : 'rgba(35, 75, 243, 0.35)',
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        yAxisID: 'yBar',
        order: 2,
      },
      // Cumulative line
      {
        type: 'line' as const,
        label: 'Cumulative Savings',
        data: timeline.cumulative,
        borderColor: '#234BF3',
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(35, 75, 243, 0.05)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, isDark ? 'rgba(35, 75, 243, 0.18)' : 'rgba(35, 75, 243, 0.10)');
          gradient.addColorStop(1, 'rgba(35, 75, 243, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: timeline.cumulative.length <= 10 ? 3 : 0,
        pointHoverRadius: 5,
        pointBackgroundColor: '#234BF3',
        pointBorderColor: isDark ? '#1a1f2e' : '#ffffff',
        pointBorderWidth: 2,
        yAxisID: 'yLine',
        order: 1,
      },
      // Previous period comparison (dashed)
      ...(hasPrevData
        ? [
            {
              type: 'line' as const,
              label: 'Previous Period',
              data: timeline.previousPeriodCumulative,
              borderColor: isDark ? '#4a5568' : '#CBD5E1',
              borderDash: [6, 4],
              backgroundColor: 'transparent',
              fill: false,
              tension: 0.35,
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointBackgroundColor: isDark ? '#4a5568' : '#CBD5E1',
              yAxisID: 'yLine',
              order: 0,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          color: isDark ? '#94a3b8' : '#64748B',
          font: { size: 11, family: 'Inter, system-ui, sans-serif' },
          padding: 16,
          filter: (item: any) => item.text !== 'Period Savings' || hasData,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#0f172a',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 11 },
        borderColor: isDark ? '#334155' : '#1e293b',
        borderWidth: 1,
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.raw as number;
            return ` ${ctx.dataset.label}: ${formatCurrency(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: timeline.labels.length <= 10 ? timeline.labels.length : 10,
        },
        border: { display: false },
      },
      // Left axis for cumulative line
      yLine: {
        type: 'linear' as const,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
        border: { display: false },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { size: 10 },
          padding: 8,
          callback: (val: any) => formatCurrencyCompact(val),
          maxTicksLimit: 5,
        },
      },
      // Right axis for per-bucket bars (hidden axis, shares scale feel)
      yBar: {
        type: 'linear' as const,
        position: 'right' as const,
        beginAtZero: true,
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: isDark ? '#475569' : '#cbd5e1',
          font: { size: 10 },
          padding: 8,
          callback: (val: any) => formatCurrencyCompact(val),
          maxTicksLimit: 4,
        },
      },
    },
  };

  return (
    <div className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text">
          Savings Over Time
        </h3>
      </div>

      {/* Summary callouts */}
      {hasData && (
        <div className="flex items-center gap-5 mb-4 mt-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Total</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-dark-text">
              {formatCurrency(summary.total)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Avg/period</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-dark-text">
              {formatCurrency(summary.avgPerBucket)}
            </span>
          </div>
          {summary.peakValue > 0 && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Best</span>
              <span className="text-xs font-semibold text-gray-800 dark:text-dark-text">
                {formatCurrency(summary.peakValue)}
              </span>
              <span className="text-xs text-gray-400 dark:text-dark-text-secondary">
                on {summary.peakLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SavingsOverTimeChart;
