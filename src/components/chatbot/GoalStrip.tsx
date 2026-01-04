/**
 * GoalStrip Component
 * Show target vs current value comparison
 */

interface GoalStripProps {
  target: number;
  current: number;
  label: string;
}

export default function GoalStrip({ target, current, label }: GoalStripProps) {
  const difference = current - target;
  const percentageDiff = target !== 0 ? ((difference / target) * 100) : 0;
  const isOnTarget = Math.abs(percentageDiff) < 5; // Within 5% is considered on target
  const isBetter = difference <= 0; // Lower is better for prices

  const getStatusColor = (): string => {
    if (isOnTarget) return 'text-green-600';
    if (isBetter) return 'text-blue-600';
    return 'text-red-600';
  };

  const getStatusBg = (): string => {
    if (isOnTarget) return 'bg-green-50 border-green-200';
    if (isBetter) return 'bg-blue-50 border-blue-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (): string => {
    if (isOnTarget) return '✓';
    if (isBetter) return '↓';
    return '↑';
  };

  const getStatusText = (): string => {
    if (isOnTarget) return 'On Target';
    if (isBetter) return 'Better than Target';
    return 'Above Target';
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusBg()}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()} {getStatusText()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Target</p>
          <p className="text-lg font-bold text-gray-900">${target.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Current</p>
          <p className={`text-lg font-bold ${getStatusColor()}`}>
            ${current.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Visual comparison bar */}
      <div className="relative w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="absolute h-2 bg-gray-400 rounded-full"
          style={{ width: '50%', left: '0' }}
          title={`Target: $${target}`}
        />
        <div
          className={`absolute h-2 rounded-full ${
            isBetter ? 'bg-blue-500' : 'bg-red-500'
          }`}
          style={{
            width: `${Math.min(50, Math.abs((current / (target * 2)) * 100))}%`,
            left: isBetter ? '0' : '50%',
          }}
          title={`Current: $${current}`}
        />
      </div>

      {/* Difference indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Difference</span>
        <span className={`text-xs font-semibold ${getStatusColor()}`}>
          {difference > 0 ? '+' : ''}${difference.toFixed(2)} ({percentageDiff.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
