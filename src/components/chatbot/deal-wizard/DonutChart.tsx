import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ParameterWeight } from "../../../types/chatbot";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  weights: ParameterWeight[];
  totalWeight: number;
  size?: number;
}

// Color palette for the donut chart segments
const CHART_COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#8B5CF6", // violet-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#06B6D4", // cyan-500
  "#EC4899", // pink-500
  "#84CC16", // lime-500
  "#F97316", // orange-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
  "#A855F7", // purple-500
];

/**
 * DonutChart Component
 * Displays parameter weights as a donut chart with total percentage in center
 */
export default function DonutChart({ weights, totalWeight, size = 200 }: DonutChartProps) {
  const isComplete = Math.abs(totalWeight - 100) < 0.01;

  // Filter out zero-weight parameters for cleaner visualization
  const activeWeights = weights.filter(w => w.weight > 0);

  // If no active weights, show empty state
  if (activeWeights.length === 0) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-600" />
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">0%</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">No weights set</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const data = {
    labels: activeWeights.map(w => w.parameterName),
    datasets: [
      {
        data: activeWeights.map(w => w.weight),
        backgroundColor: activeWeights.map((w, index) =>
          w.color || CHART_COLORS[index % CHART_COLORS.length]
        ),
        borderColor: "white",
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%", // Creates the donut hole
    plugins: {
      legend: {
        display: false, // We'll show legend separately or in tooltips
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Doughnut data={data} options={options} />

      {/* Center text showing total */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className={`text-3xl font-bold ${
          isComplete
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}>
          {Math.round(totalWeight)}%
        </p>
        <p className={`text-xs ${
          isComplete
            ? "text-green-600/70 dark:text-green-400/70"
            : "text-red-600/70 dark:text-red-400/70"
        }`}>
          {isComplete ? "Complete" : `Need ${Math.round(100 - totalWeight)}%`}
        </p>
      </div>
    </div>
  );
}

// Export the color palette for use in StepFour
export { CHART_COLORS };
