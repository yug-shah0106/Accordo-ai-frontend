/**
 * DecisionBadge Component
 * Displays decision action and metadata as badges with icons
 */

import type { Decision } from '../../../types';
import { getActionColors } from '../../../constants/colors';

interface DecisionBadgeProps {
  decision: Decision | null;
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

const RedirectIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a2 2 0 012 2v4a1 1 0 11-2 0v-4H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const RecoveryIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

export default function DecisionBadge({ decision }: DecisionBadgeProps) {
  if (!decision || !decision.action) return null;

  const ACTION_ICONS: Record<string, React.ReactNode> = {
    ACCEPT: <CheckIcon />,
    COUNTER: <ArrowsIcon />,
    WALK_AWAY: <ExitIcon />,
    ESCALATE: <AlertIcon />,
    ASK_CLARIFY: <QuestionIcon />,
    REDIRECT: <RedirectIcon />,
    ERROR_RECOVERY: <RecoveryIcon />,
  };

  const getActionStyles = (action: string) => {
    const c = getActionColors(action);
    return {
      className: `${c.bg} ${c.text} ${c.border}`,
      icon: ACTION_ICONS[(action || '').toUpperCase()] || null,
      label: c.label !== 'Unknown' ? c.label : action.replace(/_/g, ' '),
    };
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
    </div>
  );
}
