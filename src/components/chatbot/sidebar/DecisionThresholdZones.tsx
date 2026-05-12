/**
 * DecisionThresholdZones Component
 *
 * Displays decision thresholds as a semicircular gauge/meter with:
 * - Walk Away (red, <30%)
 * - Escalate (orange, 30-50%)
 * - Counter (blue, 50-70%)
 * - Accept (green, >=70%)
 *
 * Shows current utility position with an animated needle indicator.
 */


import { Target } from 'lucide-react';
import { useMemo } from "react";
import { DECISION_ACTION_COLORS, GAUGE_ZONE_MAP, getActionColors } from "../../../constants/colors";

export interface DecisionThresholds {
  accept: number; // default 0.7
  escalate: number; // default 0.5
  walkAway: number; // default 0.3
}

export interface DecisionThresholdZonesProps {
  currentUtility: number; // 0-1 scale
  thresholds: DecisionThresholds;
}

interface ZoneConfig {
  id: string;
  label: string;
  color: string;
  startAngle: number;
  endAngle: number;
}

/**
 * Determine which zone the current utility falls into
 */
function getCurrentZone(
  utility: number,
  thresholds: DecisionThresholds
): string {
  if (utility >= thresholds.accept) return "accept";
  if (utility >= thresholds.escalate) return "counter";
  if (utility >= thresholds.walkAway) return "escalate";
  return "walk";
}

function getZoneInfo(zoneId: string): { label: string; textColor: string; bgColor: string } {
  const actionKey = GAUGE_ZONE_MAP[zoneId as keyof typeof GAUGE_ZONE_MAP];
  const c = actionKey ? DECISION_ACTION_COLORS[actionKey] : getActionColors('');
  return { label: c.label, textColor: c.text, bgColor: c.bg };
}

