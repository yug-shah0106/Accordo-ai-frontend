import { useState } from "react";
import type { DealStatus } from '../../../types';

type ScenarioType = 'HARD' | 'SOFT' | 'WALK_AWAY';

const SCENARIO_MESSAGES: Record<ScenarioType, string[]> = {
  HARD: [
    "We can do 95 Net 30",
    "Best I can offer is Net 60",
    "Ok, we can do 93 Net 60",
    "Our final offer is 110 Net 30",
  ],
  SOFT: [
    "We can do 90 Net 60",
    "How about 88 Net 90?",
    "We're willing to go to 85 Net 90",
    "Final offer: 82 Net 90",
  ],
  WALK_AWAY: [
    "We can do 95 Net 30",
    "Best I can offer is Net 60",
    "Ok, we can do 93 Net 60",
    "Our final offer is 110 Net 30 - take it or leave it",
  ],
};

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
}

export default function Composer({
  onSend,
  inputText,
  onInputChange,
  sending,
  dealStatus,
  canSend = true,
}: ComposerProps) {
  const [scenario, setScenario] = useState<ScenarioType>("HARD");
  const scenarioMessages = SCENARIO_MESSAGES[scenario] || SCENARIO_MESSAGES.HARD;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !sending) {
        onSend(inputText);
      }
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Scenario Chips */}
      <div className="mb-3 space-y-2">
        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Scenario:</span>
          {(["HARD", "SOFT", "WALK_AWAY"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                scenario === s
                  ? "bg-blue-600 text-white"
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
          {scenarioMessages.map((msg, idx) => (
            <button
              key={idx}
              onClick={() => onSend(msg)}
              disabled={sending || !canSend}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {msg.substring(0, 25)}
              {msg.length > 25 ? "..." : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Input Row */}
      <div className="flex gap-2">
        <input
          type="text"
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
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => onSend(inputText)}
          disabled={sending || !inputText.trim() || !canSend}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
