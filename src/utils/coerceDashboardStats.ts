import type {
  DashboardKpis,
  DashboardStatsData,
  DashboardStatsResponse,
  KpiMetric,
  NeedsAttention,
  SavingsTimeline,
} from "../types/dashboard";

const emptyKpi = (): KpiMetric => ({
  value: 0,
  delta: 0,
  trend: "neutral",
});

const emptySavingsTimeline = (): SavingsTimeline => ({
  labels: [],
  data: [],
  cumulative: [],
  previousPeriodCumulative: [],
  summary: {
    total: 0,
    avgPerBucket: 0,
    peakValue: 0,
    peakLabel: "",
  },
});

const emptyNeedsAttention = (): NeedsAttention => ({
  stalledNegotiations: [],
  approachingDeadlines: [],
  escalatedDeals: [],
  unresponsiveVendors: [],
});

function isKpiMetric(v: unknown): v is KpiMetric {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.value === "number" &&
    typeof o.delta === "number" &&
    (o.trend === "up" || o.trend === "down" || o.trend === "neutral")
  );
}

function mergeKpis(raw: unknown): DashboardKpis {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    totalSavings: isKpiMetric(r.totalSavings) ? r.totalSavings : emptyKpi(),
    activeNegotiations: isKpiMetric(r.activeNegotiations)
      ? r.activeNegotiations
      : emptyKpi(),
    totalRequisitions: isKpiMetric(r.totalRequisitions)
      ? r.totalRequisitions
      : emptyKpi(),
    avgDealImprovement: isKpiMetric(r.avgDealImprovement)
      ? r.avgDealImprovement
      : emptyKpi(),
  };
}

function mergeSavingsTimeline(raw: unknown): SavingsTimeline {
  const base = emptySavingsTimeline();
  if (!raw || typeof raw !== "object") return base;
  const t = raw as Record<string, unknown>;
  const labels = Array.isArray(t.labels) ? (t.labels as string[]) : base.labels;
  const data = Array.isArray(t.data) ? (t.data as number[]) : base.data;
  const cumulative = Array.isArray(t.cumulative)
    ? (t.cumulative as number[])
    : base.cumulative;
  const previousPeriodCumulative = Array.isArray(t.previousPeriodCumulative)
    ? (t.previousPeriodCumulative as number[])
    : base.previousPeriodCumulative;
  const summary =
    t.summary && typeof t.summary === "object"
      ? {
          total: Number((t.summary as Record<string, unknown>).total) || 0,
          avgPerBucket:
            Number((t.summary as Record<string, unknown>).avgPerBucket) || 0,
          peakValue:
            Number((t.summary as Record<string, unknown>).peakValue) || 0,
          peakLabel: String(
            (t.summary as Record<string, unknown>).peakLabel ?? "",
          ),
        }
      : base.summary;
  return {
    labels,
    data,
    cumulative,
    previousPeriodCumulative,
    summary,
  };
}

function mergeNeedsAttention(raw: unknown): NeedsAttention {
  if (!raw || typeof raw !== "object") {
    return emptyNeedsAttention();
  }
  const n = raw as Record<string, unknown>;
  return {
    stalledNegotiations: Array.isArray(n.stalledNegotiations)
      ? (n.stalledNegotiations as NeedsAttention["stalledNegotiations"])
      : [],
    approachingDeadlines: Array.isArray(n.approachingDeadlines)
      ? (n.approachingDeadlines as NeedsAttention["approachingDeadlines"])
      : [],
    escalatedDeals: Array.isArray(n.escalatedDeals)
      ? (n.escalatedDeals as NeedsAttention["escalatedDeals"])
      : [],
    unresponsiveVendors: Array.isArray(n.unresponsiveVendors)
      ? (n.unresponsiveVendors as NeedsAttention["unresponsiveVendors"])
      : [],
  };
}

/**
 * Unwraps API payloads and fills missing nested fields so dashboard UI never throws.
 */
export function coerceDashboardStatsPayload(
  payload: unknown,
): DashboardStatsData | null {
  if (
    payload == null ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return null;
  }

  let body = payload as Record<string, unknown>;

  if ("data" in body && body.data != null && typeof body.data === "object") {
    body = body.data as Record<string, unknown>;
  }

  const kpisSource =
    body.kpis && typeof body.kpis === "object" ? body.kpis : {};

  return {
    kpis: mergeKpis(kpisSource),
    negotiationPipeline:
      body.negotiationPipeline && typeof body.negotiationPipeline === "object"
        ? {
            negotiating: Number(
              (body.negotiationPipeline as Record<string, unknown>).negotiating,
            ) || 0,
            accepted: Number(
              (body.negotiationPipeline as Record<string, unknown>).accepted,
            ) || 0,
            walkedAway: Number(
              (body.negotiationPipeline as Record<string, unknown>).walkedAway,
            ) || 0,
            escalated: Number(
              (body.negotiationPipeline as Record<string, unknown>).escalated,
            ) || 0,
          }
        : {
            negotiating: 0,
            accepted: 0,
            walkedAway: 0,
            escalated: 0,
          },
    savingsOverTime: mergeSavingsTimeline(body.savingsOverTime),
    spendByCategory: Array.isArray(body.spendByCategory)
      ? (body.spendByCategory as DashboardStatsData["spendByCategory"])
      : [],
    recentActivity: Array.isArray(body.recentActivity)
      ? (body.recentActivity as DashboardStatsData["recentActivity"])
      : [],
    needsAttention: mergeNeedsAttention(body.needsAttention),
  };
}

/** Accepts axios body: `{ success, data }` or inner stats object. */
export function coerceDashboardStatsFromService(
  res: DashboardStatsResponse | DashboardStatsData | unknown,
): DashboardStatsData | null {
  return coerceDashboardStatsPayload(res);
}
