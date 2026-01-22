/**
 * SuccessModal - Modal displayed after successful bid actions (accept/reject)
 */

import React, { useEffect, useRef } from 'react';
import { MdCheck, MdClose, MdRefresh } from 'react-icons/md';

export type SuccessActionType = 'accept' | 'reject' | 'restore';

interface SuccessModalProps {
  isOpen: boolean;
  actionType: SuccessActionType;
  vendorName: string;
  bidPrice?: number;
  poId?: number | null;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  actionType,
  vendorName,
  bidPrice,
  poId,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Auto close after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getConfig = () => {
    switch (actionType) {
      case 'accept':
        return {
          icon: <MdCheck className="text-white" size={32} />,
          iconBg: 'bg-green-500',
          title: 'Vendor Selected Successfully!',
          description: `${vendorName} has been selected as the winning vendor.`,
          details: [
            { label: 'Vendor', value: vendorName },
            { label: 'Bid Price', value: formatCurrency(bidPrice) },
            ...(poId ? [{ label: 'PO Number', value: `#${poId}` }] : []),
          ],
        };
      case 'reject':
        return {
          icon: <MdClose className="text-white" size={32} />,
          iconBg: 'bg-red-500',
          title: 'Bid Rejected',
          description: `The bid from ${vendorName} has been rejected.`,
          details: [
            { label: 'Vendor', value: vendorName },
            { label: 'Bid Price', value: formatCurrency(bidPrice) },
          ],
        };
      case 'restore':
        return {
          icon: <MdRefresh className="text-white" size={32} />,
          iconBg: 'bg-blue-500',
          title: 'Bid Restored',
          description: `The bid from ${vendorName} has been restored.`,
          details: [
            { label: 'Vendor', value: vendorName },
            { label: 'Bid Price', value: formatCurrency(bidPrice) },
          ],
        };
      default:
        return {
          icon: <MdCheck className="text-white" size={32} />,
          iconBg: 'bg-gray-500',
          title: 'Action Completed',
          description: 'The action has been completed successfully.',
          details: [],
        };
    }
  };

  const config = getConfig();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header with Icon */}
        <div className={`${config.iconBg} p-6 flex items-center justify-center`}>
          <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            {config.icon}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {config.title}
          </h2>
          <p className="text-sm text-gray-600 text-center mb-4">
            {config.description}
          </p>

          {/* Details */}
          {config.details.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {config.details.map((detail, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{detail.label}</span>
                  <span className="text-sm font-medium text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Close
          </button>

          {/* Auto-close indicator */}
          <p className="text-xs text-gray-400 text-center mt-2">
            This dialog will close automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
