/**
 * DemoScenarios Page
 * Provides autopilot demo buttons for HARD, SOFT, WALK_AWAY scenarios
 * with deal selection and real-time progress tracking
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { chatbotService } from '../../services/chatbot.service';
import type { DemoScenarioType, Deal, Message } from '../../types';

interface DemoScenario {
  type: DemoScenarioType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface DemoResults {
  deal: Deal;
  messages: Message[];
  steps: Array<{
    vendorMessage: Message;
    accordoMessage: Message;
    round: number;
  }>;
  finalStatus: string;
  totalRounds: number;
  finalUtility: number | null;
}

const scenarios: DemoScenario[] = [
  {
    type: 'SOFT',
    title: 'Soft Negotiation',
    description: 'Vendor is flexible and willing to negotiate. Watch as Accordo secures favorable terms through strategic concessions.',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
  },
  {
    type: 'HARD',
    title: 'Hard Negotiation',
    description: 'Vendor has minimal flexibility. See how Accordo navigates tough negotiations with calculated moves.',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
  },
  {
    type: 'WALK_AWAY',
    title: 'Walk Away Scenario',
    description: 'Vendor cannot meet requirements. Observe how Accordo recognizes deal-breakers and walks away gracefully.',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
  },
];

export default function DemoScenarios() {
  const navigate = useNavigate();

  // State management
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenarioType>('SOFT');
  const [isRunning, setIsRunning] = useState(false);
  const [demoResults, setDemoResults] = useState<DemoResults | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch negotiating deals on mount
  useEffect(() => {
    fetchNegotiatingDeals();
  }, []);

  const fetchNegotiatingDeals = async () => {
    try {
      setLoadingDeals(true);
      setError(null);
      const response = await chatbotService.listDeals({
        status: 'NEGOTIATING',
        limit: 100
      });
      setDeals(response.data.deals);

      // Auto-select first deal if available
      if (response.data.deals.length > 0 && !selectedDeal) {
        setSelectedDeal(response.data.deals[0].id);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load deals';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error fetching deals:', err);
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleRunDemo = async () => {
    if (!selectedDeal) {
      toast.error('Please select a deal to run the demo');
      return;
    }

    try {
      setIsRunning(true);
      setDemoResults(null);
      setCurrentStep(0);
      setError(null);

      toast.loading('Starting demo...', { id: 'demo-toast' });

      const response = await chatbotService.runDemo(selectedDeal, selectedScenario, 10);

      setDemoResults(response.data);
      setCurrentStep(response.data.steps.length);

      const utilityDisplay = response.data.finalUtility !== null
        ? ` (Utility: ${(response.data.finalUtility * 100).toFixed(0)}%)`
        : '';

      toast.success(
        `Demo completed!\nStatus: ${response.data.finalStatus}\nRounds: ${response.data.totalRounds}${utilityDisplay}`,
        { id: 'demo-toast', duration: 5000 }
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to run demo';
      setError(errorMsg);
      toast.error(errorMsg, { id: 'demo-toast' });
      console.error('Demo error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleScenarioSelect = (scenarioType: DemoScenarioType) => {
    setSelectedScenario(scenarioType);
    setDemoResults(null);
    setCurrentStep(0);
  };

  const handleViewDeal = () => {
    if (selectedDeal) {
      navigate(`/chatbot/deals/${selectedDeal}`);
    }
  };

  return (
    <div className="h-full bg-gray-50 pt-6 px-6 pb-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Scenarios</h1>
          <p className="text-gray-600">
            Run automated negotiation scenarios to see Accordo AI in action. Each scenario demonstrates
            different negotiation patterns and decision-making strategies.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg pt-4 px-4 pb-0 mb-8">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">About Demo Mode</h3>
              <p className="text-sm text-blue-800">
                Demo scenarios run in autopilot mode with pre-configured vendor responses. This allows you to
                see the full negotiation flow without manual input. Each scenario typically completes in 3-5 rounds.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scenario Selection & Deal Selector */}
          <div className="lg:col-span-1 space-y-6">
            {/* Deal Selector */}
            <div className="bg-white border border-gray-200 rounded-lg pt-5 px-5 pb-0 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Deal</h3>

              {loadingDeals ? (
                <div className="flex items-center justify-center pt-8 pb-0">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : deals.length === 0 ? (
                <div className="text-center pt-6 pb-0">
                  <p className="text-sm text-gray-600 mb-4">No negotiating deals available</p>
                  <button
                    onClick={() => navigate('/chatbot/deals/new')}
                    className="px-4 pt-2 pb-0 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Create New Deal
                  </button>
                </div>
              ) : (
                <select
                  value={selectedDeal || ''}
                  onChange={(e) => setSelectedDeal(e.target.value)}
                  className="w-full px-3 pt-2 pb-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title} (Round {deal.round})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Scenario Cards */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Scenario Type</h3>
              {scenarios.map((scenario) => (
                <button
                  key={scenario.type}
                  onClick={() => handleScenarioSelect(scenario.type)}
                  disabled={isRunning}
                  className={`w-full text-left rounded-lg border-2 pt-4 px-4 pb-0 transition-all duration-200 ${
                    selectedScenario === scenario.type
                      ? `${scenario.borderColor} ${scenario.bgColor} shadow-md`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <h4 className={`text-sm font-bold mb-1 ${selectedScenario === scenario.type ? scenario.color : 'text-gray-900'}`}>
                    {scenario.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {scenario.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Run Demo Button */}
            <button
              onClick={handleRunDemo}
              disabled={isRunning || !selectedDeal}
              className={`w-full pt-3 pb-0 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isRunning || !selectedDeal
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md'
              }`}
            >
              {isRunning ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Running Demo...
                </span>
              ) : (
                `Run ${selectedScenario} Demo`
              )}
            </button>
          </div>

          {/* Right Column: Progress & Results Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[500px]">
              {demoResults ? (
                /* Results View */
                <div className="p-6">
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-6 pb-0 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Demo Results</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedScenario} Scenario - {demoResults.totalRounds} rounds completed
                      </p>
                    </div>
                    <button
                      onClick={handleViewDeal}
                      className="px-4 pt-2 pb-0 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      View Deal
                    </button>
                  </div>

                  {/* Final Status */}
                  <div className={`rounded-lg pt-4 px-4 pb-0 mb-6 ${
                    demoResults.finalStatus === 'ACCEPTED'
                      ? 'bg-green-50 border border-green-200'
                      : demoResults.finalStatus === 'WALKED_AWAY'
                      ? 'bg-red-50 border border-red-200'
                      : demoResults.finalStatus === 'ESCALATED'
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Final Status</h4>
                        <p className={`text-2xl font-bold ${
                          demoResults.finalStatus === 'ACCEPTED'
                            ? 'text-green-700'
                            : demoResults.finalStatus === 'WALKED_AWAY'
                            ? 'text-red-700'
                            : demoResults.finalStatus === 'ESCALATED'
                            ? 'text-orange-700'
                            : 'text-gray-700'
                        }`}>
                          {demoResults.finalStatus}
                        </p>
                      </div>
                      {demoResults.finalUtility !== null && (
                        <div className="text-right">
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">Final Utility</h4>
                          <p className="text-2xl font-bold text-purple-700">
                            {(demoResults.finalUtility * 100).toFixed(0)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transcript Replay */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Negotiation Transcript</h4>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {demoResults.steps.map((step, idx) => (
                        <div key={idx} className="border-l-4 border-blue-300 pl-4 pt-2 pb-0">
                          <div className="text-xs font-semibold text-gray-500 mb-2">Round {step.round}</div>

                          {/* Vendor Message */}
                          <div className="mb-3 bg-gray-50 rounded-lg pt-3 px-3 pb-0">
                            <div className="text-xs font-medium text-gray-600 mb-1">Vendor</div>
                            <p className="text-sm text-gray-800">{step.vendorMessage.content}</p>
                            {step.vendorMessage.extractedOffer && (
                              <div className="mt-2 text-xs text-gray-600">
                                Offer: ${step.vendorMessage.extractedOffer.unit_price} • {step.vendorMessage.extractedOffer.payment_terms}
                              </div>
                            )}
                          </div>

                          {/* Accordo Response */}
                          <div className="bg-blue-50 rounded-lg pt-3 px-3 pb-0">
                            <div className="text-xs font-medium text-blue-700 mb-1">Accordo</div>
                            {step.accordoMessage.engineDecision && (
                              <div className="mb-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                  step.accordoMessage.engineDecision.action === 'ACCEPT'
                                    ? 'bg-green-100 text-green-700'
                                    : step.accordoMessage.engineDecision.action === 'COUNTER'
                                    ? 'bg-blue-100 text-blue-700'
                                    : step.accordoMessage.engineDecision.action === 'WALK_AWAY'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {step.accordoMessage.engineDecision.action}
                                </span>
                                {step.accordoMessage.utilityScore !== null && (
                                  <span className="ml-2 text-xs text-gray-600">
                                    Utility: {(step.accordoMessage.utilityScore * 100).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-sm text-gray-800">{step.accordoMessage.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isRunning ? (
                /* Running State */
                <div className="flex flex-col items-center justify-center h-full pt-20 pb-0">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Running Demo...</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Simulating {selectedScenario} negotiation scenario
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    <span>Processing vendor responses</span>
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full pt-20 pb-0 text-center px-6">
                  <svg className="w-20 h-20 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Demo Running</h3>
                  <p className="text-sm text-gray-600 max-w-md">
                    Select a deal and scenario type, then click "Run Demo" to start an automated negotiation simulation.
                  </p>
                </div>
              )}

              {error && (
                <div className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-lg pt-4 px-4 pb-0">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 pt-6 px-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Soft Negotiation</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vendor starts with reasonable offer</li>
                <li>• Quick convergence to target price</li>
                <li>• Deal typically accepted in 2-3 rounds</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Hard Negotiation</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vendor starts with high price</li>
                <li>• Multiple counter-offers required</li>
                <li>• May require 4-5 rounds to reach agreement</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Walk Away</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vendor exceeds max acceptable price</li>
                <li>• Accordo identifies deal-breaker early</li>
                <li>• Negotiation ends with WALK_AWAY decision</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time utility score calculation</li>
                <li>• Decision explainability at each step</li>
                <li>• Full audit trail of all negotiations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
