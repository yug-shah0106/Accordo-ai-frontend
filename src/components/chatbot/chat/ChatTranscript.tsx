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
  round?: number;
  isGrouped: boolean;
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
 */

interface ChatTranscriptProps {
  messages: Message[];
  isProcessing?: boolean;
  processingType?: ProcessingType;
  vendorMode?: boolean;  // When true, shows vendor-perspective labels
}

export default function ChatTranscript({
  messages,
  isProcessing = false,
  processingType = "analyzing",
  vendorMode = false,
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
  useEffect(() => {
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing, isNearBottom]);

  // Calculate round number for each Accordo message
  const getRoundForMessage = (message: Message, index: number): number | undefined => {
    if (message.role === "ACCORDO" && message.engineDecision) {
      const previousAccordo = messages.slice(0, index).filter(
        (m) => m.role === "ACCORDO" && m.engineDecision
      );
      return previousAccordo.length + 1;
    }
    return undefined;
  };

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

  // Add round dividers
  const messagesWithDividers: TranscriptItem[] = [];
  let lastRound: number | undefined = undefined;

  groupedMessages.forEach((group) => {
    group.messages.forEach((message, msgIdx) => {
      const index = messages.indexOf(message);
      const round = getRoundForMessage(message, index);
      const isGrouped = msgIdx > 0;

      // Add divider if round changed and this is an Accordo message
      if (round !== undefined && round !== lastRound && lastRound !== undefined) {
        messagesWithDividers.push({ type: "divider", round });
      }

      messagesWithDividers.push({ type: "message", message, round, isGrouped });
      if (round !== undefined) {
        lastRound = round;
      }
    });
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-center">
            No messages yet. Send a message to start the negotiation.
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
              return (
                <div
                  key={`divider-${item.round}-${idx}`}
                  className="flex items-center justify-center my-4"
                >
                  <span className="px-3 pt-1 pb-0 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-full">
                    Round {item.round}
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
                round={item.round}
                isGrouped={item.isGrouped}
                vendorMode={vendorMode}
              />
            );
          })}
          {isProcessing && (
            <div
              className={`flex w-full px-4 mb-2 ${
                processingType === "vendor-typing" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`px-4 pt-3 pb-0 rounded-lg ${
                  processingType === "vendor-typing"
                    ? "bg-white border border-gray-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {processingType === "vendor-typing"
                      ? (vendorMode ? "You're typing..." : "Vendor typing...")
                      : (vendorMode ? "AI Buyer is responding..." : "Accordo is analyzing...")}
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
