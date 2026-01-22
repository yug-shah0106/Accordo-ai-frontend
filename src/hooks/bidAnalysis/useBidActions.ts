/**
 * Hook for bid action operations (select, reject, restore)
 */

import { useState, useCallback } from 'react';
import { bidAnalysisService } from '../../services/bidAnalysis.service';
import { tokenStorage } from '../../utils/tokenStorage';
import type { SelectBidResult, RejectBidResult, RestoreBidResult } from '../../types/bidAnalysis';
import toast from 'react-hot-toast';

interface UseBidActionsResult {
  loading: boolean;
  selectBid: (requisitionId: number, bidId: string, remarks?: string) => Promise<SelectBidResult | null>;
  rejectBid: (requisitionId: number, bidId: string, remarks?: string) => Promise<RejectBidResult | null>;
  restoreBid: (requisitionId: number, bidId: string) => Promise<RestoreBidResult | null>;
  downloadPdf: (requisitionId: number) => void;
}

export function useBidActions(): UseBidActionsResult {
  const [loading, setLoading] = useState(false);

  const selectBid = useCallback(async (
    requisitionId: number,
    bidId: string,
    remarks?: string
  ): Promise<SelectBidResult | null> => {
    try {
      setLoading(true);

      const result = await bidAnalysisService.selectBid(requisitionId, bidId, remarks);

      toast.success(`Vendor ${result.vendorName} selected successfully! PO #${result.poId || 'pending'} created.`);

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to select vendor';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectBid = useCallback(async (
    requisitionId: number,
    bidId: string,
    remarks?: string
  ): Promise<RejectBidResult | null> => {
    try {
      setLoading(true);

      const result = await bidAnalysisService.rejectBid(requisitionId, bidId, remarks);

      toast.success('Bid rejected successfully');

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject bid';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreBid = useCallback(async (
    requisitionId: number,
    bidId: string
  ): Promise<RestoreBidResult | null> => {
    try {
      setLoading(true);

      const result = await bidAnalysisService.restoreBid(requisitionId, bidId);

      toast.success('Bid restored successfully');

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore bid';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadPdf = useCallback(async (requisitionId: number) => {
    try {
      // Log the export action
      bidAnalysisService.logExport(requisitionId).catch(console.error);

      // Get the auth token
      const token = tokenStorage.getAccessToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      // Build full URL with backend base
      const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');
      const pdfPath = bidAnalysisService.getPdfDownloadUrl(requisitionId);
      const pdfUrl = backendUrl ? `${backendUrl}${pdfPath}` : pdfPath;

      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else if (response.status === 404) {
          toast.error('PDF not found. The comparison may not have been generated yet.');
        } else {
          toast.error('Failed to download PDF. Please try again.');
        }
        return;
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `bid-comparison-rfq-${requisitionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Failed to download PDF. Please try again.');
    }
  }, []);

  return {
    loading,
    selectBid,
    rejectBid,
    restoreBid,
    downloadPdf,
  };
}

export default useBidActions;
