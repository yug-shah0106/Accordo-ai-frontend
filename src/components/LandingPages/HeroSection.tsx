// import { Play } from "lucide-react"; // TODO: Re-enable when product demo video is ready

const HeroSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-[#0B0F17] via-[#0F1629] to-[#131B3A] overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/8 rounded-full blur-[120px]" />

      <div className="landing-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[90vh] pt-28 pb-16 lg:pt-32 lg:pb-24">
          {/* Left Content */}
          <div className="scroll-reveal" data-reveal="fade-right">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-sm font-medium">
                Trusted by Enterprise Procurement Teams
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.15] tracking-tight mb-6">
              AI-Powered Procurement{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(to right, #5A78FA, #93C5FD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Negotiations
              </span>{" "}
              at Enterprise Scale
            </h1>

            <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-lg font-Inter">
              Automate thousands of vendor negotiations simultaneously. 
              Reduce procurement costs, accelerate deal cycles, and let AI 
              find better outcomes for both sides.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("#final-cta")}
                className="btn-primary text-base !py-3.5 !px-8 !shadow-lg !shadow-primary-500/25 hover:!shadow-primary-500/40"
              >
                Request a Demo
              </button>
              {/* TODO: Re-enable when product demo video is ready
              <button
                onClick={() => scrollToSection("#demo")}
                className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3.5 px-8 rounded-lg border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                Watch Video
              </button>
              */}
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">50%</p>
                <p className="text-sm text-white/50 mt-1 font-Inter">Cost Savings</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">24/7</p>
                <p className="text-sm text-white/50 mt-1 font-Inter">Availability</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">90%</p>
                <p className="text-sm text-white/50 mt-1 font-Inter">Supplier Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative scroll-reveal" data-reveal="fade-left" data-reveal-delay="200">
            <div className="relative">
              {/* Dashboard mockup */}
              <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl border border-white/10 p-4 shadow-2xl">
                <div className="bg-gradient-to-br from-[#1a2040] to-[#0f1629] rounded-xl overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-white/5 rounded-md px-12 py-1 text-white/30 text-xs">
                        app.accordo.ai
                      </div>
                    </div>
                  </div>
                  {/* Dashboard content simulation */}
                  <div className="p-6 space-y-4">
                    {/* Header bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/30" />
                        <div>
                          <div className="h-3 w-24 bg-white/20 rounded" />
                          <div className="h-2 w-16 bg-white/10 rounded mt-1.5" />
                        </div>
                      </div>
                      <div className="h-7 w-20 bg-primary-500/40 rounded-md" />
                    </div>
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Active Deals", value: "247", color: "bg-primary-500/20" },
                        { label: "Cost Saved", value: "$2.4M", color: "bg-green-500/20" },
                        { label: "Completion", value: "94%", color: "bg-blue-400/20" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className={`${stat.color} rounded-lg p-3`}
                        >
                          <p className="text-white/50 text-[10px]">{stat.label}</p>
                          <p className="text-white font-semibold text-sm mt-0.5">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Table rows */}
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3"
                        >
                          <div className="w-6 h-6 rounded bg-white/10 flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div
                              className="h-2 bg-white/15 rounded"
                              style={{ width: `${60 + i * 8}%` }}
                            />
                            <div
                              className="h-1.5 bg-white/8 rounded"
                              style={{ width: `${40 + i * 5}%` }}
                            />
                          </div>
                          <div
                            className={`h-5 w-16 rounded-full ${
                              i % 2 === 0
                                ? "bg-green-500/20"
                                : "bg-yellow-500/20"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border border-landing-border scroll-reveal" data-reveal="fade-up" data-reveal-delay="600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-landing-text">
                      Deal Closed
                    </p>
                    <p className="text-xs text-landing-text-muted">
                      Saved $48,500 on contract
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
