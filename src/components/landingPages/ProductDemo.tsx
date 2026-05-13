import { useState } from "react";
import { Play, X } from "lucide-react";

const ProductDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Replace with actual YouTube video ID when available
  const videoId = "dQw4w9WgXcQ";

  return (
    <section id="demo" className="landing-section bg-landing-bg-alt">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 scroll-reveal" data-reveal="fade-up">
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
            Product Demo
          </p>
          <h2 className="landing-heading mb-5">
            See Accordo AI in Action
          </h2>
          <p className="landing-subheading mx-auto font-Inter">
            Watch how Accordo AI transforms procurement negotiations — from setup
            to savings — in this quick overview.
          </p>
        </div>

        {/* Video Container */}
        <div
          className="max-w-4xl mx-auto scroll-reveal"
          data-reveal="zoom-in"
        >
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B0F17] to-[#131B3A] shadow-2xl border border-landing-border">
            {!isPlaying ? (
              <>
                {/* Thumbnail / Placeholder */}
                <div className="aspect-video relative">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

                  {/* Abstract visual placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Decorative circles */}
                      <div className="absolute -inset-20 opacity-20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl" />
                      </div>

                      {/* Dashboard preview lines */}
                      <div className="w-[500px] max-w-full px-8">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/30" />
                            <div className="h-3 w-32 bg-white/15 rounded" />
                          </div>
                          <div className="space-y-3">
                            <div className="h-2.5 w-full bg-white/10 rounded" />
                            <div className="h-2.5 w-4/5 bg-white/8 rounded" />
                            <div className="h-2.5 w-3/5 bg-white/6 rounded" />
                          </div>
                          <div className="mt-4 flex gap-2">
                            <div className="h-8 w-20 bg-primary-500/30 rounded-md" />
                            <div className="h-8 w-20 bg-white/10 rounded-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 z-20 flex items-center justify-center group"
                    aria-label="Play demo video"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity scale-150" />
                      <div className="relative w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-primary-600 transition-colors group-hover:scale-105 transform duration-200">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </button>

                  {/* Bottom text */}
                  <div className="absolute bottom-6 left-0 right-0 z-20 text-center">
                    <p className="text-white/70 text-sm font-Inter">
                      Watch the 90-second overview
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* Video Player */
              <div className="aspect-video relative">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  aria-label="Close video"
                >
                  <X className="w-5 h-5" />
                </button>
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  title="Accordo AI Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDemo;
