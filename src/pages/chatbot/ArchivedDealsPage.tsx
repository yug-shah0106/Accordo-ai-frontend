/**
 * Archived Deals Page
 *
 * Lists all archived deals with unarchive functionality.
 * Only shows deals archived by the current user.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArchive, FiRefreshCw, FiEye } from 'react-icons/fi';
import chatbotService from '../../services/chatbot.service';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { Deal } from '../../types/chatbot';

export default function ArchivedDealsPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unarchiving, setUnarchiving] = useState<string | null>(null);

  useEffect(() => {
    loadArchivedDeals();
  }, []);

  const loadArchivedDeals = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await chatbotService.listDeals({ archived: true });
      const responseData: any = res.data;
      setDeals(responseData?.data || responseData?.deals || []);
    } catch (err) {
      console.error('Failed to load archived deals:', err);
      toast.error('Failed to load archived deals');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (dealId: string): Promise<void> => {
    try {
      setUnarchiving(dealId);
      await chatbotService.unarchiveDeal(dealId);
      toast.success('Deal unarchived successfully');
      // Remove from list
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (err) {
      console.error('Failed to unarchive deal:', err);
      toast.error('Failed to unarchive deal');
    } finally {
      setUnarchiving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading archived deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
              Archived Deals
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {deals.length} archived {deals.length === 1 ? 'deal' : 'deals'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/chatbot')}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Back to Deals
            </button>
            <button
              onClick={loadArchivedDeals}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FiArchive className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No archived deals
            </p>
            <button
              onClick={() => navigate('/chatbot')}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Go to active deals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-1 truncate">
                      {deal.title}
                    </h3>
                    {deal.counterparty && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {deal.counterparty}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      deal.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : deal.status === 'WALKED_AWAY'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : deal.status === 'ESCALATED'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}
                  >
                    {deal.status}
                  </span>
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Round</span>
                    <span className="font-medium text-gray-900 dark:text-dark-text">{deal.round}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Mode</span>
                    <span className="font-medium text-gray-900 dark:text-dark-text">{deal.mode}</span>
                  </div>
                  {deal.archivedAt && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Archived</span>
                      <span className="font-medium text-gray-900 dark:text-dark-text">
                        {format(new Date(deal.archivedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/chatbot/deals/${deal.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FiEye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleUnarchive(deal.id)}
                    disabled={unarchiving === deal.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FiArchive className="w-4 h-4" />
                    {unarchiving === deal.id ? 'Unarchiving...' : 'Unarchive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
