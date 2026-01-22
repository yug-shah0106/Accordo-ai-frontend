import { useState, useEffect } from "react";
import Sidebar from "../components/vendor/Sidebar";
import ChatReplay from "../components/vendor/ChatReplay";
import Requisitions from "../components/vendor/Requisitions";
import Navbar from "../components/vendor/Navbar";

const Wireframe = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1024);
      if (window.innerWidth > 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full hamburger-container">
      <Sidebar />
      <div className="w-full ">
        <div>
          <Navbar />
        </div>
        <div className="flex border-r h-[90vh]  border-gray-300 overflow-hidden w-full">
          <ChatReplay isOpen={isOpen} toggleMenu={toggleMenu} />

          <div
            className={`w-full sm:w-1/3 ${
              !isLargeScreen ? `menu ${isOpen ? "show" : "hidden"}` : ""
            }`}
          >
            <Requisitions isOpen={isOpen} toggleMenu={toggleMenu} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wireframe;
