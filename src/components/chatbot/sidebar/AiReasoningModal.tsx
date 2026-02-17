import { useEffect, useRef, useCallback } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiDollarSign, FiClock } from "react-icons/fi";

export interface ReasoningTimelineItem {
  round: number;
  timestamp: string;
  action: string;
  utilityScore: number | null;
  reasons: string[];
  counterOffer: {
    total_price?: number | null;
    payment_terms?: string | null;
    delivery_date?: string | null;
    delivery_days?: number | null;
    unit_price?: number | null;
  } | null;
  mesoOptions: Array<{
    label: string;
    offer?: { total_price?: number };
    emphasis?: string[] | string;
  }> | null;
  reasoning: string[];
}

interface AiReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: ReasoningTimelineItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

const ACTION_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  ACCEPT: { bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
  COUNTER: { bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  ESCALATE: { bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  WALK_AWAY: { bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
};

const DEFAULT_STYLE = { bg: "bg-gray-100 text-gray-600", text: "text-gray-600", dot: "bg-gray-400" };

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AiReasoningModal({
  isOpen,
  onClose,
  timeline,
  currentIndex,
  onNavigate,
}: AiReasoningModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < timeline.length - 1) onNavigate(currentIndex + 1);
    },
    [isOpen, currentIndex, timeline.length, onClose, onNavigate]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || timeline.length === 0) return null;

  const item = timeline[currentIndex];
  if (!item) return null;

  const style = ACTION_STYLES[item.action] || DEFAULT_STYLE;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const hasCounterOffer = item.counterOffer && (
    item.counterOffer.total_price || item.counterOffer.payment_terms || item.counterOffer.delivery_date || item.counterOffer.delivery_days
  );

  const hasUtilityBreakdown = item.reasons && item.reasons.length > 0;
  const hasMesoOptions = item.mesoOptions && item.mesoOptions.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 dark:bg-gray-900/70 animate-in fade-in duration-150"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[560px] mx-4 max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous round"
            >
              <FiChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Round {item.round} <span className="font-normal text-gray-500 dark:text-gray-400">of {timeline.length}</span>
            </span>
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === timeline.length - 1}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next round"
            >
              <FiChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Sub-header: Action badge + Utility + Timestamp */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${style.bg}`}>
            {item.action?.replace("_", " ")}
          </span>
          {item.utilityScore != null && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {(item.utilityScore * 100).toFixed(0)}% utility
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
            {formatTimestamp(item.timestamp)}
          </span>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Section 1: Decision Reasons */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
              Decision Reasoning
            </h4>
            <div className="space-y-2">
              {item.reasoning.map((reason: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Counter Offer Details */}
          {hasCounterOffer && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                Counter Offer
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {item.counterOffer!.total_price != null && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FiDollarSign className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase">Price</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${item.counterOffer!.total_price!.toLocaleString()}
                    </span>
                  </div>
                )}
                {item.counterOffer!.payment_terms && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FiClock className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 uppercase">Payment Terms</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {item.counterOffer!.payment_terms}
                    </span>
                  </div>
                )}
                {item.counterOffer!.delivery_date && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FiClock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">Delivery</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(item.counterOffer!.delivery_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {item.counterOffer!.delivery_days != null && !item.counterOffer!.delivery_date && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FiClock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">Delivery</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {item.counterOffer!.delivery_days} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Utility Breakdown */}
          {hasUtilityBreakdown && item.utilityScore != null && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                Utility Breakdown
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                {/* Overall utility bar */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Overall Utility</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {(item.utilityScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.utilityScore >= 0.7 ? "bg-green-500" :
                      item.utilityScore >= 0.5 ? "bg-blue-500" :
                      item.utilityScore >= 0.3 ? "bg-orange-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(item.utilityScore * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-400">Walk Away</span>
                  <span className="text-[10px] text-gray-400">Accept</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: MESO Options */}
          {hasMesoOptions && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                MESO Options Offered
              </h4>
              <div className="space-y-2">
                {item.mesoOptions!.map((opt, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2.5 border border-emerald-100 dark:border-emerald-800"
                  >
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                      {opt.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {opt.offer?.total_price != null && (
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ${opt.offer.total_price.toLocaleString()}
                        </span>
                      )}
                      {opt.emphasis && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                          {Array.isArray(opt.emphasis) ? opt.emphasis.join(", ") : opt.emphasis}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with keyboard hint */}
        <div className="flex items-center justify-center px-5 py-2.5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 flex-shrink-0">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            Use <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px] font-mono">&larr;</kbd> <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px] font-mono">&rarr;</kbd> to navigate rounds &middot; <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px] font-mono">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
