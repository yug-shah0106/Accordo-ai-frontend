import { useState } from "react";
import { Settings, MessageSquare, BarChart3, CheckCircle } from "lucide-react";

const steps = [
  {
    id: "setup",
    label: "Setup",
    icon: Settings,
    title: "Configure Your Negotiation Parameters",
    description:
      "Define your procurement requirements, set target prices, acceptable ranges, and negotiation priorities. Upload your RFQs and attach vendors — Accordo AI handles the rest.",
    details: [
      "Import existing requisitions or create new ones",
      "Set negotiation boundaries and priorities",
      "Attach vendors and define deal parameters",
      "Configure AI negotiation strategy per vendor",
    ],
    visual: {
      header: "Negotiation Setup",
      items: [
        { label: "Target Price", value: "$45,000", type: "input" },
        { label: "Walk-Away Price", value: "$52,000", type: "input" },
        { label: "Priority", value: "Cost > Quality > Delivery", type: "select" },
        { label: "Strategy", value: "Collaborative", type: "badge" },
      ],
    },
  },
  {
    id: "negotiate",
    label: "Negotiate",
    icon: MessageSquare,
    title: "AI Conducts Negotiations Autonomously",
    description:
      "Accordo AI engages with each vendor simultaneously, conducting multi-round negotiations using advanced LLM-powered conversations and utility-based decision making.",
    details: [
      "Simultaneous multi-vendor negotiations",
      "LLM-powered natural language conversations",
      "Real-time offer parsing and counter-proposals",
      "Automated escalation for edge cases",
    ],
    visual: {
      header: "Live Negotiation",
      messages: [
        { sender: "AI", text: "Based on your requirements, we'd like to propose $47,500 with expedited delivery.", align: "left" },
        { sender: "Vendor", text: "We can do $49,000 with 2-week delivery. Can we discuss volume discounts?", align: "right" },
        { sender: "AI", text: "For a volume of 500+ units, would you consider $46,800 with standard delivery terms?", align: "left" },
      ],
    },
  },
  {
    id: "analyze",
    label: "Analyze",
    icon: BarChart3,
    title: "Compare Bids and Analyze Outcomes",
    description:
      "Review comprehensive bid comparisons across all vendors. The AI provides explainability for every decision, helping you understand why certain offers are ranked higher.",
    details: [
      "Multi-criteria bid comparison dashboard",
      "AI-powered explainability for each decision",
      "Historical pattern analysis and benchmarking",
      "Savings projections and ROI calculations",
    ],
    visual: {
      header: "Bid Analysis",
      bids: [
        { vendor: "Vendor A", price: "$46,800", score: 92, status: "Recommended" },
        { vendor: "Vendor B", price: "$48,200", score: 85, status: "Strong" },
        { vendor: "Vendor C", price: "$51,000", score: 74, status: "Consider" },
      ],
    },
  },
  {
    id: "close",
    label: "Close",
    icon: CheckCircle,
    title: "Finalize Deals and Generate Contracts",
    description:
      "Accept the best offers, generate contracts automatically, and notify all parties. Track your total savings and procurement metrics from a unified dashboard.",
    details: [
      "One-click deal acceptance and rejection",
      "Automated contract generation",
      "Vendor notification and onboarding",
      "Savings tracking and reporting",
    ],
    visual: {
      header: "Deal Summary",
      metrics: [
        { label: "Total Savings", value: "$284,500" },
        { label: "Deals Closed", value: "47" },
        { label: "Avg. Discount", value: "12.4%" },
        { label: "Time Saved", value: "340 hrs" },
      ],
    },
  },
];

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("setup");
  const activeStep = steps.find((s) => s.id === activeTab) || steps[0];
  const ActiveIcon = activeStep.icon;

  return (
    <section id="how-it-works" className="landing-section bg-landing-bg-alt">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 scroll-reveal" data-reveal="fade-up">
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="landing-heading mb-5">
            From Setup to Savings in Four Steps
          </h2>
          <p className="landing-subheading mx-auto font-Inter">
            Accordo AI streamlines your entire procurement negotiation workflow
            into a simple, automated process.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12 scroll-reveal" data-reveal="fade-up" data-reveal-delay="100">
          <div className="inline-flex bg-white rounded-xl border border-landing-border p-1.5 shadow-sm">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === activeTab;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-500 text-white shadow-sm"
                      : "text-landing-text-secondary hover:text-landing-text hover:bg-landing-bg-alt"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: '#234BF3', color: '#ffffff' }
                      : { color: '#475569' }
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start scroll-reveal" data-reveal="fade-up" data-reveal-delay="200">
          {/* Left: Description */}
          <div className="lg:pt-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <ActiveIcon className="w-6 h-6 text-primary-500" />
              </div>
              <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
                Step {steps.findIndex((s) => s.id === activeTab) + 1} of {steps.length}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-landing-text mb-4 tracking-tight">
              {activeStep.title}
            </h3>
            <p className="text-landing-text-secondary leading-relaxed mb-8 font-Inter">
              {activeStep.description}
            </p>

            <ul className="space-y-3">
              {activeStep.details.map((detail) => (
                <li key={detail} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-landing-text-secondary font-Inter">
                    {detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Visual */}
          <div>
            <div className="bg-white rounded-2xl border border-landing-border shadow-sm overflow-hidden">
              {/* Visual header */}
              <div className="flex items-center gap-2 px-5 py-3 bg-landing-bg-alt border-b border-landing-border">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                </div>
                <span className="text-xs text-landing-text-muted ml-2 font-Inter">
                  {activeStep.visual.header}
                </span>
              </div>

              <div className="p-6">
                {/* Setup visual */}
                {activeTab === "setup" && (
                  <div className="space-y-4">
                    {activeStep.visual.items?.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <label className="text-sm text-landing-text-secondary font-Inter">
                          {item.label}
                        </label>
                        {item.type === "badge" ? (
                          <span className="text-xs font-medium bg-primary-50 text-primary-600 px-3 py-1 rounded-full">
                            {item.value}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-landing-text bg-landing-bg-alt px-4 py-1.5 rounded-lg border border-landing-border">
                            {item.value}
                          </span>
                        )}
                      </div>
                    ))}
                    <div className="pt-3">
                      <div className="w-full bg-primary-500 text-white text-sm font-medium py-2.5 rounded-lg text-center">
                        Start Negotiation
                      </div>
                    </div>
                  </div>
                )}

                {/* Negotiate visual */}
                {activeTab === "negotiate" && (
                  <div className="space-y-3">
                    {activeStep.visual.messages?.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.align === "right" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm font-Inter ${
                            msg.align === "left"
                              ? "bg-primary-50 text-landing-text"
                              : "bg-landing-bg-section text-landing-text"
                          }`}
                        >
                          <p className="text-[10px] font-semibold text-landing-text-muted mb-1">
                            {msg.sender}
                          </p>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 bg-landing-bg-alt rounded-lg px-4 py-2 text-sm text-landing-text-muted border border-landing-border font-Inter">
                        AI is negotiating...
                      </div>
                      <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Analyze visual */}
                {activeTab === "analyze" && (
                  <div className="space-y-3">
                    {activeStep.visual.bids?.map((bid) => (
                      <div
                        key={bid.vendor}
                        className="flex items-center gap-4 bg-landing-bg-alt rounded-xl p-4 border border-landing-border-light"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-500">
                            {bid.vendor.split(" ")[1]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-landing-text">{bid.vendor}</p>
                          <p className="text-xs text-landing-text-muted font-Inter">{bid.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-landing-text">{bid.score}/100</p>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              bid.status === "Recommended"
                                ? "bg-green-50 text-green-600"
                                : bid.status === "Strong"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-yellow-50 text-yellow-600"
                            }`}
                          >
                            {bid.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Close visual */}
                {activeTab === "close" && (
                  <div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {activeStep.visual.metrics?.map((metric) => (
                        <div key={metric.label} className="bg-landing-bg-alt rounded-xl p-4 text-center border border-landing-border-light">
                          <p className="text-xl font-bold text-landing-text">{metric.value}</p>
                          <p className="text-xs text-landing-text-muted mt-1 font-Inter">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3 border border-green-100">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">All Deals Finalized</p>
                        <p className="text-xs text-green-600 font-Inter">
                          Contracts generated and sent to vendors
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
