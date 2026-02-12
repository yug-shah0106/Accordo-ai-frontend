import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import type { Message, MessageRole } from '../../../types';

type ProcessingType = 'analyzing' | 'vendor-typing';

interface MessageGroup {
  messages: Message[];
  role: MessageRole;
}

interface MessageWithDivider {
  type: 'message';
  message: Message;
  isGrouped: boolean;
}

interface RoundStrategyInfo {
  strategy?: string;
  utility?: number | null;
  isConverging?: boolean;
  isStalling?: boolean;
  isDiverging?: boolean;
}

interface RoundDivider {
  type: 'divider';
  round: number;
}

type TranscriptItem = MessageWithDivider | RoundDivider;

/**
 * ChatTranscript Component
 * Displays chat messages with smart auto-scroll
 * Only scrolls to bottom when user is near the bottom (within 100px)
 *
 * Updated February 2026: Added pmMode for PM read-only view
 * - In pmMode: Layout is FLIPPED - PM/Accordo messages on LEFT, Vendor on RIGHT
 */

interface ChatTranscriptProps {
  messages: Message[];
  isProcessing?: boolean;
  processingType?: ProcessingType;
  vendorMode?: boolean;  // When true, shows vendor-perspective labels
  pmMode?: boolean;      // When true, flips layout for PM perspective
  roundStrategyInfo?: Record<number, RoundStrategyInfo>;  // Per-round strategy info from behavioral analysis
}

export default function ChatTranscript({
  messages,
  isProcessing = false,
  processingType = "analyzing",
  vendorMode = false,
  pmMode = false,
  roundStrategyInfo,
}: ChatTranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Track scroll position to determine if user is near bottom
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // User is "near bottom" if within 100px
    setIsNearBottom(distanceFromBottom < 100);
  };

  // Smart auto-scroll: only scroll if user is near bottom
  // FIXED (Jan 2026): Added messages.length dependency to ensure scroll triggers on new messages
  useEffect(() => {
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messages.length, isProcessing, isNearBottom]);

  // Group consecutive messages from same role
  const groupMessages = (msgs: Message[]): MessageGroup[] => {
    if (!msgs || msgs.length === 0) return [];

    // Filter out any invalid messages
    const validMsgs = msgs.filter(m => m && m.role);
    if (validMsgs.length === 0) return [];

    const grouped: MessageGroup[] = [];
    let currentGroup: Message[] = [validMsgs[0]];
    let currentRole: MessageRole = validMsgs[0].role;

    for (let i = 1; i < validMsgs.length; i++) {
      if (validMsgs[i].role === currentRole) {
        currentGroup.push(validMsgs[i]);
      } else {
        grouped.push({ messages: currentGroup, role: currentRole });
        currentGroup = [validMsgs[i]];
        currentRole = validMsgs[i].role;
      }
    }
    grouped.push({ messages: currentGroup, role: currentRole });
    return grouped;
  };

  const groupedMessages = groupMessages(messages);

  // Add round dividers BEFORE the first vendor message of each round
  // Round dividers show "Round X" where X comes from message.round (backend source of truth)
  const messagesWithDividers: TranscriptItem[] = [];
  let lastSeenRound: number | null = null;

  groupedMessages.forEach((group) => {
    group.messages.forEach((message, msgIdx) => {
      const messageRound = message.round;
      const isGrouped = msgIdx > 0;

      // Add divider BEFORE the first vendor message of a new round
      // Requirement: "Round X" divider appears before the vendor message that starts that round
      if (
        message.role === "VENDOR" &&
        messageRound !== null &&
        messageRound !== lastSeenRound
      ) {
        messagesWithDividers.push({ type: "divider", round: messageRound });
        lastSeenRound = messageRound;
      }

      messagesWithDividers.push({ type: "message", message, isGrouped });
    });
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-center">
            {pmMode
              ? "No messages yet. Waiting for the vendor to start the negotiation."
              : "No messages yet. Send a message to start the negotiation."}
          </p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {messagesWithDividers.map((item, idx) => {
            if (item.type === "divider") {
              const strategyInfo = roundStrategyInfo?.[item.round];
              const hasStrategy = strategyInfo?.strategy;
              const hasUtility = strategyInfo?.utility != null;
              const statusColor = strategyInfo?.isConverging
                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                : strategyInfo?.isStalling
                ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
                : strategyInfo?.isDiverging
                ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                : 'border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface';

              return (
                <div
                  key={`divider-${item.round}-${idx}`}
                  className="flex items-center justify-center my-4"
                >
                  <span className={`px-3 pt-1 pb-0 text-xs font-semibold text-gray-600 dark:text-dark-text-secondary border rounded-full ${statusColor}`}>
                    Round {item.round}
                    {hasStrategy && (
                      <span className="text-gray-400 dark:text-gray-500"> · </span>
                    )}
                    {hasStrategy && (
                      <span className={
                        strategyInfo.isConverging ? 'text-green-600 dark:text-green-400'
                        : strategyInfo.isStalling ? 'text-yellow-600 dark:text-yellow-400'
                        : strategyInfo.isDiverging ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                      }>
                        {strategyInfo.strategy}
                      </span>
                    )}
                    {hasUtility && (
                      <>
                        <span className="text-gray-400 dark:text-gray-500"> · </span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {Math.round(strategyInfo.utility! * 100)}% Utility
                        </span>
                      </>
                    )}
                  </span>
                </div>
              );
            }
            // Use message.id if available, fallback to index for robustness
            const messageKey = item.message?.id || `msg-${idx}-${item.message?.createdAt || idx}`;
            return (
              <MessageBubble
                key={messageKey}
                message={item.message}
                isGrouped={item.isGrouped}
                vendorMode={vendorMode}
                pmMode={pmMode}
              />
            );
          })}
          {isProcessing && (
            <div
              className={`flex w-full px-4 mb-2 ${
                pmMode
                  ? (processingType === "vendor-typing" ? "justify-end" : "justify-start")
                  : (processingType === "vendor-typing" ? "justify-start" : "justify-end")
              }`}
            >
              <div
                className={`px-4 pt-3 pb-0 rounded-lg ${
                  pmMode
                    ? (processingType === "vendor-typing" ? "bg-white border border-gray-200" : "bg-blue-50 border border-blue-200")
                    : (processingType === "vendor-typing" ? "bg-white border border-gray-200" : "bg-blue-50 border border-blue-200")
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {pmMode
                      ? (processingType === "vendor-typing" ? "Vendor is typing..." : "AI Negotiator is responding...")
                      : (processingType === "vendor-typing"
                          ? (vendorMode ? "You're typing..." : "Vendor typing...")
                          : (vendorMode ? "AI Buyer is responding..." : "Accordo is analyzing..."))}
                  </span>
                  <span className="flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
                      .
                    </span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
                      .
                    </span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
                      .
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
