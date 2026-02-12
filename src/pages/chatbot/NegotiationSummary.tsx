/**
 * Negotiation Summary Page
 *
 * Displays analysis and summary of all completed negotiation deals
 * (ACCEPTED or WALKED_AWAY status)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import chatbotService from '../../services/chatbot.service';
import type { VendorDealSummary } from '../../types/chatbot';
import toast from 'react-hot-toast';

// Map VendorDealSummary to Deal-like structure for display
type DealLike = VendorDealSummary & {
  id: string;
  round: number;
  requisitionId?: number;
  title?: string;
  counterparty?: string;
  mode?: string;
};

export default function NegotiationSummary() {
  const [deals, setDeals] = useState<DealLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'walked_away'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadCompletedDeals();
  }, []);

  const loadCompletedDeals = async () => {
    try {
      setLoading(true);
      // Fetch all requisitions and their deals
      const reqResponse = await chatbotService.getRequisitionsWithDeals({
        archived: 'active',
      });

      // For each requisition, fetch its deals
      const allDeals: DealLike[] = [];
      for (const req of reqResponse.data.requisitions || []) {
        try {
          const dealsResponse = await chatbotService.getRequisitionDeals(req.id, {
            archived: 'active',
          });
          for (const deal of dealsResponse.data.deals || []) {
            if (deal.status === 'ACCEPTED' || deal.status === 'WALKED_AWAY' || deal.status === 'ESCALATED') {
              allDeals.push({
                ...deal,
                id: deal.dealId,
                round: deal.currentRound,
                requisitionId: req.id,
                title: `${deal.vendorName} - ${req.rfqNumber}`,
                counterparty: deal.vendorName,
              });
            }
          }
        } catch (err) {
          // Skip requisitions with errors
          console.warn(`Failed to load deals for requisition ${req.id}:`, err);
        }
      }

      setDeals(allDeals);
    } catch (error: any) {
      console.error('Failed to load deals:', error);
      toast.error(error.response?.data?.message || 'Failed to load negotiation summary');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    if (filter === 'all') return true;
    if (filter === 'accepted') return deal.status === 'ACCEPTED';
    if (filter === 'walked_away') return deal.status === 'WALKED_AWAY' || deal.status === 'ESCALATED';
    return true;
  });

  // Calculate statistics
  const totalDeals = deals.length;
  const acceptedDeals = deals.filter(d => d.status === 'ACCEPTED').length;
  const walkedAwayDeals = deals.filter(d => d.status === 'WALKED_AWAY' || d.status === 'ESCALATED').length;
  const successRate = totalDeals > 0 ? ((acceptedDeals / totalDeals) * 100).toFixed(1) : '0';
  const avgRounds = totalDeals > 0
    ? (deals.reduce((sum, d) => sum + (d.round || 0), 0) / totalDeals).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading negotiation summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 pt-6 px-6 pb-0">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/chatbot')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Deals
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Negotiation Summary & Analysis</h1>
        <p className="text-gray-600 mt-1">Performance overview of completed negotiations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg pt-6 px-6 pb-0 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalDeals}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg pt-6 px-6 pb-0 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted Deals</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{acceptedDeals}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg pt-6 px-6 pb-0 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Walked Away</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{walkedAwayDeals}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg pt-6 px-6 pb-0 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg pt-6 px-6 pb-0 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Negotiation Efficiency</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Rounds per Deal</span>
              <span className="text-lg font-bold text-gray-900">{avgRounds}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Negotiations</span>
              <span className="text-lg font-bold text-gray-900">{totalDeals}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg pt-6 px-6 pb-0 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Outcome Distribution</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Accepted</span>
                  <span className="text-sm font-medium text-gray-900">{acceptedDeals}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${totalDeals > 0 ? (acceptedDeals / totalDeals) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Walked Away</span>
                  <span className="text-sm font-medium text-gray-900">{walkedAwayDeals}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${totalDeals > 0 ? (walkedAwayDeals / totalDeals) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 pt-2 pb-0 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({totalDeals})
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 pt-2 pb-0 rounded-lg text-sm font-medium transition-colors ${
            filter === 'accepted'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Accepted ({acceptedDeals})
        </button>
        <button
          onClick={() => setFilter('walked_away')}
          className={`px-4 pt-2 pb-0 rounded-lg text-sm font-medium transition-colors ${
            filter === 'walked_away'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Walked Away ({walkedAwayDeals})
        </button>
      </div>

      {/* 3x3 Grid of Deal Cards */}
      {filteredDeals.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm pt-12 px-12 pb-0 text-center">
          <p className="text-gray-500 dark:text-gray-400">No completed deals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => {
                if (deal.requisitionId && deal.vendorId) {
                  navigate(`/chatbot/requisitions/${deal.requisitionId}/vendors/${deal.vendorId}/deals/${deal.id}`);
                } else {
                  toast.error('Cannot open deal: missing requisition or vendor context');
                }
              }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-dark-border overflow-hidden group"
            >
              {/* Color-coded status bar */}
              <div className={`h-2 ${
                deal.status === "ACCEPTED"
                  ? "bg-green-500"
                  : deal.status === "WALKED_AWAY"
                  ? "bg-red-500"
                  : deal.status === "ESCALATED"
                  ? "bg-orange-500"
                  : "bg-gray-400"
              }`}></div>

              {/* Card Content */}
              <div className="p-5">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2 truncate group-hover:text-blue-600 transition-colors">
                  {deal.title}
                </h3>

                {/* Counterparty */}
                {deal.counterparty && (
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3 truncate">
                    {deal.counterparty}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      deal.status === "ACCEPTED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : deal.status === "WALKED_AWAY"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : deal.status === "ESCALATED"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                    }`}
                  >
                    {deal.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Round {deal.round}</span>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">• {deal.mode}</span>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  Completed: {deal.completedAt ? new Date(deal.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
