const Testimonials = () => {
  return (
    <section className="landing-section bg-landing-bg-section">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 scroll-reveal" data-reveal="fade-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider">
              Testimonials
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
              Coming Soon
            </span>
          </div>
          <h2 className="landing-heading mb-5">
            Trusted by Procurement Leaders
          </h2>
          <p className="landing-subheading mx-auto font-Inter">
            Hear from the procurement professionals and supply chain leaders who
            are transforming their operations with Accordo AI. Real stories,
            real impact, real savings.
          </p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="scroll-reveal" data-reveal="fade-up" data-reveal-delay="100">
          <div className="bg-white border-2 border-dashed border-landing-border rounded-2xl py-16 px-8 text-center">
            <p className="text-xl font-semibold text-landing-text-muted">
              Coming Soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
