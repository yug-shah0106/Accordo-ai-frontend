/**
 * Centralized Color Constants
 *
 * Single source of truth for all semantic color mappings used across the app.
 * Components should import from here instead of defining colors inline.
 */

import type { DecisionAction, DealStatus } from '../types/chatbot';

// ============================================================================
// Decision Action Colors
// ============================================================================

export interface ActionColorConfig {
  bg: string;
  text: string;
  border: string;
  hoverBg: string;
  dot: string;
  darkBg: string;
  darkText: string;
  label: string;
  svgHex: string;
}

export const DECISION_ACTION_COLORS: Record<DecisionAction | 'DEFAULT', ActionColorConfig> = {
  ACCEPT:         { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  hoverBg: 'hover:bg-green-200',  dot: 'bg-green-500',  darkBg: 'dark:bg-green-900/30',  darkText: 'dark:text-green-300',  label: 'Accept',      svgHex: '#86EFAC' },
  COUNTER:        { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300',   hoverBg: 'hover:bg-blue-200',   dot: 'bg-blue-500',   darkBg: 'dark:bg-blue-900/30',   darkText: 'dark:text-blue-300',   label: 'Counter',     svgHex: '#93C5FD' },
  WALK_AWAY:      { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    hoverBg: 'hover:bg-red-200',    dot: 'bg-red-500',    darkBg: 'dark:bg-red-900/30',    darkText: 'dark:text-red-300',    label: 'Walk Away',   svgHex: '#FCA5A5' },
  ESCALATE:       { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', hoverBg: 'hover:bg-orange-200', dot: 'bg-orange-500', darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-300', label: 'Escalate',    svgHex: '#FDBA74' },
  ASK_CLARIFY:    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', hoverBg: 'hover:bg-yellow-200', dot: 'bg-yellow-500', darkBg: 'dark:bg-yellow-900/30', darkText: 'dark:text-yellow-300', label: 'Ask Clarify', svgHex: '#FDE68A' },
  REDIRECT:       { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', hoverBg: 'hover:bg-purple-200', dot: 'bg-purple-500', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-300', label: 'Redirected',  svgHex: '#D8B4FE' },
  ERROR_RECOVERY: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300',  hoverBg: 'hover:bg-amber-200',  dot: 'bg-amber-500',  darkBg: 'dark:bg-amber-900/30',  darkText: 'dark:text-amber-300',  label: 'Recovery',    svgHex: '#FCD34D' },
  DEFAULT:        { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-300',   hoverBg: 'hover:bg-gray-200',   dot: 'bg-gray-400',   darkBg: 'dark:bg-gray-900/30',   darkText: 'dark:text-gray-300',   label: 'Unknown',     svgHex: '#D1D5DB' },
};

export function getActionColors(action: string): ActionColorConfig {
  const normalized = (action || '').toUpperCase() as DecisionAction;
  return DECISION_ACTION_COLORS[normalized] || DECISION_ACTION_COLORS.DEFAULT;
}

// ============================================================================
// Deal Status Colors
// ============================================================================

export interface StatusColorConfig {
  label: string;
  bg: string;
  text: string;
  cardBg: string;
  cardBorder: string;
  borderColor: string;
  darkBg: string;
  darkText: string;
  statusBarColor: string;
  textAccent: string;
}

export const DEAL_STATUS_COLORS: Record<DealStatus, StatusColorConfig> = {
  NEGOTIATING: { label: 'Active',     bg: 'bg-blue-100',   text: 'text-blue-700',   cardBg: 'bg-blue-50',   cardBorder: 'border-blue-200',   borderColor: 'border-blue-500',   darkBg: 'dark:bg-blue-900/30',   darkText: 'dark:text-blue-300',   statusBarColor: 'bg-blue-500',   textAccent: 'text-blue-600' },
  ACCEPTED:    { label: 'Won',        bg: 'bg-green-100',  text: 'text-green-700',  cardBg: 'bg-green-50',  cardBorder: 'border-green-200',  borderColor: 'border-green-500',  darkBg: 'dark:bg-green-900/30',  darkText: 'dark:text-green-300',  statusBarColor: 'bg-green-500',  textAccent: 'text-green-600' },
  WALKED_AWAY: { label: 'Lost',       bg: 'bg-gray-100',   text: 'text-gray-700',   cardBg: 'bg-gray-50',   cardBorder: 'border-gray-200',   borderColor: 'border-gray-500',   darkBg: 'dark:bg-gray-900/30',   darkText: 'dark:text-gray-300',   statusBarColor: 'bg-red-500',    textAccent: 'text-red-600' },
  ESCALATED:   { label: 'Escalated',  bg: 'bg-orange-100', text: 'text-orange-700', cardBg: 'bg-orange-50', cardBorder: 'border-orange-200', borderColor: 'border-orange-500', darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-300', statusBarColor: 'bg-orange-500', textAccent: 'text-orange-600' },
};

export function getDealStatusColors(status: DealStatus): StatusColorConfig {
  return DEAL_STATUS_COLORS[status] || DEAL_STATUS_COLORS.NEGOTIATING;
}

// ============================================================================
// Contract Status Colors
// ============================================================================

export type ContractStatus = 'Created' | 'Active' | 'Opened' | 'Completed' | 'Verified' | 'Accepted' | 'Rejected' | 'Expired' | 'Escalated' | 'InitialQuotation';

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, { label: string; bg: string; text: string; cardBg: string; cardBorder: string }> = {
  Created:          { label: 'Pending',     bg: 'bg-purple-100', text: 'text-purple-700', cardBg: 'bg-purple-50', cardBorder: 'border-purple-200' },
  Active:           { label: 'Negotiating', bg: 'bg-blue-100',   text: 'text-blue-700',   cardBg: 'bg-blue-50',   cardBorder: 'border-blue-200' },
  Escalated:        { label: 'Escalated',   bg: 'bg-orange-100', text: 'text-orange-700', cardBg: 'bg-orange-50', cardBorder: 'border-orange-200' },
  Accepted:         { label: 'Accepted',    bg: 'bg-green-100',  text: 'text-green-700',  cardBg: 'bg-green-50',  cardBorder: 'border-green-200' },
  Rejected:         { label: 'Rejected',    bg: 'bg-gray-100',   text: 'text-gray-700',   cardBg: 'bg-gray-50',   cardBorder: 'border-gray-200' },
  Opened:           { label: 'Opened',      bg: 'bg-cyan-100',   text: 'text-cyan-700',   cardBg: 'bg-cyan-50',   cardBorder: 'border-cyan-200' },
  Completed:        { label: 'Completed',   bg: 'bg-green-100',  text: 'text-green-700',  cardBg: 'bg-green-50',  cardBorder: 'border-green-200' },
  Verified:         { label: 'Verified',    bg: 'bg-teal-100',   text: 'text-teal-700',   cardBg: 'bg-teal-50',   cardBorder: 'border-teal-200' },
  Expired:          { label: 'Expired',     bg: 'bg-red-100',    text: 'text-red-700',    cardBg: 'bg-red-50',    cardBorder: 'border-red-200' },
  InitialQuotation: { label: 'Quotation',   bg: 'bg-indigo-100', text: 'text-indigo-700', cardBg: 'bg-indigo-50', cardBorder: 'border-indigo-200' },
};

export function getContractStatusColors(status?: ContractStatus) {
  return CONTRACT_STATUS_COLORS[status || 'Created'] || CONTRACT_STATUS_COLORS.Created;
}

// ============================================================================
// Utility Score Helpers
// ============================================================================

export function getUtilityBarColor(score: number): string {
  if (score >= 0.7) return 'bg-green-500';
  if (score >= 0.5) return 'bg-blue-500';
  if (score >= 0.3) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getUtilityTextColor(score: number): string {
  if (score >= 0.7) return 'text-green-600';
  if (score >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
}

// ============================================================================
// Gauge Zone Mapping (for DecisionThresholdZones SVG)
// ============================================================================

export const GAUGE_ZONE_MAP = {
  walk:     'WALK_AWAY',
  escalate: 'ESCALATE',
  counter:  'COUNTER',
  accept:   'ACCEPT',
} as const;

// ============================================================================
// Brand Palette (for inline styles where Tailwind classes can't be used)
// ============================================================================

export const BRAND = {
  primary500: '#234BF3',
  primary600: '#1A3AD4',
  primary400: '#5A78FA',
  primary300: '#8DA0FC',
  primary100: '#D8DFFE',
  primary50:  '#EEF1FE',
  darkBg:     '#0B0F17',
  landingText:    '#0F172A',
  landingTextSec: '#475569',
  landingBorder:  '#E2E8F0',
  landingBgAlt:   '#F8FAFC',
} as const;

// ============================================================================
// Scrollbar Colors (referenced in index.css via CSS custom properties)
// ============================================================================

export const SCROLLBAR = {
  thumb: '#4a90e2',
  thumbHover: '#357ab8',
  track: '#f0f0f0',
  sidebarThumb: '#a5b4fc',
  sidebarThumbHover: '#818cf8',
} as const;
