import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

const FinalCTA = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // TODO: Integrate with backend API for demo requests
    }
  };

  return (
    <section
      id="final-cta"
      className="relative py-20 md:py-28 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom right, #234BF3, #1A3AD4, #0B0F17)' }}
      />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(141, 160, 252, 0.15)' }} />

      <div className="landing-container relative z-10">
        <div className="max-w-3xl mx-auto text-center scroll-reveal" data-reveal="fade-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
            Ready to Transform Your{" "}
            <span
              style={{
                backgroundImage: 'linear-gradient(to right, #BFDBFE, #FFFFFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Procurement?
            </span>
          </h2>

          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl mx-auto font-Inter leading-relaxed">
            Join enterprise procurement teams who are saving millions with
            AI-powered negotiations. Get started with a personalized demo.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all font-Inter text-sm"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/95 transition-all duration-300 shadow-lg shadow-black/10 text-sm whitespace-nowrap"
                style={{ color: '#1A3AD4' }}
              >
                Request a Demo
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-xl px-6 py-4 max-w-md mx-auto mb-8">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-white font-medium text-sm font-Inter">
                Thank you! We'll reach out within 24 hours.
              </p>
            </div>
          )}

          <p className="text-white/40 text-sm font-Inter">
            No commitment required &middot; Personalized demo &middot; Response
            within 24 hours
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
