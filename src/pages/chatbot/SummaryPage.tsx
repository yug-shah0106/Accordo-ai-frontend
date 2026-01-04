/**
 * Summary Page
 *
 * Displays final deal outcome with analytics, savings calculation, and full transcript.
 * Includes export functionality (PDF and CSV).
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
} from 'react-icons/fi';
import chatbotService from '../../services/chatbot.service';
import { exportToCSV, exportSummaryPDF } from '../../services/export.service';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { Deal, Message, NegotiationConfig, Explainability } from '../../types/chatbot';

interface SavingsCalculation {
  savings: number;
  savingsPercent: string;
  finalPrice: number;
  targetPrice: number;
}

export default function SummaryPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<NegotiationConfig | null>(null);
  const [explainability, setExplainability] = useState<Explainability | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [dealId]);

  const loadData = async (): Promise<void> => {
    if (!dealId) return;

    try {
      setLoading(true);
      const [dealRes, configRes] = await Promise.all([
        chatbotService.getDeal(dealId),
        chatbotService.getDealConfig(dealId),
      ]);

      setDeal(dealRes.data?.deal || dealRes.data);
      setMessages(dealRes.data?.messages || []);
      setConfig(configRes.data.config || configRes.data);

      // Try to get explainability if available
      try {
        const explainRes = await chatbotService.getExplainability(dealId);
        setExplainability(explainRes.data.explainability || explainRes.data);
      } catch (err) {
        console.log('No explainability data available');
      }
    } catch (err) {
      console.error('Failed to load deal:', err);
      toast.error('Failed to load deal summary');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (): Promise<void> => {
    if (!deal) return;

    try {
      setExporting(true);
      // @ts-ignore - export service uses JS and doesn't have proper types
      await exportSummaryPDF(deal, messages, config, explainability);
      toast.success('PDF exported successfully');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async (): Promise<void> => {
    if (!deal) return;

    try {
      setExporting(true);
      await exportToCSV(deal, messages);
      toast.success('CSV exported successfully');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const calculateSavings = (): SavingsCalculation | null => {
    if (!deal?.latestOfferJson || !config?.parameters?.unit_price?.target) {
      return null;
    }

    const finalPrice = deal.latestOfferJson.unit_price || 0;
    const targetPrice = config.parameters.unit_price.target;
    const savings = targetPrice - finalPrice;
    const savingsPercent = ((savings / targetPrice) * 100).toFixed(2);

    return { savings, savingsPercent, finalPrice, targetPrice };
  };

  const getOutcomeIcon = () => {
    switch (deal?.status) {
      case 'ACCEPTED':
        return <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />;
      case 'WALKED_AWAY':
        return <FiXCircle className="w-12 h-12 text-red-600 dark:text-red-400" />;
      case 'ESCALATED':
        return <FiAlertTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <FiTrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getOutcomeColor = (): string => {
    switch (deal?.status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'WALKED_AWAY':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'ESCALATED':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getOutcomeMessage = (): string => {
    switch (deal?.status) {
      case 'ACCEPTED':
        return 'Deal successfully accepted';
      case 'WALKED_AWAY':
        return 'Accordo walked away from negotiation';
      case 'ESCALATED':
        return 'Negotiation escalated to manual review';
      default:
        return 'Negotiation in progress';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading summary...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Deal not found</p>
          <button
            onClick={() => navigate('/chatbot')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Deals
          </button>
        </div>
      </div>
    );
  }

  const savings = calculateSavings();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/chatbot')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to deals"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                Negotiation Summary
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{deal.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Outcome Banner */}
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-8">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">{getOutcomeIcon()}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getOutcomeColor()}`}
                >
                  {deal.status}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Round {deal.round}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-1">
                {getOutcomeMessage()}
              </h2>
              {deal.counterparty && (
                <p className="text-gray-600 dark:text-gray-400">
                  Counterparty: {deal.counterparty}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Savings & Metrics */}
        {savings && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Savings */}
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                  Total Savings
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${savings.savings.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {savings.savingsPercent}% below target
                </p>
              </div>
            </div>

            {/* Final Price */}
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <FiTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-dark-text">Final Price</h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                  ${savings.finalPrice}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Target: ${savings.targetPrice}
                </p>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <FiCalendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                  Payment Terms
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                  {deal.latestOfferJson?.payment_terms || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ideal: {config?.parameters?.payment_terms?.options?.[0] || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deal Metadata */}
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">
            Negotiation Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mode</p>
              <p className="font-medium text-gray-900 dark:text-dark-text">{deal.mode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Rounds</p>
              <p className="font-medium text-gray-900 dark:text-dark-text">{deal.round}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Messages</p>
              <p className="font-medium text-gray-900 dark:text-dark-text">
                {messages.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
              <p className="font-medium text-gray-900 dark:text-dark-text">
                {format(new Date(deal.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Message Transcript */}
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">
            Full Transcript
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`p-4 rounded-lg ${
                  msg.role === 'VENDOR'
                    ? 'bg-gray-50 dark:bg-gray-900/50'
                    : msg.role === 'ACCORDO'
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'bg-yellow-50 dark:bg-yellow-900/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {msg.role}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-gray-900 dark:text-dark-text whitespace-pre-wrap">
                  {msg.content}
                </p>
                {msg.extractedOffer && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Offer: ${msg.extractedOffer.unit_price} • {msg.extractedOffer.payment_terms}
                    </p>
                  </div>
                )}
                {msg.decisionAction && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Decision: {msg.decisionAction} • Utility: {msg.utilityScore?.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
