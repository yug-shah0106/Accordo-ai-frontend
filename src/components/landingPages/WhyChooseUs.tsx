import { useEffect, useRef, useState } from "react";
import { TrendingDown, Clock, ThumbsUp, Zap } from "lucide-react";

interface CounterProps {
  end: number;
  suffix: string;
  duration?: number;
}

const AnimatedCounter = ({ end, suffix, duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = end / (duration / 16);
          timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [end, duration, hasAnimated]);

  return (
    <div ref={ref}>
      <span className="text-4xl md:text-5xl font-bold text-landing-text tracking-tight">
        {count}
        {suffix}
      </span>
    </div>
  );
};

const differentiators = [
  {
    icon: TrendingDown,
    metric: 50,
    suffix: "%",
    label: "Cost Reduction",
    description:
      "Average savings on procurement costs through AI-optimized negotiations that find the best possible terms for every deal.",
  },
  {
    icon: Clock,
    metric: 24,
    suffix: "/7",
    label: "Always Available",
    description:
      "Round-the-clock autonomous negotiations ensure no opportunity is missed, regardless of time zones or business hours.",
  },
  {
    icon: ThumbsUp,
    metric: 90,
    suffix: "%",
    label: "Supplier Satisfaction",
    description:
      "Suppliers report overwhelmingly positive experiences. AI finds mutually beneficial outcomes, strengthening vendor relationships.",
  },
  {
    icon: Zap,
    metric: 10,
    suffix: "x",
    label: "Faster Deal Cycles",
    description:
      "Reduce negotiation timelines from weeks to hours. Handle thousands of vendor negotiations simultaneously with zero delay.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="why-us" className="landing-section bg-white">
      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal" data-reveal="fade-up">
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
            Why Accordo AI
          </p>
          <h2 className="landing-heading mb-5">
            Results That Speak for Themselves
          </h2>
          <p className="landing-subheading mx-auto font-Inter">
            Enterprise procurement teams choose Accordo AI for measurable outcomes
            that transform their bottom line.
          </p>
        </div>

        {/* Differentiator Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {differentiators.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group text-center p-8 rounded-2xl bg-landing-bg-alt border border-landing-border-light hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 scroll-reveal"
                data-reveal="fade-up"
                data-reveal-delay={String(index * 100)}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-7 h-7 text-primary-500" />
                </div>

                <AnimatedCounter end={item.metric} suffix={item.suffix} />

                <p className="text-lg font-semibold text-landing-text mt-2 mb-3">
                  {item.label}
                </p>
                <p className="text-sm text-landing-text-secondary leading-relaxed font-Inter">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
