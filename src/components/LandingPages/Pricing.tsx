import { Check, ArrowRight } from "lucide-react";

const features = [
  "Unlimited AI-powered negotiations",
  "Multi-vendor management dashboard",
  "Real-time bid analysis and comparison",
  "Automated contract generation",
  "Vendor portal with chat interface",
  "Advanced analytics and reporting",
  "Role-based access control",
  "Dedicated onboarding and support",
  "Custom integrations via API",
  "SOC 2 compliant data handling",
];

const Pricing = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="landing-section bg-white">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal" data-reveal="fade-up">
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="landing-heading mb-5">
            Enterprise-Grade Pricing
          </h2>
          <p className="landing-subheading mx-auto font-Inter">
            Tailored pricing for your organization's procurement needs. Get a
            custom quote based on your negotiation volume and requirements.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-2xl mx-auto scroll-reveal" data-reveal="fade-up" data-reveal-delay="100">
          <div className="relative bg-gradient-to-br from-landing-bg-alt to-white rounded-3xl border border-landing-border overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-blue-500" />

            <div className="p-8 md:p-12">
              {/* Enterprise badge */}
              <div className="flex items-center justify-center mb-8">
                <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-sm font-semibold px-4 py-2 rounded-full border border-primary-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Enterprise Plan
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-landing-text text-center mb-3 tracking-tight">
                Custom Pricing for Your Organization
              </h3>
              <p className="text-landing-text-secondary text-center mb-10 max-w-lg mx-auto font-Inter">
                Every enterprise has unique procurement needs. We'll build a plan
                that fits your volume, integrations, and team size — with ROI
                typically visible within the first month.
              </p>

              {/* Features grid */}
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-10">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-500" />
                    </div>
                    <span className="text-sm text-landing-text-secondary font-Inter">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => scrollToSection("#final-cta")}
                  className="btn-primary flex items-center gap-2 text-base !py-3.5 !px-10"
                >
                  Contact Sales
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-sm text-landing-text-muted font-Inter">
                  Response within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
