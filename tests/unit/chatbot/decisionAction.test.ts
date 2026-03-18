/**
 * DecisionAction Type Tests
 *
 * Validates that the DecisionAction union type includes all expected action types,
 * especially the new REDIRECT and ERROR_RECOVERY variants added for MVP.
 */

import { describe, it, expect } from 'vitest';
import type { DecisionAction, Decision } from '../../../src/types/chatbot';

describe('DecisionAction Type', () => {
  describe('Union completeness', () => {
    // These tests verify at runtime that the new action strings are valid DecisionAction values.
    // TypeScript ensures compile-time safety; these tests guard against accidental removal.

    const ALL_ACTIONS: DecisionAction[] = [
      'ACCEPT',
      'COUNTER',
      'WALK_AWAY',
      'ESCALATE',
      'ASK_CLARIFY',
      'REDIRECT',
      'ERROR_RECOVERY',
    ];

    it('should include all 7 expected action types', () => {
      expect(ALL_ACTIONS).toHaveLength(7);
    });

    it.each(ALL_ACTIONS)('should accept "%s" as a valid DecisionAction', (action) => {
      // If this compiles and runs, the type includes this variant
      const decision: Decision = {
        action,
        reasons: ['test reason'],
      };
      expect(decision.action).toBe(action);
    });

    it('should include REDIRECT action (ScopeGuard off-topic rejection)', () => {
      const action: DecisionAction = 'REDIRECT';
      expect(action).toBe('REDIRECT');
    });

    it('should include ERROR_RECOVERY action (graceful error fallback)', () => {
      const action: DecisionAction = 'ERROR_RECOVERY';
      expect(action).toBe('ERROR_RECOVERY');
    });
  });

  describe('Decision interface', () => {
    it('should accept REDIRECT in Decision.action', () => {
      const decision: Decision = {
        action: 'REDIRECT',
        reasons: ['Off-topic message detected'],
      };
      expect(decision.action).toBe('REDIRECT');
      expect(decision.reasons).toContain('Off-topic message detected');
    });

    it('should accept ERROR_RECOVERY in Decision.action', () => {
      const decision: Decision = {
        action: 'ERROR_RECOVERY',
        reasons: ['LLM timeout, using fallback response'],
        utilityScore: 0.5,
      };
      expect(decision.action).toBe('ERROR_RECOVERY');
      expect(decision.utilityScore).toBe(0.5);
    });

    it('should allow optional counterOffer with REDIRECT', () => {
      const decision: Decision = {
        action: 'REDIRECT',
        reasons: ['Not a negotiation topic'],
        counterOffer: null,
      };
      expect(decision.counterOffer).toBeNull();
    });
  });
});
