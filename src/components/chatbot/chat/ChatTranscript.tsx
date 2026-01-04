import { useEffect, useRef } from "react";
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
 * Displays chat messages with auto-scroll and processing indicator
 */

interface ChatTranscriptProps {
  messages: Message[];
  isProcessing?: boolean;
  processingType?: ProcessingType;
}

export default function ChatTranscript({
  messages,
  isProcessing = false,
  processingType = "analyzing",
}: ChatTranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

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
    if (msgs.length === 0) return [];

    const grouped: MessageGroup[] = [];
    let currentGroup: Message[] = [msgs[0]];
    let currentRole: MessageRole = msgs[0].role;

    for (let i = 1; i < msgs.length; i++) {
      if (msgs[i].role === currentRole) {
        currentGroup.push(msgs[i]);
      } else {
        grouped.push({ messages: currentGroup, role: currentRole });
        currentGroup = [msgs[i]];
        currentRole = msgs[i].role;
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
        <div className="flex-1 overflow-y-auto">
          {messagesWithDividers.map((item, idx) => {
            if (item.type === "divider") {
              return (
                <div
                  key={`divider-${item.round}-${idx}`}
                  className="flex items-center justify-center my-4"
                >
                  <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-full">
                    Round {item.round}
                  </span>
                </div>
              );
            }
            return (
              <MessageBubble
                key={item.message.id}
                message={item.message}
                round={item.round}
                isGrouped={item.isGrouped}
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
                className={`px-4 py-3 rounded-lg ${
                  processingType === "vendor-typing"
                    ? "bg-white border border-gray-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {processingType === "vendor-typing"
                      ? "Vendor typing..."
                      : "Accordo is analyzing..."}
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
