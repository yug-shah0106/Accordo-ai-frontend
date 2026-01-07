import { useState, useRef, useEffect } from "react";
import type { DealStatus } from '../../../types';
import { chatbotService } from '../../../services/chatbot.service';

type ScenarioType = 'HARD' | 'MEDIUM' | 'SOFT' | 'WALK_AWAY';

// Fallback scenario messages (used when API fails or during loading)
const FALLBACK_SCENARIO_MESSAGES: Record<ScenarioType, string[]> = {
  HARD: [
    "We can do 95 Net 30",
    "Best I can offer is 93 Net 30",
    "Ok, final price: 92 Net 30",
    "This is our absolute limit: 91 Net 30",
  ],
  MEDIUM: [
    "We can do 92 Net 60",
    "How about 89 Net 60?",
    "We're open to 87 Net 90",
    "Final offer: 85 Net 90",
  ],
  SOFT: [
    "We can do 90 Net 60",
    "How about 88 Net 90?",
    "We're willing to go to 85 Net 90",
    "Final offer: 82 Net 90",
  ],
  WALK_AWAY: [
    "We can do 95 Net 30",
    "Best I can offer is 93 Net 30",
    "Our final offer is 110 Net 30 - take it or leave it",
    "Sorry, we can't go lower than 110",
  ],
};

// In-memory cache for scenario suggestions (key: `${dealId}-${round}`)
const scenarioCache = new Map<string, Record<ScenarioType, string[]>>();

/**
 * Composer Component
 * Message input with quick scenario chips
 */

interface ComposerProps {
  onSend: (message: string) => void;
  inputText: string;
  onInputChange: (text: string) => void;
  sending: boolean;
  dealStatus?: DealStatus;
  canSend?: boolean;
  dealId?: string;  // For fetching dynamic suggestions
  currentRound?: number;  // For cache key
}

export default function Composer({
  onSend,
  inputText,
  onInputChange,
  sending,
  dealStatus,
  canSend = true,
  dealId,
  currentRound = 0,
}: ComposerProps) {
  const [scenario, setScenario] = useState<ScenarioType>("HARD");
  const [scenarioMessages, setScenarioMessages] = useState<Record<ScenarioType, string[]>>(FALLBACK_SCENARIO_MESSAGES);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch dynamic scenario suggestions with caching and retry logic
  useEffect(() => {
    if (!dealId) {
      // No dealId, use fallback messages
      setScenarioMessages(FALLBACK_SCENARIO_MESSAGES);
      return;
    }

    const fetchSuggestions = async () => {
      const cacheKey = `${dealId}-${currentRound}`;

      // Check cache first
      const cached = scenarioCache.get(cacheKey);
      if (cached) {
        setScenarioMessages(cached);
        return;
      }

      // Fetch from API with retry logic
      setLoadingSuggestions(true);
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await chatbotService.getSuggestedCounters(dealId);
          const suggestions = response.data;

          // Cache the result
          scenarioCache.set(cacheKey, suggestions);
          setScenarioMessages(suggestions);
          setLoadingSuggestions(false);
          return;
        } catch (error) {
          lastError = error as Error;
          console.warn(`[Composer] Attempt ${attempt}/3 failed to fetch suggestions:`, error);

          if (attempt < 3) {
            // Exponential backoff: 1s, 2s
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed, use fallback
      console.error('[Composer] All retries failed, using fallback messages:', lastError);
      setScenarioMessages(FALLBACK_SCENARIO_MESSAGES);
      setLoadingSuggestions(false);
    };

    fetchSuggestions();
  }, [dealId, currentRound]);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get proper scrollHeight
      textareaRef.current.style.height = 'auto';
      // Calculate new height (min 1 line, max 5 lines)
      const lineHeight = 24; // approximate line height in pixels
      const minHeight = lineHeight * 1;
      const maxHeight = lineHeight * 5;
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !sending) {
        onSend(inputText);
      }
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4 pb-6 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        {/* Scenario Chips */}
      <div className="mb-3 space-y-2">
        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Scenario:</span>
          {(["HARD", "MEDIUM", "SOFT", "WALK_AWAY"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                scenario === s
                  ? s === "HARD"
                    ? "bg-red-600 text-white"
                    : s === "MEDIUM"
                    ? "bg-orange-500 text-white"
                    : s === "SOFT"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              disabled={sending}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Quick Message Chips */}
        <div className="flex flex-wrap gap-2">
          {loadingSuggestions ? (
            // Skeleton loading with shimmer effect
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded"
                  style={{ width: `${80 + i * 15}px`, height: '28px' }}
                >
                  <div className="h-3 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ))}
            </>
          ) : (
            // Actual suggestion chips
            scenarioMessages[scenario]?.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => onSend(msg)}
                disabled={sending || !canSend}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {msg.substring(0, 25)}
                {msg.length > 25 ? "..." : ""}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Input Row */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            !canSend && dealStatus === "ESCALATED"
              ? "Deal is Escalated. Reset or Resume."
              : !canSend
              ? "Deal is closed"
              : "Type vendor message..."
          }
          disabled={sending || !canSend}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none overflow-y-auto"
          rows={1}
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        <button
          onClick={() => onSend(inputText)}
          disabled={sending || !inputText.trim() || !canSend}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
