/**
 * DecisionBadge Component
 * Displays decision action and metadata as badges
 */

import type { Decision } from '../../../types';

interface DecisionBadgeProps {
  decision: Decision | null;
  round?: number;
}

export default function DecisionBadge({ decision, round }: DecisionBadgeProps) {
  if (!decision) return null;

  const getActionClass = (action: string): string => {
    const normalized = action.toUpperCase();
    if (normalized === "ACCEPT") return "bg-green-100 text-green-700 border-green-300";
    if (normalized === "COUNTER") return "bg-blue-100 text-blue-700 border-blue-300";
    if (normalized === "WALK_AWAY") return "bg-red-100 text-red-700 border-red-300";
    if (normalized === "ESCALATE") return "bg-orange-100 text-orange-700 border-orange-300";
    if (normalized === "ASK_CLARIFY") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  const formatAction = (action: string): string => {
    return action.replace(/_/g, " ");
  };

  // Format utility as percentage for consistency
  const utilityPercent =
    decision.utilityScore !== null && decision.utilityScore !== undefined
      ? (decision.utilityScore * 100).toFixed(0)
      : null;

  return (
    <div className="flex flex-wrap gap-2">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${getActionClass(
          decision.action
        )}`}
      >
        {formatAction(decision.action)}
      </span>
      {utilityPercent !== null && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300">
          UTILITY {utilityPercent}%
        </span>
      )}
      {round !== undefined && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          ROUND {round}
        </span>
      )}
    </div>
  );
}
