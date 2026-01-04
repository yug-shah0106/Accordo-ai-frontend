import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import KeyFeatures from "./KeyFeatures";
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
