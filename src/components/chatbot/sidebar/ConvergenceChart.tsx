/**
 * ConvergenceChart - Price convergence visualization
 *
 * Shows vendor offers and PM counters converging over rounds.
 * Uses Chart.js (existing dependency) for line chart rendering.
 */

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RoundData {
  round: number;
  vendorPrice: number | null;
  pmCounter: number | null;
  gap: number | null;
  utility: number | null;
}

interface ConvergenceChartProps {
  roundHistory: RoundData[];
  isConverging: boolean;
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({
  roundHistory,
  isConverging,
}) => {
  const chartData = useMemo(() => {
    const labels = roundHistory.map((r) => `R${r.round}`);
    const vendorPrices = roundHistory.map((r) => r.vendorPrice);
    const pmCounters = roundHistory.map((r) => r.pmCounter);

    return {
      labels,
      datasets: [
        {
          label: 'Vendor Offer',
          data: vendorPrices,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#ef4444',
          tension: 0.3,
          fill: false,
        },
        {
          label: 'PM Counter',
          data: pmCounters,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6',
          tension: 0.3,
          fill: '-1',
        },
      ],
    };
  }, [roundHistory]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            boxWidth: 8,
            padding: 8,
            font: { size: 10 },
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const val = ctx.parsed.y;
              return val != null ? `${ctx.dataset.label}: $${val.toLocaleString()}` : '';
            },
          },
        },
        filler: {
          propagate: true,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { size: 10 },
            callback: (val: any) => `$${Number(val).toLocaleString()}`,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
    }),
    []
  );

  if (roundHistory.length < 2) {
    return (
      <div className="text-xs text-gray-500 dark:text-dark-text-secondary text-center py-3">
        Chart available after 2+ rounds
      </div>
    );
  }

  return (
    <div>
      <div className="h-36">
        <Line data={chartData} options={options} />
      </div>
      <div className="text-center mt-1">
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            isConverging
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {isConverging ? 'Converging' : 'Not Converging'}
        </span>
      </div>
    </div>
  );
};

export default ConvergenceChart;
