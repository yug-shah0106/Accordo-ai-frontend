import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import type { NegotiationPipeline } from '../../types/dashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface NegotiationPipelineChartProps {
  pipeline: NegotiationPipeline | undefined;
}

const NegotiationPipelineChart = ({ pipeline }: NegotiationPipelineChartProps) => {
  const { isDark } = useTheme();

  if (!pipeline) return null;

  const labels = ['Negotiating', 'Accepted', 'Walked Away', 'Escalated'];
  const values = [pipeline.negotiating, pipeline.accepted, pipeline.walkedAway, pipeline.escalated];
  const colors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'];

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderRadius: 4,
        barThickness: 24,
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
          label: (ctx: any) => `${ctx.raw} deals`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: isDark ? '#a0aec0' : '#6B7280',
          stepSize: 1,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#e2e8f0' : '#374151',
          font: { size: 13 },
        },
      },
    },
  };

  return (
    <div className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-4">
        Negotiation Pipeline
      </h3>
      <div className="h-48">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default NegotiationPipelineChart;
