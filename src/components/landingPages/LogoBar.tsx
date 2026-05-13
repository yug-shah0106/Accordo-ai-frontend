const LogoBar = () => {
  return (
    <section className="bg-landing-bg-section py-16 md:py-20 border-y border-landing-border">
      <div className="landing-container">
        <div className="text-center max-w-3xl mx-auto scroll-reveal" data-reveal="fade-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider">
              Our Partners
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
              Coming Soon
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-landing-text mb-4">
            Trusted by Industry Partners Leading Procurement Teams
          </h2>
          <p className="text-landing-text-secondary font-Inter max-w-2xl mx-auto mb-10">
            We're partnering with leading enterprises across industries to
            revolutionize their procurement workflows. Stay tuned for updates.
          </p>

          {/* Coming Soon Placeholder */}
          <div className="bg-white border-2 border-dashed border-landing-border rounded-2xl py-14 px-8">
            <p className="text-xl font-semibold text-landing-text-muted">
              Coming Soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoBar;