export default function DecisionThresholdZones({
  currentUtility,
  thresholds,
}: DecisionThresholdZonesProps) {
  const currentZone = getCurrentZone(currentUtility, thresholds);
  const currentPercent = currentUtility * 100;
  const zoneInfo = getZoneInfo(currentZone);

  // Calculate needle rotation (0% = -90deg, 100% = 90deg)
  const needleRotation = useMemo(() => {
    const clampedUtility = Math.min(1, Math.max(0, currentUtility));
    return -90 + clampedUtility * 180;
  }, [currentUtility]);

  // Build zone arc paths for SVG
  const zones: ZoneConfig[] = useMemo(() => {
    const walkAwayPercent = thresholds.walkAway;
    const escalatePercent = thresholds.escalate;
    const acceptPercent = thresholds.accept;

    return [
      {
        id: "walk",
        label: "Walk",
        color: DECISION_ACTION_COLORS.WALK_AWAY.svgHex,
        startAngle: -90,
        endAngle: -90 + walkAwayPercent * 180,
      },
      {
        id: "escalate",
        label: "Esc",
        color: DECISION_ACTION_COLORS.ESCALATE.svgHex,
        startAngle: -90 + walkAwayPercent * 180,
        endAngle: -90 + escalatePercent * 180,
      },
      {
        id: "counter",
        label: "Cnt",
        color: DECISION_ACTION_COLORS.COUNTER.svgHex,
        startAngle: -90 + escalatePercent * 180,
        endAngle: -90 + acceptPercent * 180,
      },
      {
        id: "accept",
        label: "Acc",
        color: DECISION_ACTION_COLORS.ACCEPT.svgHex,
        startAngle: -90 + acceptPercent * 180,
        endAngle: 90,
      },
    ];
  }, [thresholds]);

  // Create arc path for SVG
  const createArcPath = (startAngle: number, endAngle: number, radius: number, thickness: number) => {
    const innerRadius = radius - thickness;
    const outerRadius = radius;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1Outer = 50 + outerRadius * Math.cos(startRad);
    const y1Outer = 50 + outerRadius * Math.sin(startRad);
    const x2Outer = 50 + outerRadius * Math.cos(endRad);
    const y2Outer = 50 + outerRadius * Math.sin(endRad);

    const x1Inner = 50 + innerRadius * Math.cos(endRad);
    const y1Inner = 50 + innerRadius * Math.sin(endRad);
    const x2Inner = 50 + innerRadius * Math.cos(startRad);
    const y2Inner = 50 + innerRadius * Math.sin(startRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1Outer} ${y1Outer}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}
      L ${x1Inner} ${y1Inner}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x2Inner} ${y2Inner}
      Z
    `;
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg p-3 border border-gray-200 dark:border-dark-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        <span className="text-xs font-semibold text-gray-800 dark:text-dark-text">
          Decision Thresholds
        </span>
      </div>

      {/* Gauge - Compact */}
      <div className="relative flex justify-center">
        <svg
          viewBox="0 0 100 58"
          className="w-full max-w-[160px]"
          style={{ overflow: "visible" }}
        >
          {/* Zone arcs - centered at 50,50 with semicircle from -90 to 90 degrees */}
          {zones.map((zone) => (
            <path
              key={zone.id}
              d={createArcPath(zone.startAngle, zone.endAngle, 40, 10)}
              fill={zone.color}
              className={`transition-opacity duration-300 ${
                currentZone === zone.id ? "opacity-100" : "opacity-60"
              }`}
              stroke={currentZone === zone.id ? "#1F2937" : "white"}
              strokeWidth={currentZone === zone.id ? 1.5 : 0.5}
            />
          ))}

          {/* Threshold tick marks */}
          {[thresholds.walkAway, thresholds.escalate, thresholds.accept].map((threshold, i) => {
            const angle = -90 + threshold * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = 50 + 30 * Math.cos(rad);
            const y1 = 50 + 30 * Math.sin(rad);
            const x2 = 50 + 41 * Math.cos(rad);
            const y2 = 50 + 41 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.5"
              />
            );
          })}

          {/* Needle */}
          <g
            className="transition-transform duration-700 ease-out"
            style={{
              transform: `rotate(${needleRotation}deg)`,
              transformOrigin: "50px 50px",
            }}
          >
            {/* Needle body */}
            <path
              d="M 50 50 L 48.5 48 L 50 18 L 51.5 48 Z"
              fill="#1F2937"
              className="drop-shadow-sm"
            />
            {/* Needle center circle */}
            <circle cx="50" cy="50" r="3.5" fill="#1F2937" />
            <circle cx="50" cy="50" r="1.5" fill="white" />
          </g>

          {/* 0% and 100% labels - aligned with arc endpoints */}
          <text x="10" y="54" fontSize="7" fill="#6B7280" textAnchor="middle">
            0%
          </text>
          <text x="90" y="54" fontSize="7" fill="#6B7280" textAnchor="middle">
            100%
          </text>
        </svg>
      </div>

      {/* Current Value and Zone - Compact */}
      <div className="flex flex-col items-center -mt-2">
        <div className="text-xl font-bold text-gray-900 dark:text-dark-text">
          {currentPercent.toFixed(0)}%
        </div>
        <div
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${zoneInfo.bgColor} ${zoneInfo.textColor}`}
        >
          {zoneInfo.label}
        </div>
      </div>

      {/* Zone Legend - Inline compact */}
      <div className="flex justify-center gap-3 mt-2">
        {zones.map((zone) => {
          const info = getZoneInfo(zone.id);
          return (
            <div
              key={zone.id}
              className={`flex items-center gap-1 ${
                currentZone === zone.id ? "opacity-100" : "opacity-50"
              }`}
            >
              <div
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: zone.color }}
              />
              <span className={`text-[9px] ${info.textColor} font-medium`}>
                {zone.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact inline version for smaller spaces
 */
export function CompactThresholdZones({
  currentUtility,
  thresholds,
}: DecisionThresholdZonesProps) {
  const currentZone = getCurrentZone(currentUtility, thresholds);

  const zones = (['walk', 'escalate', 'counter', 'accept'] as const).map((id) => {
    const c = DECISION_ACTION_COLORS[GAUGE_ZONE_MAP[id]];
    return { id, label: id === 'walk' ? 'Walk' : id === 'escalate' ? 'Esc' : id === 'counter' ? 'Cnt' : 'Acc', bg: c.bg, text: c.text };
  });

  return (
    <div className="flex gap-1">
      {zones.map((zone) => (
        <span
          key={zone.id}
          className={`px-1.5 py-0.5 rounded text-xs ${zone.bg} ${zone.text} ${
            currentZone === zone.id
              ? "ring-2 ring-gray-800 font-bold"
              : "opacity-60"
          }`}
        >
          {zone.label}
        </span>
      ))}
    </div>
  );
}
