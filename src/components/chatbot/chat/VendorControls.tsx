import { useState } from 'react';
import toast from 'react-hot-toast';
import { chatbotService } from '../../../services/chatbot.service';
import type { DealStatus } from '../../../types';

/**
 * VendorControls Component
 *
 * Controls for autopilot vendor simulation in demo mode.
 * Allows running single vendor turns or full automated demonstrations
 * with different negotiation scenarios (HARD, SOFT, WALK_AWAY).
 */

interface VendorControlsProps {
  rfqId: number;
  vendorId: number;
  dealId: string;
  dealStatus: DealStatus;
  currentRound: number;
  maxRounds: number;
  onUpdate: () => void; // Callback to refresh deal data
  disabled?: boolean;
}

type ScenarioType = 'SOFT' | 'HARD' | 'WALK_AWAY';

export default function VendorControls({
  rfqId,
  vendorId,
  dealId,
  dealStatus,
  currentRound,
  maxRounds,
  onUpdate,
  disabled = false,
}: VendorControlsProps) {
  // Build DealContext for service calls
  const ctx = { rfqId, vendorId, dealId };
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('SOFT');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNegotiating = dealStatus === 'NEGOTIATING';
  const isControlsDisabled = disabled || !isNegotiating || isRunning;

  /**
   * Handle single vendor turn (Auto Next)
   */
  const handleAutoNext = async () => {
    if (isControlsDisabled) return;

    try {
      setError(null);
      setIsRunning(true);

      const response = await chatbotService.generateVendorMessage(ctx, selectedScenario);

      if (response.data.completed) {
        const finalStatus = response.data.deal.status;
        toast.success(
          `Negotiation completed with status: ${finalStatus}`,
          { duration: 4000 }
        );
      } else {
        toast.success('Vendor turn processed successfully');
      }

      // Refresh deal data
      onUpdate();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to process vendor turn';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Handle full demo run (Run Full Demo)
   */
  const handleRunFullDemo = async () => {
    if (isControlsDisabled) return;

    // Confirm before running full demo
    const confirmed = window.confirm(
      `Run full ${selectedScenario} demo scenario?\n\nThis will simulate a complete negotiation with up to ${maxRounds} rounds.`
    );

    if (!confirmed) return;

    try {
      setError(null);
      setIsRunning(true);

      const response = await chatbotService.runDemo(ctx, selectedScenario, maxRounds);

      const { finalStatus, totalRounds, finalUtility } = response.data;

      // Show comprehensive success message
      const utilityDisplay = finalUtility !== null
        ? ` (Utility: ${(finalUtility * 100).toFixed(0)}%)`
        : '';

      toast.success(
        `Demo completed!\nStatus: ${finalStatus}\nRounds: ${totalRounds}${utilityDisplay}`,
        { duration: 5000 }
      );

      // Refresh deal data
      onUpdate();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to run demo';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Stop autopilot (currently just resets state)
   */
  const handleStop = () => {
    setIsRunning(false);
    toast.success('Demo stopped');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg pt-4 px-4 pb-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Vendor Autopilot</h3>
        {isRunning && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span className="text-xs text-gray-600">Running...</span>
          </div>
        )}
      </div>

      {/* Scenario Selector */}
      <div className="mb-4">
        <label htmlFor="scenario-select" className="block text-xs font-medium text-gray-700 mb-1">
          Negotiation Scenario
        </label>
        <select
          id="scenario-select"
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value as ScenarioType)}
          disabled={isControlsDisabled}
          className="w-full px-3 pt-2 pb-0 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="SOFT">Soft (Flexible vendor)</option>
          <option value="HARD">Hard (Tough negotiator)</option>
          <option value="WALK_AWAY">Walk Away (Unreasonable vendor)</option>
        </select>
      </div>

      {/* Progress Indicator */}
      {isNegotiating && (
        <div className="mb-4 bg-gray-50 rounded-lg pt-3 px-3 pb-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs text-gray-500">
              Round {currentRound} / {maxRounds}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentRound / maxRounds) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleAutoNext}
          disabled={isControlsDisabled}
          className="px-4 pt-2 pb-0 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Auto Next
        </button>
        <button
          onClick={handleRunFullDemo}
          disabled={isControlsDisabled}
          className="px-4 pt-2 pb-0 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Run Full Demo
        </button>
      </div>

      {/* Stop Button (only shown when running) */}
      {isRunning && (
        <button
          onClick={handleStop}
          className="w-full px-4 pt-2 pb-0 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
        >
          Stop Autopilot
        </button>
      )}

      {/* Status Messages */}
      {!isNegotiating && (
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg pt-3 px-3 pb-0">
          <p className="text-xs text-yellow-800">
            <span className="font-semibold">Status: {dealStatus}</span>
            <br />
            Autopilot controls are only available during active negotiations.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg pt-3 px-3 pb-0">
          <p className="text-xs text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Info Text */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Auto Next:</strong> Simulate a single vendor turn with the selected scenario.
          <br />
          <strong>Run Full Demo:</strong> Automatically play out the entire negotiation until completion.
        </p>
      </div>
    </div>
  );
}
