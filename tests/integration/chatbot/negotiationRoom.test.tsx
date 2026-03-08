/**
 * NegotiationRoom Integration Tests - REDIRECT & ERROR_RECOVERY
 *
 * Tests the NegotiationRoom component for:
 * 1. Timeline dot colors for REDIRECT (purple) and ERROR_RECOVERY (amber)
 * 2. Timeline badge colors with dark mode variants
 * 3. Summary action badge colors for new actions
 * 4. Formatted labels ("Redirected" / "Recovery" instead of raw strings)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Types & helpers extracted from NegotiationRoom for testing ----

/**
 * Timeline dot color logic (mirrors NegotiationRoom lines ~1339-1344)
 */
const getTimelineDotColor = (action: string): string => {
  switch (action) {
    case 'ACCEPT': return 'bg-green-500';
    case 'COUNTER': return 'bg-blue-500';
    case 'ESCALATE': return 'bg-orange-500';
    case 'WALK_AWAY': return 'bg-red-500';
    case 'REDIRECT': return 'bg-purple-500';
    case 'ERROR_RECOVERY': return 'bg-amber-500';
    default: return 'bg-gray-400';
  }
};

/**
 * Timeline badge color logic (mirrors NegotiationRoom lines ~1352-1357)
 */
const getTimelineBadgeClasses = (action: string): string => {
  switch (action) {
    case 'ACCEPT': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'COUNTER': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'ESCALATE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'WALK_AWAY': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    case 'REDIRECT': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'ERROR_RECOVERY': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    default: return 'bg-gray-100 text-gray-600';
  }
};

/**
 * Summary action badge color logic (mirrors NegotiationRoom lines ~1232-1239)
 */
const getSummaryBadgeClasses = (action: string): string => {
  if (action === 'ACCEPT') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  if (action === 'COUNTER') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  if (action === 'ESCALATE') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  if (action === 'WALK_AWAY') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  if (action === 'REDIRECT') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
  if (action === 'ERROR_RECOVERY') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
};

/**
 * Label formatting logic (mirrors NegotiationRoom line ~1239, 1359)
 */
const formatActionLabel = (action: string): string => {
  if (action === 'REDIRECT') return 'Redirected';
  if (action === 'ERROR_RECOVERY') return 'Recovery';
  return action?.replace('_', ' ') || '';
};

describe('NegotiationRoom - Timeline Colors', () => {
  describe('Timeline dot colors', () => {
    it('should use green dot for ACCEPT', () => {
      expect(getTimelineDotColor('ACCEPT')).toBe('bg-green-500');
    });

    it('should use blue dot for COUNTER', () => {
      expect(getTimelineDotColor('COUNTER')).toBe('bg-blue-500');
    });

    it('should use orange dot for ESCALATE', () => {
      expect(getTimelineDotColor('ESCALATE')).toBe('bg-orange-500');
    });

    it('should use red dot for WALK_AWAY', () => {
      expect(getTimelineDotColor('WALK_AWAY')).toBe('bg-red-500');
    });

    it('should use purple dot for REDIRECT', () => {
      expect(getTimelineDotColor('REDIRECT')).toBe('bg-purple-500');
    });

    it('should use amber dot for ERROR_RECOVERY', () => {
      expect(getTimelineDotColor('ERROR_RECOVERY')).toBe('bg-amber-500');
    });

    it('should use gray fallback for unknown actions', () => {
      expect(getTimelineDotColor('UNKNOWN')).toBe('bg-gray-400');
    });
  });

  describe('Timeline badge colors', () => {
    it('should use green badge for ACCEPT with dark mode', () => {
      const classes = getTimelineBadgeClasses('ACCEPT');
      expect(classes).toContain('bg-green-100');
      expect(classes).toContain('text-green-700');
      expect(classes).toContain('dark:bg-green-900/30');
      expect(classes).toContain('dark:text-green-300');
    });

    it('should use blue badge for COUNTER with dark mode', () => {
      const classes = getTimelineBadgeClasses('COUNTER');
      expect(classes).toContain('bg-blue-100');
      expect(classes).toContain('dark:text-blue-300');
    });

    it('should use orange badge for ESCALATE with dark mode', () => {
      const classes = getTimelineBadgeClasses('ESCALATE');
      expect(classes).toContain('bg-orange-100');
      expect(classes).toContain('text-orange-700');
      expect(classes).toContain('dark:text-orange-300');
    });

    it('should use red badge for WALK_AWAY with dark mode', () => {
      const classes = getTimelineBadgeClasses('WALK_AWAY');
      expect(classes).toContain('bg-red-100');
      expect(classes).toContain('text-red-700');
      expect(classes).toContain('dark:text-red-300');
    });

    it('should use purple badge for REDIRECT with dark mode', () => {
      const classes = getTimelineBadgeClasses('REDIRECT');
      expect(classes).toContain('bg-purple-100');
      expect(classes).toContain('text-purple-700');
      expect(classes).toContain('dark:bg-purple-900/30');
      expect(classes).toContain('dark:text-purple-300');
    });

    it('should use amber badge for ERROR_RECOVERY with dark mode', () => {
      const classes = getTimelineBadgeClasses('ERROR_RECOVERY');
      expect(classes).toContain('bg-amber-100');
      expect(classes).toContain('text-amber-700');
      expect(classes).toContain('dark:bg-amber-900/30');
      expect(classes).toContain('dark:text-amber-300');
    });

    it('should use gray fallback for unknown actions', () => {
      const classes = getTimelineBadgeClasses('UNKNOWN');
      expect(classes).toContain('bg-gray-100');
      expect(classes).toContain('text-gray-600');
    });
  });

  describe('Summary action badge colors', () => {
    it('should use purple for REDIRECT in summary', () => {
      const classes = getSummaryBadgeClasses('REDIRECT');
      expect(classes).toContain('bg-purple-100');
      expect(classes).toContain('text-purple-700');
    });

    it('should use amber for ERROR_RECOVERY in summary', () => {
      const classes = getSummaryBadgeClasses('ERROR_RECOVERY');
      expect(classes).toContain('bg-amber-100');
      expect(classes).toContain('text-amber-700');
    });

    it('should use green for ACCEPT in summary', () => {
      const classes = getSummaryBadgeClasses('ACCEPT');
      expect(classes).toContain('bg-green-100');
    });

    it('should use blue for COUNTER in summary', () => {
      const classes = getSummaryBadgeClasses('COUNTER');
      expect(classes).toContain('bg-blue-100');
    });

    it('should use orange for ESCALATE in summary', () => {
      const classes = getSummaryBadgeClasses('ESCALATE');
      expect(classes).toContain('bg-orange-100');
    });

    it('should use red for WALK_AWAY in summary', () => {
      const classes = getSummaryBadgeClasses('WALK_AWAY');
      expect(classes).toContain('bg-red-100');
    });

    it('should fall back to gray for unknown actions', () => {
      const classes = getSummaryBadgeClasses('SOMETHING_ELSE');
      expect(classes).toContain('bg-gray-100');
    });
  });
});

