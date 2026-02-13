import { Brain, Users, FileText, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Driven Negotiation Strategies",
    description:
      "Harness the power of machine learning to automate and optimize negotiation tactics. Our AI understands complex bargaining scenarios and adapts in real-time to secure the best outcomes for your organization.",
    bullets: [
      "Utility-based decision engine with explainability",
      "Real-time strategy adaptation per vendor",
      "Automated offer parsing and counter-proposals",
    ],
  },
  {
    icon: Users,
    title: "Multi-Vendor Management",
    description:
      "Manage thousands of vendor negotiations simultaneously from a single dashboard. Compare bids, track progress, and ensure consistent procurement standards across your entire supply chain.",
    bullets: [
      "Centralized vendor dashboard and analytics",
      "Simultaneous parallel negotiations",
      "Automated bid comparison and ranking",
    ],
  },
  {
    icon: FileText,
    title: "Instant Contract Generation",
    description:
      "Automate contract creation in real time. Once terms are agreed upon, generate compliant procurement contracts instantly — minimizing errors and accelerating your deal cycle from weeks to hours.",
    bullets: [
      "AI-assisted legal document generation",
      "Template-based contract workflows",
      "Compliance-ready output with audit trails",
    ],
  },
  {
    icon: BarChart3,
    title: "Real-Time Bid Analysis",
    description:
      "Make data-driven procurement decisions with comprehensive bid analysis. Evaluate vendors across multiple dimensions, identify the best offers, and track your savings with powerful analytics.",
    bullets: [
      "Multi-criteria vendor evaluation",
      "Automated top-bid identification",
      "Historical negotiation pattern insights",
    ],
  },
];

const Features = () => {
  return (
    <section id="features" className="landing-section bg-white">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 scroll-reveal" data-reveal="fade-up">
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="landing-heading mb-5">
            Everything You Need to Transform Procurement
          </h2>
          <p className="landing-subheading mx-auto font-Inter">
            From AI-powered negotiations to real-time analytics, Accordo AI gives 
            your procurement team the tools to close better deals, faster.
          </p>
        </div>

        {/* Alternating Feature Blocks */}
        <div className="space-y-20 md:space-y-28">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={feature.title}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  isReversed ? "lg:direction-rtl" : ""
                }`}
              >
                {/* Text Content */}
                <div
                  className={`${isReversed ? "lg:order-2" : "lg:order-1"} scroll-reveal`}
                  data-reveal={isReversed ? "fade-left" : "fade-right"}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
                      Feature {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-landing-text mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-landing-text-secondary leading-relaxed mb-6 font-Inter">
                    {feature.description}
                  </p>

                  <ul className="space-y-3">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
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
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual / Illustration */}
                <div
                  className={`${isReversed ? "lg:order-1" : "lg:order-2"} scroll-reveal`}
                  data-reveal={isReversed ? "fade-right" : "fade-left"}
                  data-reveal-delay="100"
                >
                  <div className="relative">
                    <div className="bg-landing-bg-section rounded-2xl border border-landing-border p-8 md:p-12">
                      <div className="bg-white rounded-xl shadow-sm border border-landing-border overflow-hidden">
                        {/* Mini dashboard visual per feature */}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                              <div className="h-3 w-28 bg-landing-bg-section rounded" />
                              <div className="h-2 w-20 bg-landing-border-light rounded mt-1.5" />
                            </div>
                          </div>
                          {/* Feature-specific visual */}
                          {index === 0 && (
                            <div className="space-y-3">
                              {["Optimal", "Strong", "Moderate"].map((level, i) => (
                                <div key={level} className="flex items-center gap-3">
                                  <span className="text-xs text-landing-text-muted w-16 font-Inter">{level}</span>
                                  <div className="flex-1 bg-landing-bg-section rounded-full h-2.5">
                                    <div
                                      className="bg-primary-500 h-2.5 rounded-full transition-all"
                                      style={{ width: `${90 - i * 20}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-landing-text w-10 text-right font-Inter">
                                    {90 - i * 20}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {index === 1 && (
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { vendor: "Vendor A", status: "Active", amount: "$240K" },
                                { vendor: "Vendor B", status: "Pending", amount: "$185K" },
                                { vendor: "Vendor C", status: "Active", amount: "$320K" },
                                { vendor: "Vendor D", status: "Closed", amount: "$95K" },
                              ].map((v) => (
                                <div key={v.vendor} className="bg-landing-bg-alt rounded-lg p-3">
                                  <p className="text-xs font-semibold text-landing-text">{v.vendor}</p>
                                  <p className="text-[10px] text-landing-text-muted mt-0.5 font-Inter">{v.status} &middot; {v.amount}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {index === 2 && (
                            <div className="space-y-2">
                              <div className="bg-landing-bg-alt rounded-lg p-3 flex items-center gap-3" style={{ backgroundColor: '#F8FAFC' }}>
                                <FileText className="w-4 h-4" style={{ color: '#234BF3' }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate" style={{ color: '#0F172A' }}>Vendor_Agreement_v2.pdf</p>
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">Generated</span>
                              </div>
                              <div className="bg-landing-bg-alt rounded-lg p-3 flex items-center gap-3" style={{ backgroundColor: '#F8FAFC' }}>
                                <FileText className="w-4 h-4" style={{ color: '#5A78FA' }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate" style={{ color: '#0F172A' }}>Supply_Contract_Draft.pdf</p>
                                </div>
                                <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full whitespace-nowrap">In Review</span>
                              </div>
                              <div className="bg-landing-bg-alt rounded-lg p-3 flex items-center gap-3" style={{ backgroundColor: '#F8FAFC' }}>
                                <FileText className="w-4 h-4" style={{ color: '#8DA0FC' }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate" style={{ color: '#0F172A' }}>Procurement_Terms.pdf</p>
                                </div>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: '#1A3AD4', backgroundColor: '#EEF1FE' }}>Signed</span>
                              </div>
                            </div>
                          )}
                          {index === 3 && (
                            <div className="space-y-3">
                              <div className="flex items-end gap-1.5 h-20">
                                {[35, 55, 42, 68, 50, 75, 62, 80].map((h, i) => (
                                  <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, backgroundColor: '#D8DFFE' }}>
                                    <div className="w-full rounded-t h-full" style={{ height: `${60 + i * 5}%`, backgroundColor: '#234BF3', opacity: 0.7 }} />
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between">
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((month) => (
                                  <span key={month} className="text-xs font-Inter" style={{ color: '#475569' }}>{month}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Decorative dot */}
                    <div className="absolute -z-10 top-4 right-4 w-32 h-32 bg-primary-100/50 rounded-full blur-2xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
