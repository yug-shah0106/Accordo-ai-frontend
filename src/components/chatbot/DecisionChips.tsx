/**
 * DecisionChips Component
 * Action chips for decision actions
 */

import { DecisionAction } from '../../types';

interface DecisionChipsProps {
  decisions: DecisionAction[];
  onSelect?: (decision: DecisionAction) => void;
}

export default function DecisionChips({ decisions, onSelect }: DecisionChipsProps) {
  const getChipStyles = (decision: DecisionAction): string => {
    const baseStyles = 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200';

    switch (decision) {
      case 'ACCEPT':
        return `${baseStyles} bg-green-100 text-green-800 hover:bg-green-200 border border-green-300`;
      case 'COUNTER':
        return `${baseStyles} bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300`;
      case 'WALK_AWAY':
        return `${baseStyles} bg-red-100 text-red-800 hover:bg-red-200 border border-red-300`;
      case 'ESCALATE':
        return `${baseStyles} bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300`;
      case 'ASK_CLARIFY':
        return `${baseStyles} bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300`;
    }
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
      default:
        return '•';
    }
  };

  const getDecisionLabel = (decision: DecisionAction): string => {
    return decision.replace(/_/g, ' ');
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