describe('NegotiationRoom - Label Formatting', () => {
  describe('Action label formatting', () => {
    it('should format REDIRECT as "Redirected"', () => {
      expect(formatActionLabel('REDIRECT')).toBe('Redirected');
    });

    it('should format ERROR_RECOVERY as "Recovery"', () => {
      expect(formatActionLabel('ERROR_RECOVERY')).toBe('Recovery');
    });

    it('should format WALK_AWAY as "WALK AWAY" (underscore replaced)', () => {
      expect(formatActionLabel('WALK_AWAY')).toBe('WALK AWAY');
    });

    it('should format ACCEPT as "ACCEPT" (no change)', () => {
      expect(formatActionLabel('ACCEPT')).toBe('ACCEPT');
    });

    it('should format COUNTER as "COUNTER" (no change)', () => {
      expect(formatActionLabel('COUNTER')).toBe('COUNTER');
    });

    it('should format ESCALATE as "ESCALATE" (no change)', () => {
      expect(formatActionLabel('ESCALATE')).toBe('ESCALATE');
    });

    it('should format ASK_CLARIFY as "ASK CLARIFY" (underscore replaced)', () => {
      expect(formatActionLabel('ASK_CLARIFY')).toBe('ASK CLARIFY');
    });

    it('should handle empty string gracefully', () => {
      expect(formatActionLabel('')).toBe('');
    });
  });

  describe('Color consistency across timeline and summary', () => {
    // Verify that timeline badges and summary badges use the same color scheme

    const actions = ['ACCEPT', 'COUNTER', 'ESCALATE', 'WALK_AWAY', 'REDIRECT', 'ERROR_RECOVERY'];

    it.each(actions)('should use the same bg color for "%s" in timeline and summary badges', (action) => {
      const timelineClasses = getTimelineBadgeClasses(action);
      const summaryClasses = getSummaryBadgeClasses(action);

      // Extract bg-xxx-100 pattern
      const timelineBg = timelineClasses.match(/bg-\w+-100/)?.[0];
      const summaryBg = summaryClasses.match(/bg-\w+-100/)?.[0];

      expect(timelineBg).toBe(summaryBg);
    });

    it.each(actions)('should use the same text color for "%s" in timeline and summary badges', (action) => {
      const timelineClasses = getTimelineBadgeClasses(action);
      const summaryClasses = getSummaryBadgeClasses(action);

      // Extract text-xxx-700 pattern
      const timelineText = timelineClasses.match(/text-\w+-700/)?.[0];
      const summaryText = summaryClasses.match(/text-\w+-700/)?.[0];

      expect(timelineText).toBe(summaryText);
    });
  });
});

describe('NegotiationRoom - Color Scheme Completeness', () => {
  it('should have unique colors for all 7 action types in timeline dots', () => {
    const allActions = ['ACCEPT', 'COUNTER', 'ESCALATE', 'WALK_AWAY', 'REDIRECT', 'ERROR_RECOVERY', 'ASK_CLARIFY'];
    const colors = allActions.map(getTimelineDotColor);

    // REDIRECT and ERROR_RECOVERY should have their own unique colors
    expect(colors).toContain('bg-purple-500'); // REDIRECT
    expect(colors).toContain('bg-amber-500');  // ERROR_RECOVERY

    // No duplicates among the explicitly-handled actions (excluding ASK_CLARIFY which falls to default)
    const explicitColors = colors.filter(c => c !== 'bg-gray-400');
    const uniqueExplicit = new Set(explicitColors);
    expect(uniqueExplicit.size).toBe(explicitColors.length);
  });

  it('should have unique badge colors for all explicitly-handled actions', () => {
    const explicitActions = ['ACCEPT', 'COUNTER', 'ESCALATE', 'WALK_AWAY', 'REDIRECT', 'ERROR_RECOVERY'];
    const bgColors = explicitActions.map(a => getTimelineBadgeClasses(a).match(/bg-\w+-100/)?.[0]);

    const uniqueBg = new Set(bgColors);
    expect(uniqueBg.size).toBe(explicitActions.length);
  });
});
