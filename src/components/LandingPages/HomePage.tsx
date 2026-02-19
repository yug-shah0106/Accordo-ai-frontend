import { useScrollReveal } from "../../hooks/useScrollReveal";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import LogoBar from "./LogoBar";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import WhyChooseUs from "./WhyChooseUs";
// import ProductDemo from "./ProductDemo"; // TODO: Re-enable when product demo video is ready
import Testimonials from "./Testimonials";
import CaseStudies from "./CaseStudies";
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
      <LogoBar />
      <Features />
      <HowItWorks />
      <WhyChooseUs />
      {/* <ProductDemo /> */}{/* TODO: Re-enable when product demo video is ready */}
      <Testimonials />
      <CaseStudies />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default HomePage;
