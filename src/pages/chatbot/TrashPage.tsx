/**
 * Trash Page
 *
 * Lists all soft-deleted deals with restore/permanent delete functionality.
 * Only shows deals deleted by the current user.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiRefreshCw, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import chatbotService from '../../services/chatbot.service';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { Deal } from '../../types/chatbot';

export default function TrashPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadDeletedDeals();
  }, []);

  const loadDeletedDeals = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await chatbotService.listDeals({ deleted: true });
      const responseData: any = res.data;
      setDeals(responseData?.data || responseData?.deals || []);
    } catch (err) {
      console.error('Failed to load deleted deals:', err);
      toast.error('Failed to load deleted deals');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (dealId: string): Promise<void> => {
    try {
      setRestoring(dealId);
      await chatbotService.restoreDeal(dealId);
      toast.success('Deal restored successfully');
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (err) {
      console.error('Failed to restore deal:', err);
      toast.error('Failed to restore deal');
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async (dealId: string): Promise<void> => {
    try {
      setDeleting(dealId);
      await chatbotService.permanentlyDeleteDeal(dealId);
      toast.success('Deal permanently deleted');
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Failed to permanently delete deal:', err);
      toast.error('Failed to delete deal');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading deleted deals...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Trash</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {deals.length} deleted {deals.length === 1 ? 'deal' : 'deals'}
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
              onClick={loadDeletedDeals}
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
            <FiTrash2 className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">Trash is empty</p>
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
                  {deal.deletedAt && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Deleted</span>
                      <span className="font-medium text-gray-900 dark:text-dark-text">
                        {format(new Date(deal.deletedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(deal.id)}
                    disabled={restoring === deal.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FiRotateCcw className="w-4 h-4" />
                    {restoring === deal.id ? 'Restoring...' : 'Restore'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(deal.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete Forever
                  </button>
                </div>

                {/* Confirmation Modal */}
                {confirmDelete === deal.id && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md mx-4">
                      <div className="flex items-center gap-3 mb-4">
                        <FiAlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                          Permanently Delete Deal?
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        This action cannot be undone. The deal "{deal.title}" and all its messages
                        will be permanently deleted.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(deal.id)}
                          disabled={deleting === deal.id}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === deal.id ? 'Deleting...' : 'Delete Forever'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
