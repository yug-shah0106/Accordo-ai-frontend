import { useScrollReveal } from "../../hooks/useScrollReveal";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
// import LogoBar from "./LogoBar"; // TODO: Re-enable when partner logos are ready
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import WhyChooseUs from "./WhyChooseUs";
// import ProductDemo from "./ProductDemo"; // TODO: Re-enable when product demo video is ready
// import Testimonials from "./Testimonials"; // TODO: Re-enable when testimonials content is ready
// import CaseStudies from "./CaseStudies"; // TODO: Re-enable when case studies content is ready
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

const HomePage = () => {
  // Initialize scroll reveal for all .scroll-reveal elements
  useScrollReveal();

  return (
    <div className="relative bg-white text-landing-text overflow-x-hidden">
      <Navbar />
      <HeroSection />
      {/* <LogoBar /> */}{/* TODO: Re-enable when partner logos are ready */}
      <Features />
      <HowItWorks />
      <WhyChooseUs />
      {/* <ProductDemo /> */}{/* TODO: Re-enable when product demo video is ready */}
      {/* <Testimonials /> */}{/* TODO: Re-enable when testimonials content is ready */}
      {/* <CaseStudies /> */}{/* TODO: Re-enable when case studies content is ready */}
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default HomePage;
