const CaseStudies = () => {
  return (
    <section className="landing-section bg-white">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 scroll-reveal" data-reveal="fade-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider">
              Case Studies
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
              Coming Soon
            </span>
          </div>
          <h2 className="landing-heading mb-5">
            Real Results from Real Companies
          </h2>
          <p className="landing-subheading mx-auto font-Inter">
            Discover how leading organizations across industries are
            transforming their procurement operations, cutting costs, and
            building stronger vendor relationships with Accordo AI.
          </p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="scroll-reveal" data-reveal="fade-up" data-reveal-delay="100">
          <div className="bg-landing-bg-section border-2 border-dashed border-landing-border rounded-2xl py-16 px-8 text-center">
            <p className="text-xl font-semibold text-landing-text-muted">
              Coming Soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
