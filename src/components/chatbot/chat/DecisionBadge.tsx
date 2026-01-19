/**
 * DecisionBadge Component
 * Displays decision action and metadata as badges with icons
 */

import type { Decision } from '../../../types';

interface DecisionBadgeProps {
  decision: Decision | null;
  round?: number;
}

// Icon components for better visual distinction
const CheckIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ArrowsIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

const ExitIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

export default function DecisionBadge({ decision, round }: DecisionBadgeProps) {
  if (!decision || !decision.action) return null;

  const getActionStyles = (action: string): { className: string; icon: React.ReactNode; label: string } => {
    const normalized = (action || '').toUpperCase();
    switch (normalized) {
      case "ACCEPT":
        return {
          className: "bg-green-100 text-green-700 border-green-300",
          icon: <CheckIcon />,
          label: "Accept"
        };
      case "COUNTER":
        return {
          className: "bg-blue-100 text-blue-700 border-blue-300",
          icon: <ArrowsIcon />,
          label: "Counter"
        };
      case "WALK_AWAY":
        return {
          className: "bg-red-100 text-red-700 border-red-300",
          icon: <ExitIcon />,
          label: "Walk Away"
        };
      case "ESCALATE":
        return {
          className: "bg-orange-100 text-orange-700 border-orange-300",
          icon: <AlertIcon />,
          label: "Escalate"
        };
      case "ASK_CLARIFY":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-300",
          icon: <QuestionIcon />,
          label: "Ask Clarify"
        };
      default:
        return {
          className: "bg-gray-100 text-gray-700 border-gray-300",
          icon: null,
          label: action.replace(/_/g, " ")
        };
    }
  };

  const actionStyles = getActionStyles(decision.action);

  // Format utility as percentage for consistency
  const utilityPercent =
    decision.utilityScore !== null && decision.utilityScore !== undefined
      ? (decision.utilityScore * 100).toFixed(0)
      : null;

  return (
    <div className="flex flex-wrap gap-2">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${actionStyles.className}`}
      >
        {actionStyles.icon}
        {actionStyles.label}
      </span>
      {utilityPercent !== null && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300">
          <ChartIcon />
          {utilityPercent}%
        </span>
      )}
      {round !== undefined && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          <RefreshIcon />
          Round {round}
        </span>
      )}
    </div>
  );
}
