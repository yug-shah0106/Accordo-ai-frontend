/**
 * UtilityBar Component
 * Visual utility score bar with color-coded progress
 */

interface UtilityBarProps {
  score: number; // 0-1
  label: string;
  color?: string;
}

export default function UtilityBar({ score, label, color }: UtilityBarProps) {
  const percentage = Math.min(100, Math.max(0, score * 100));

  const getColor = (): string => {
    if (color) return color;
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.45) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (): string => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.45) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${getTextColor()}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>

      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        {/* Progress bar */}
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />

        {/* Accept threshold marker at 70% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-700 opacity-50"
          style={{ left: '70%' }}
          title="Accept threshold: 70%"
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">0%</span>
        <span className="text-xs text-gray-500">Accept: 70%</span>
        <span className="text-xs text-gray-500">100%</span>
      </div>
    </div>
  );
}
