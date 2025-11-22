import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import LogoSlider from "./LogoSlider";
import VideoSection from "./VideoSection";
import KeyFeatures from "./KeyFeatures";
import ChooseUs from "./ChooseUs";
import CaseStudy from "./CaseStudy";
import CustomerFeedback from "./CustomerFeedback";
import FrequentlyAskedQuestion from "./FrequentlyAskedQuestion";
import Footer from "./Footer";

const HomePage = () => {
  return (
    <div className="relative hide-scrollbar bg-black">
      <Navbar />
      <HeroSection />
      {/* <LogoSlider /> */}
      {/* <VideoSection /> */}
      <KeyFeatures />
      {/* <ChooseUs /> */}
      {/* <CaseStudy /> */}
      {/* <CustomerFeedback /> */}
      {/* <FrequentlyAskedQuestion /> */}
      <Footer />
    </div>
  );
};

export default HomePage;
