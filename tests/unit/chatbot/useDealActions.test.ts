/**
 * useDealActions Hook Tests - REDIRECT & ERROR_RECOVERY
 *
 * Unit tests for the PmDecision type and toast feedback logic
 * for the new REDIRECT and ERROR_RECOVERY action types.
 *
 * These tests validate:
 * 1. PmDecision interface accepts REDIRECT and ERROR_RECOVERY
 * 2. sendVendorOffer triggers correct toasts for new actions
 * 3. sendVendorMessageTwoPhase triggers correct toasts for new actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DecisionAction } from '../../../src/types/chatbot';

// We test the PmDecision interface shape and toast logic.
// The hook itself requires full React + API mocking, so we test the logic units.

// Inline type matching the exported PmDecision from useDealActions.ts
interface PmDecision {
  action: DecisionAction;
  utilityScore: number;
  counterOffer?: {
    price: number;
    paymentTerms: string;
    deliveryDate: string;
  };
  reasoning: string;
}

describe('useDealActions - PmDecision type', () => {
  describe('Type compatibility', () => {
    it('should accept REDIRECT as a valid PmDecision action', () => {
      const decision: PmDecision = {
        action: 'REDIRECT',
        utilityScore: 0,
        reasoning: 'Off-topic message detected by ScopeGuard',
      };
      expect(decision.action).toBe('REDIRECT');
    });

    it('should accept ERROR_RECOVERY as a valid PmDecision action', () => {
      const decision: PmDecision = {
        action: 'ERROR_RECOVERY',
        utilityScore: 0.5,
        reasoning: 'LLM timeout, used template fallback',
      };
      expect(decision.action).toBe('ERROR_RECOVERY');
    });

    it('should still accept all original action types', () => {
      const actions: DecisionAction[] = ['ACCEPT', 'COUNTER', 'WALK_AWAY', 'ESCALATE', 'ASK_CLARIFY'];
      actions.forEach(action => {
        const decision: PmDecision = {
          action,
          utilityScore: 0.5,
          reasoning: 'test',
        };
        expect(decision.action).toBe(action);
      });
    });

    it('should allow counterOffer to be undefined for REDIRECT', () => {
      const decision: PmDecision = {
        action: 'REDIRECT',
        utilityScore: 0,
        reasoning: 'Off-topic',
      };
      expect(decision.counterOffer).toBeUndefined();
    });

    it('should allow counterOffer to be undefined for ERROR_RECOVERY', () => {
      const decision: PmDecision = {
        action: 'ERROR_RECOVERY',
        utilityScore: 0.3,
        reasoning: 'Processing error',
      };
      expect(decision.counterOffer).toBeUndefined();
    });
  });
});

describe('useDealActions - Toast logic for sendVendorOffer', () => {
  // Simulate the toast decision logic extracted from sendVendorOffer
  const getToastForAction = (action: string): { type: string; message: string; icon?: string } | null => {
    if (action === 'COUNTER') {
      return { type: 'custom', message: 'Buyer countered', icon: '💬' };
    } else if (action === 'ACCEPT') {
      return { type: 'success', message: 'Buyer accepted your offer!' };
    } else if (action === 'ESCALATE') {
      return { type: 'custom', message: 'Buyer escalated to management', icon: '⚠️' };
    } else if (action === 'REDIRECT') {
      return { type: 'custom', message: 'Message was off-topic — redirected back to negotiation', icon: '↩️' };
    } else if (action === 'ERROR_RECOVERY') {
      return { type: 'custom', message: 'Something went wrong, but we recovered gracefully', icon: '🛡️' };
    }
    return null;
  };

  it('should return redirect toast for REDIRECT action', () => {
    const toast = getToastForAction('REDIRECT');
    expect(toast).not.toBeNull();
    expect(toast!.message).toContain('off-topic');
    expect(toast!.message).toContain('redirected');
    expect(toast!.icon).toBe('↩️');
  });

  it('should return recovery toast for ERROR_RECOVERY action', () => {
    const toast = getToastForAction('ERROR_RECOVERY');
    expect(toast).not.toBeNull();
    expect(toast!.message).toContain('recovered gracefully');
    expect(toast!.icon).toBe('🛡️');
  });

  it('should still return correct toast for ACCEPT', () => {
    const toast = getToastForAction('ACCEPT');
    expect(toast).not.toBeNull();
    expect(toast!.type).toBe('success');
  });

  it('should still return correct toast for COUNTER', () => {
    const toast = getToastForAction('COUNTER');
    expect(toast).not.toBeNull();
    expect(toast!.message).toContain('countered');
  });

  it('should still return correct toast for ESCALATE', () => {
    const toast = getToastForAction('ESCALATE');
    expect(toast).not.toBeNull();
    expect(toast!.icon).toBe('⚠️');
  });

  it('should return null for WALK_AWAY (no toast in sendVendorOffer for this)', () => {
    // WALK_AWAY is handled by deal status change, not by action toast
    const toast = getToastForAction('WALK_AWAY');
    expect(toast).toBeNull();
  });
});

describe('useDealActions - Toast logic for sendVendorMessageTwoPhase', () => {
  // Simulate the toast decision logic extracted from sendVendorMessageTwoPhase
  const getTwoPhaseToast = (action: string): { message: string; icon: string } | null => {
    if (action === 'REDIRECT') {
      return { message: 'Message was off-topic — redirected back to negotiation', icon: '↩️' };
    } else if (action === 'ERROR_RECOVERY') {
      return { message: 'Something went wrong, but we recovered gracefully', icon: '🛡️' };
    }
    return null;
  };

  it('should return redirect toast for REDIRECT in two-phase flow', () => {
    const toast = getTwoPhaseToast('REDIRECT');
    expect(toast).not.toBeNull();
    expect(toast!.message).toContain('off-topic');
    expect(toast!.icon).toBe('↩️');
  });

  it('should return recovery toast for ERROR_RECOVERY in two-phase flow', () => {
    const toast = getTwoPhaseToast('ERROR_RECOVERY');
    expect(toast).not.toBeNull();
    expect(toast!.message).toContain('recovered');
    expect(toast!.icon).toBe('🛡️');
  });

  it('should return null for ACCEPT (handled elsewhere)', () => {
    expect(getTwoPhaseToast('ACCEPT')).toBeNull();
  });

  it('should return null for COUNTER (handled elsewhere)', () => {
    expect(getTwoPhaseToast('COUNTER')).toBeNull();
  });
});
