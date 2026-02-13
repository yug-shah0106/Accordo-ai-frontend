import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does Accordo AI conduct negotiations?",
    answer:
      "Accordo AI uses advanced LLM-powered conversation engines combined with utility-based decision algorithms. It operates in two modes: INSIGHTS mode for automated, deterministic negotiations based on predefined parameters, and CONVERSATION mode for natural language interactions with vendors. The AI adapts its strategy in real-time based on vendor responses and your configured preferences.",
  },
  {
    question: "How long does implementation take?",
    answer:
      "Most enterprise clients are fully operational within 2-4 weeks. The process includes initial configuration, integration with your existing procurement systems, team training, and a pilot phase with selected vendors. Our dedicated onboarding team ensures a smooth transition with minimal disruption to your existing workflows.",
  },
  {
    question: "Is my procurement data secure?",
    answer:
      "Absolutely. Accordo AI is built with enterprise-grade security from the ground up. We employ end-to-end encryption, role-based access controls, and comply with SOC 2 standards. All data is stored in isolated environments, and we never share your procurement data with third parties. Our platform maintains complete audit trails for all negotiations.",
  },
  {
    question: "Can Accordo AI integrate with our existing procurement systems?",
    answer:
      "Yes. Accordo AI provides a comprehensive REST API and supports integration with major ERP and procurement platforms. Whether you use SAP, Oracle, Coupa, or custom in-house systems, our team will work with you to establish seamless data flow between Accordo AI and your existing tech stack.",
  },
  {
    question: "What kind of ROI can we expect?",
    answer:
      "Enterprise clients typically see positive ROI within the first month of deployment. On average, organizations achieve 15-50% cost savings on negotiated contracts, 10x faster deal cycles, and can handle 10-20x more vendor negotiations without additional headcount. The exact ROI depends on your negotiation volume and current procurement efficiency.",
  },
  {
    question: "How do vendors respond to negotiating with AI?",
    answer:
      "Vendor feedback has been overwhelmingly positive, with approximately 90% of suppliers reporting a favorable experience. The AI finds mutually beneficial outcomes rather than simply pushing for the lowest price, which strengthens long-term vendor relationships. Many suppliers prefer the consistency, speed, and fairness of AI-assisted negotiations.",
  },
  {
    question: "Do we need technical expertise to use Accordo AI?",
    answer:
      "No. Accordo AI is designed for procurement professionals, not engineers. The interface is intuitive and requires no coding or technical knowledge. Your team can configure negotiation parameters, launch deals, and analyze results through a user-friendly dashboard. We also provide comprehensive training and ongoing support.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="landing-section bg-landing-bg-alt">
      <div className="landing-container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Header */}
          <div className="lg:col-span-4 scroll-reveal" data-reveal="fade-right">
            <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="landing-heading mb-5">
              Frequently Asked Questions
            </h2>
            <p className="landing-subheading font-Inter">
              Everything you need to know about Accordo AI. Can't find what
              you're looking for? Reach out to our team.
            </p>
            <button
              onClick={() => {
                const el = document.querySelector("#final-cta");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1.5 transition-colors"
            >
              Contact our team
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Right Accordion */}
          <div className="lg:col-span-8 scroll-reveal" data-reveal="fade-left" data-reveal-delay="100">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl border transition-all duration-200 ${
                    openIndex === index
                      ? "border-primary-200 shadow-sm"
                      : "border-landing-border hover:border-landing-border"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between text-left px-6 py-5"
                  >
                    <span
                      className={`text-[15px] font-semibold pr-4 transition-colors ${
                        openIndex === index
                          ? "text-primary-600"
                          : "text-landing-text"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        openIndex === index
                          ? "bg-primary-50 text-primary-500"
                          : "bg-landing-bg-alt text-landing-text-muted"
                      }`}
                    >
                      {openIndex === index ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-5">
                      <p className="text-sm text-landing-text-secondary leading-relaxed font-Inter">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
