/**
 * DecisionChips Component
 * Action chips for decision actions
 */

import { DecisionAction } from '../../types';
import { getActionColors } from '../../constants/colors';

interface DecisionChipsProps {
  decisions: DecisionAction[];
  onSelect?: (decision: DecisionAction) => void;
}

export default function DecisionChips({ decisions, onSelect }: DecisionChipsProps) {
  const getChipStyles = (decision: DecisionAction): string => {
    const baseStyles = 'inline-flex items-center px-4 pt-2 pb-0 rounded-full text-sm font-medium transition-all duration-200';
    const c = getActionColors(decision);
    return `${baseStyles} ${c.bg} ${c.text} ${c.hoverBg} border ${c.border}`;
  };

  const getDecisionIcon = (decision: DecisionAction): string => {
    switch (decision) {
      case 'ACCEPT':
        return '✓';
      case 'COUNTER':
        return '↔';
      case 'WALK_AWAY':
        return '×';
      case 'ESCALATE':
        return '⇧';
      case 'ASK_CLARIFY':
        return '?';
      case 'REDIRECT':
        return '↩';
      case 'ERROR_RECOVERY':
        return '🛡';
      default:
        return '•';
    }
  };

  const getDecisionLabel = (decision: DecisionAction): string => {
    return getActionColors(decision).label;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {decisions.map((decision) => (
        <button
          key={decision}
          onClick={() => onSelect?.(decision)}
          className={`${getChipStyles(decision)} ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!onSelect}
        >
          <span className="mr-2">{getDecisionIcon(decision)}</span>
          <span>{getDecisionLabel(decision)}</span>
        </button>
      ))}
    </div>
  );
}
