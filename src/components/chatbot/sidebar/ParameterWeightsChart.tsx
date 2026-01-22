/**
 * ParameterWeightsChart Component
 *
 * A donut chart visualization showing parameter weight distribution.
 * Uses SVG for rendering without external charting libraries.
 */

interface ParameterWeight {
  id: string;
  name: string;
  weight: number; // 0-1 (e.g., 0.35 = 35%)
  color: string;
}

interface ParameterWeightsChartProps {
  parameters: ParameterWeight[];
  size?: number; // Chart size in pixels
  strokeWidth?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

// Default colors for parameters
export const PARAMETER_COLORS: Record<string, string> = {
  unit_price: "#3B82F6", // blue-500
  payment_terms: "#8B5CF6", // violet-500
  delivery_date: "#10B981", // emerald-500
  warranty_period: "#F59E0B", // amber-500
  quality_standards: "#EC4899", // pink-500
  late_delivery_penalty: "#EF4444", // red-500
  custom: "#6B7280", // gray-500
};

// Get color for a parameter
export function getParameterColor(parameterId: string): string {
  return PARAMETER_COLORS[parameterId] || PARAMETER_COLORS.custom;
}

/**
 * Calculate SVG arc path for a donut segment
 */
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export default function ParameterWeightsChart({
  parameters,
  size = 160,
  strokeWidth = 24,
  showLegend = true,
  centerLabel,
  centerValue,
}: ParameterWeightsChartProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Calculate total weight for normalization
  const totalWeight = parameters.reduce((sum, p) => sum + p.weight, 0);

  // Calculate arcs for each parameter
  let currentAngle = 0;
  const arcs = parameters.map((param) => {
    const normalizedWeight = totalWeight > 0 ? param.weight / totalWeight : 0;
    const angle = normalizedWeight * 360;
    const arc = {
      ...param,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      percentage: normalizedWeight * 100,
    };
    currentAngle += angle;
    return arc;
  });

  // Filter out arcs with zero weight
  const visibleArcs = arcs.filter((arc) => arc.percentage > 0.5);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Donut Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />

          {/* Parameter arcs */}
          {visibleArcs.map((arc) => (
            <path
              key={arc.id}
              d={describeArc(center, center, radius, arc.startAngle, arc.endAngle)}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              className="transition-all duration-500"
              style={{
                filter: `drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))`,
              }}
            >
              <title>
                {arc.name}: {arc.percentage.toFixed(0)}%
              </title>
            </path>
          ))}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-2xl font-bold text-gray-900">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-gray-500">{centerLabel}</span>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
          {visibleArcs.map((arc) => (
            <div key={arc.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: arc.color }}
              />
              <span className="text-xs text-gray-700 truncate">{arc.name}</span>
              <span className="text-xs font-bold text-gray-900 ml-auto">
                {arc.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of the donut chart for inline use
 */
export function CompactWeightsChart({
  parameters,
  size = 48,
  strokeWidth = 8,
}: Omit<ParameterWeightsChartProps, "showLegend" | "centerLabel" | "centerValue">) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  const totalWeight = parameters.reduce((sum, p) => sum + p.weight, 0);
  let currentAngle = 0;

  const arcs = parameters
    .map((param) => {
      const normalizedWeight = totalWeight > 0 ? param.weight / totalWeight : 0;
      const angle = normalizedWeight * 360;
      const arc = {
        ...param,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      };
      currentAngle += angle;
      return arc;
    })
    .filter((arc) => arc.endAngle - arc.startAngle > 1);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
      />
      {arcs.map((arc) => (
        <path
          key={arc.id}
          d={describeArc(center, center, radius, arc.startAngle, arc.endAngle)}
          fill="none"
          stroke={arc.color}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}
