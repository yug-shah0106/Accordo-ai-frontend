import { useState } from "react";
import DecisionBadge from "./DecisionBadge";
import OfferCard from "./OfferCard";
import type { Message } from '../../../types';

/**
 * MessageBubble Component
 * Displays a single message in the chat transcript
 */

interface MessageBubbleProps {
  message: Message;
  round?: number;
  isGrouped?: boolean;
}

export default function MessageBubble({ message, round, isGrouped = false }: MessageBubbleProps) {
  const [showFull, setShowFull] = useState(false);
  const isVendor = message.role === "VENDOR";
  const isAccordo = message.role === "ACCORDO";
  const decision = message.engineDecision;

  // Show first 3 lines, then "Show more" if longer
  const contentLines = (message.content || "").split("\n");
  const shouldTruncate = contentLines.length > 3;
  const displayContent =
    shouldTruncate && !showFull
      ? contentLines.slice(0, 3).join("\n")
      : message.content;

  // Always show content for Accordo messages - if empty, show at least decision summary
  const hasContent = message.content && message.content.trim().length > 0;
  const shouldShowContent = hasContent || isVendor;

  return (
    <div
      className={`flex w-full px-4 ${
        isGrouped ? "mb-0.5" : "mb-2"
      } ${isVendor ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isVendor
            ? "bg-white border border-gray-200"
            : "bg-blue-50 border border-blue-200 border-l-2"
        }`}
      >
        {/* Message Header */}
        <div className="flex justify-between items-center mb-2 gap-4">
          <span className="text-xs font-medium text-gray-500">
            {isVendor ? "Vendor" : "Procurement Manager"}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Message Content */}
        {shouldShowContent && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
            {displayContent ||
              (isAccordo && decision
                ? `${
                    decision.action === "COUNTER"
                      ? "Countering"
                      : decision.action === "ACCEPT"
                      ? "Accepting"
                      : decision.action
                  }`
                : "")}
            {shouldTruncate && (
              <button
                onClick={() => setShowFull(!showFull)}
                className="mt-1 text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer bg-transparent border-none"
              >
                {showFull ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {/* Accordo Metadata (Decision & Counter Offer) */}
        {isAccordo && decision && (
          <div className="mt-3 flex flex-col gap-2">
            {shouldShowContent && <div className="h-px bg-gray-200 my-1" />}
            <DecisionBadge decision={decision} round={round} />
            {decision.action === "COUNTER" && decision.counterOffer && (
              <OfferCard offer={decision.counterOffer} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
