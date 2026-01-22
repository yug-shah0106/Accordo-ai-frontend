import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chatbotService from "../../services/chatbot.service";
import type { RequisitionWithDeals } from "../../types/chatbot";
import { RequisitionCard } from "../../components/chatbot/requisition-view";
import { ConfirmDialog } from "../../components/chatbot/common";
import { FiArrowLeft, FiRefreshCw, FiArchive } from "react-icons/fi";
import { MdRestore } from "react-icons/md";
import toast from "react-hot-toast";

export default function ArchivedRequisitionsPage() {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<RequisitionWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false);
  const [requisitionToUnarchive, setRequisitionToUnarchive] = useState<RequisitionWithDeals | null>(null);
  const [unarchiving, setUnarchiving] = useState(false);

  const fetchArchivedRequisitions = async () => {
    setLoading(true);
    try {
      const response = await chatbotService.getRequisitionsWithDeals({ archived: 'archived' });
      setRequisitions(response.data.requisitions);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load archived requisitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedRequisitions();
  }, []);

  const handleUnarchiveClick = (e: React.MouseEvent, requisition: RequisitionWithDeals) => {
    e.stopPropagation();
    setRequisitionToUnarchive(requisition);
    setShowUnarchiveConfirm(true);
  };

  const handleConfirmUnarchive = async () => {
    if (!requisitionToUnarchive) return;
    try {
      setUnarchiving(true);
      await chatbotService.unarchiveRequisition(requisitionToUnarchive.id, true);
      toast.success(`"${requisitionToUnarchive.title}" restored successfully`);
      setShowUnarchiveConfirm(false);
      setRequisitionToUnarchive(null);
      fetchArchivedRequisitions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore requisition');
    } finally {
      setUnarchiving(false);
    }
  };

  const handleRequisitionClick = (requisitionId: number) => {
    navigate(`/chatbot/requisitions/${requisitionId}`);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-bg flex-shrink-0 pt-6 px-6 pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/chatbot/requisitions')}
              className="p-2 text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text flex items-center gap-2">
                <FiArchive className="w-6 h-6 text-orange-500" />
                Archived Requisitions
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
                {requisitions.length} archived {requisitions.length === 1 ? 'requisition' : 'requisitions'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchArchivedRequisitions}
            disabled={loading}
            className="p-2 text-gray-600 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-6 px-6 pb-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-dark-text-secondary">Loading archived requisitions...</p>
          </div>
        ) : requisitions.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-12 text-center">
            <FiArchive className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
              No archived requisitions
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
              Archived requisitions will appear here
            </p>
            <button
              onClick={() => navigate('/chatbot/requisitions')}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to active requisitions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requisitions.map((requisition) => (
              <div key={requisition.id} className="relative group">
                <RequisitionCard
                  requisition={requisition}
                  onClick={handleRequisitionClick}
                />
                <button
                  onClick={(e) => handleUnarchiveClick(e, requisition)}
                  className="absolute bottom-4 right-4 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-white dark:bg-dark-surface border border-green-200 dark:border-green-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-1.5"
                >
                  <MdRestore className="w-4 h-4" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showUnarchiveConfirm}
        title="Restore Requisition"
        message={`Are you sure you want to restore "${requisitionToUnarchive?.title}"? This will also restore all deals under it.`}
        confirmText={unarchiving ? "Restoring..." : "Restore"}
        confirmButtonClass="bg-green-500 hover:bg-green-600 text-white"
        onConfirm={handleConfirmUnarchive}
        onCancel={() => {
          setShowUnarchiveConfirm(false);
          setRequisitionToUnarchive(null);
        }}
      />
    </div>
  );
}
