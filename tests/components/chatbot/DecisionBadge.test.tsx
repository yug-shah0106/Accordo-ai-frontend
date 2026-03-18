/**
 * DecisionBadge Component Tests
 *
 * Tests rendering, icons, colors, and labels for all 7 DecisionAction types,
 * including the new REDIRECT and ERROR_RECOVERY variants.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DecisionBadge from '../../../src/components/chatbot/chat/DecisionBadge';
import type { Decision } from '../../../src/types/chatbot';

// Helper to create a Decision object
const makeDecision = (action: string, utilityScore?: number): Decision => ({
  action: action as Decision['action'],
  reasons: ['test'],
  utilityScore: utilityScore ?? undefined,
});

describe('DecisionBadge', () => {
  describe('Null / empty handling', () => {
    it('should render nothing when decision is null', () => {
      const { container } = render(<DecisionBadge decision={null} />);
      expect(container.innerHTML).toBe('');
    });

    it('should render nothing when decision has no action', () => {
      const { container } = render(
        <DecisionBadge decision={{ action: '' as any, reasons: [] }} />
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Existing actions', () => {
    it('should render ACCEPT badge with green styling', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('ACCEPT')} />
      );
      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('Accept')).toBeInTheDocument();
    });

    it('should render COUNTER badge with blue styling', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('COUNTER')} />
      );
      const badge = container.querySelector('.bg-blue-100');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('Counter')).toBeInTheDocument();
    });

    it('should render WALK_AWAY badge with red styling', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('WALK_AWAY')} />
      );
      const badge = container.querySelector('.bg-red-100');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('Walk Away')).toBeInTheDocument();
    });

    it('should render ESCALATE badge with orange styling', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('ESCALATE')} />
      );
      const badge = container.querySelector('.bg-orange-100');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('Escalate')).toBeInTheDocument();
    });

    it('should render ASK_CLARIFY badge with yellow styling', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('ASK_CLARIFY')} />
      );
      const badge = container.querySelector('.bg-yellow-100');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('Ask Clarify')).toBeInTheDocument();
    });
  });

  describe('New REDIRECT action', () => {
    it('should render REDIRECT badge with purple styling', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('REDIRECT')} />
      );
      const badge = container.querySelector('.bg-purple-100');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-purple-700');
      expect(badge).toHaveClass('border-purple-300');
    });

    it('should display "Redirected" label for REDIRECT', () => {
      render(<DecisionBadge decision={makeDecision('REDIRECT')} />);
      expect(screen.getByText('Redirected')).toBeInTheDocument();
    });

    it('should render RedirectIcon SVG for REDIRECT', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('REDIRECT')} />
      );
      const svg = container.querySelector('.bg-purple-100 svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-3', 'h-3');
    });
  });

  describe('New ERROR_RECOVERY action', () => {
    it('should render ERROR_RECOVERY badge with amber styling', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('ERROR_RECOVERY')} />
      );
      const badge = container.querySelector('.bg-amber-100');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-amber-700');
      expect(badge).toHaveClass('border-amber-300');
    });

    it('should display "Recovery" label for ERROR_RECOVERY', () => {
      render(<DecisionBadge decision={makeDecision('ERROR_RECOVERY')} />);
      expect(screen.getByText('Recovery')).toBeInTheDocument();
    });

    it('should render RecoveryIcon SVG for ERROR_RECOVERY', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('ERROR_RECOVERY')} />
      );
      const svg = container.querySelector('.bg-amber-100 svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-3', 'h-3');
    });
  });

  describe('Utility score display', () => {
    it('should display utility percentage when score is provided', () => {
      render(<DecisionBadge decision={makeDecision('REDIRECT', 0.75)} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should not display utility badge when score is null', () => {
      render(<DecisionBadge decision={makeDecision('ERROR_RECOVERY')} />);
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });

    it('should display utility with ACCEPT action', () => {
      render(<DecisionBadge decision={makeDecision('ACCEPT', 0.92)} />);
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });

  describe('Unknown action fallback', () => {
    it('should render gray badge for unknown actions', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('UNKNOWN_ACTION')} />
      );
      const badge = container.querySelector('.bg-gray-100');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('UNKNOWN ACTION')).toBeInTheDocument();
    });

    it('should replace underscores with spaces for unknown actions', () => {
      render(<DecisionBadge decision={makeDecision('SOME_NEW_ACTION')} />);
      expect(screen.getByText('SOME NEW ACTION')).toBeInTheDocument();
    });
  });

  describe('Badge structure', () => {
    it('should render badge with correct CSS classes', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('COUNTER')} />
      );
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded', 'text-xs', 'font-semibold');
    });

    it('should wrap badges in a flex container', () => {
      const { container } = render(
        <DecisionBadge decision={makeDecision('ACCEPT', 0.8)} />
      );
      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass('flex', 'flex-wrap', 'gap-2');
    });
  });
});
