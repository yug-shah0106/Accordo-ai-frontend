/**
 * AboutPage
 * Explain the negotiation system
 */

export default function AboutPage() {
  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-0">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What is Accordo.ai?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered negotiation agent that scales your procurement negotiations
          </p>
        </div>

        {/* Demo Video Placeholder */}
        <div className="bg-gray-800 rounded-lg aspect-video mb-12 flex items-center justify-center">
          <div className="text-center text-white">
            <svg
              className="w-20 h-20 mx-auto mb-4 opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-lg font-medium mb-1">30-second demo video</p>
            <p className="text-sm text-gray-400">(Placeholder for demo video)</p>
          </div>
        </div>

        {/* Main Content Blocks */}
        <div className="space-y-8">
          {/* Problem Block */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm pt-8 px-8 pb-0">
            <h2 className="text-2xl font-bold text-red-600 mb-2">The Problem</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Negotiations Don't Scale
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Procurement teams spend countless hours negotiating with vendors—reviewing offers,
              calculating trade-offs, and crafting responses. As your business grows, the volume
              of negotiations becomes overwhelming.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span>Manual negotiations are time-consuming and inconsistent</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span>Human negotiators can't handle high-volume deals simultaneously</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span>Key terms get missed or overlooked in fast-paced negotiations</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span>No systematic way to enforce business policies across all deals</span>
              </li>
            </ul>
          </div>

          {/* Solution Block */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm pt-8 px-8 pb-0">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">The Solution</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Policy-Controlled Negotiation Agent
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Accordo.ai is an AI agent that negotiates on your behalf, following your business
              policies and guardrails. It scales to handle unlimited negotiations simultaneously
              while maintaining consistency and compliance.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">✓</span>
                <span>Automated negotiation that works 24/7</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">✓</span>
                <span>Policy-driven decisions based on your business rules</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">✓</span>
                <span>Consistent application of guardrails across all deals</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">✓</span>
                <span>Full audit trail of every decision and counter-offer</span>
              </li>
            </ul>
          </div>

          {/* How It Works Block */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm pt-8 px-8 pb-0">
            <h2 className="text-2xl font-bold text-green-600 mb-2">How It Works</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Extract • Evaluate • Counter • Audit
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold text-lg">1</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Extract</h4>
                  <p className="text-gray-700">
                    Parse vendor messages to extract key terms: unit price, payment terms,
                    and conditions using NLP and structured extraction.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold text-lg">2</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Evaluate</h4>
                  <p className="text-gray-700">
                    Calculate utility scores based on your policy (anchor, target, max acceptable)
                    and determine if the offer meets your thresholds.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold text-lg">3</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Counter</h4>
                  <p className="text-gray-700">
                    Generate intelligent counter-offers using LLMs, following your concession
                    strategy and maintaining professional communication.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold text-lg">4</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Audit</h4>
                  <p className="text-gray-700">
                    Track every decision, offer, and response with full transparency. Review
                    negotiation summaries and understand why each decision was made.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Block */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm pt-8 px-8 pb-0">
            <h2 className="text-2xl font-bold text-purple-600 mb-2">Why It's Safe</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Guardrails + Human Approval (Future)
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Accordo.ai is built with safety and control at its core. Every decision is
              constrained by your business policies, and you maintain full visibility and control.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-purple-200 rounded-lg pt-4 px-4 pb-0">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Policy Guardrails</h4>
                <p className="text-gray-700 text-sm">
                  Hard limits on acceptable terms (e.g., max price, minimum payment terms).
                  The agent cannot exceed these boundaries.
                </p>
              </div>

              <div className="border border-purple-200 rounded-lg pt-4 px-4 pb-0">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Utility Thresholds</h4>
                <p className="text-gray-700 text-sm">
                  Automatic acceptance/walk-away thresholds based on calculated utility scores.
                  No decisions outside your defined parameters.
                </p>
              </div>

              <div className="border border-purple-200 rounded-lg pt-4 px-4 pb-0">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Full Transparency</h4>
                <p className="text-gray-700 text-sm">
                  Every decision is logged with reasoning. Review why the agent accepted,
                  countered, or walked away from any offer.
                </p>
              </div>

              <div className="border border-purple-200 rounded-lg pt-4 px-4 pb-0">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Human Approval (Future)</h4>
                <p className="text-gray-700 text-sm">
                  Optional human-in-the-loop approval for high-value deals or when guardrails
                  are triggered. You stay in control.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg pt-8 px-8 pb-0 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to see it in action?</h2>
          <p className="text-lg mb-6 opacity-90">
            Create a deal and watch Accordo.ai negotiate on your behalf.
          </p>
          <button
            onClick={() => window.location.href = '/chatbot/deals/new'}
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Create Your First Deal
          </button>
        </div>
      </div>
    </div>
  );
}
