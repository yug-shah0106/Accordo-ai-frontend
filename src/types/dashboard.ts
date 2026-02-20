export type DashboardPeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiMetric {
  value: number;
  delta: number;
  trend: KpiTrend;
}

export interface DashboardKpis {
  totalSavings: KpiMetric;
  activeNegotiations: KpiMetric;
  totalRequisitions: KpiMetric;
  avgDealImprovement: KpiMetric;
}

export interface NegotiationPipeline {
  negotiating: number;
  accepted: number;
  walkedAway: number;
  escalated: number;
}

export interface SavingsTimeline {
  labels: string[];
  /** Per-bucket savings (bar chart data) */
  data: number[];
  /** Cumulative running total (line chart data) */
  cumulative: number[];
  /** Previous period cumulative for comparison overlay */
  previousPeriodCumulative: number[];
  /** Summary stats for inline callouts */
  summary: {
    total: number;
    avgPerBucket: number;
    peakValue: number;
    peakLabel: string;
  };
}

export interface SpendCategory {
  category: string;
  amount: number;
  percentage: number;
}

export type ActivityType =
  | 'deal_accepted'
  | 'deal_walked_away'
  | 'deal_escalated'
  | 'deal_started'
  | 'requisition_created'
  | 'contract_sent';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  entityType: 'deal' | 'requisition' | 'contract';
  rfqId?: number;
  vendorId?: number;
  dealId?: string;
}

export interface StalledNegotiation {
  dealId: string;
  rfqId: number;
  vendorId: number;
  title: string;
  vendorName: string;
  lastActivityAt: string;
  daysSinceActivity: number;
}

export interface ApproachingDeadline {
  dealId: string;
  rfqId: number;
  vendorId: number;
  title: string;
  deadline: string;
  daysRemaining: number;
}

export interface EscalatedDeal {
  dealId: string;
  rfqId: number;
  vendorId: number;
  title: string;
  vendorName: string;
  escalatedAt: string;
  reason: string;
}

export interface UnresponsiveVendor {
  vendorId: number;
  vendorName: string;
  dealId: string;
  rfqId: number;
  lastNotifiedAt: string;
  daysSinceNotification: number;
}

export interface NeedsAttention {
  stalledNegotiations: StalledNegotiation[];
  approachingDeadlines: ApproachingDeadline[];
  escalatedDeals: EscalatedDeal[];
  unresponsiveVendors: UnresponsiveVendor[];
}

export interface DashboardStatsData {
  kpis: DashboardKpis;
  negotiationPipeline: NegotiationPipeline;
  savingsOverTime: SavingsTimeline;
  spendByCategory: SpendCategory[];
  recentActivity: ActivityItem[];
  needsAttention: NeedsAttention;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStatsData;
}
