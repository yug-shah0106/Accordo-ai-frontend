import React, { useState } from "react";
import key1 from "../../assets/key1.png";
import key2 from "../../assets/key2.png";
import key3 from "../../assets/key3.png";
import key4 from "../../assets/key4.png";
import key5 from "../../assets/key5.png";

const AccordionItem = ({ title, children, isOpen, onToggle, index }) => {
  return (
    <div className="border-gray-200 mt-4">
      <button
        onClick={() => onToggle(index)}
        className="w-full text-left p-4 text-sm lg:text-2xl font-bold text-gray-800 hover:bg-gray-200 transition-all flex justify-between items-center"
      >
        <span>{title}</span>
      </button>
      {isOpen && <div className="p-4 bg-[#F8F5F3]">{children}</div>}
    </div>
  );
};

const KeyFeatures = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-black">
      <div className="xl:w-[70%] lg:w-[80%] w-[90%] mx-auto py-4 lg:pt-16 pt-10">
        <h1 className="md:text-3xl text-2xl text-white xl:text-4xl font-bold mt-4 lg:mb-12">
          Key Features
        </h1>
        {/* <p className="text-white mb-6 sm:w-full lg:w-[55%] sm:text-lg text-justify  lg:text-xl sm:px-6 lg:p-10 font-normal">
        Lorem ipsum is a placeholder text commonly used to demonstrate the
        visual form of a document or a typeface without relying on meaningful
        content Harness the power of machine learning to automate and optimize
        negotiation tactics.
      </p> */}
        {/* <div className="grid sm:grid-cols-3 grid-cols-1 gap-2 px-2 xl:px-10 ">
        <div className="">
          <AccordionItem
            title="AI-Driven Negotiation Strategies"
            isOpen={openIndex === 0}
            onToggle={handleToggle}
            index={0}
          >
            <p className="text-[#888888]">
              Harness the power of machine learning to automate and optimize
              negotiation tactics. Our AI understands complex bargaining
              scenarios and adapts in real-time to secure the best outcomes
              relationships using data-driven insights to enhance negotiation
              outcomes.
            </p>
          </AccordionItem>
          <AccordionItem
            title="Multi-vendor Management"
            isOpen={openIndex === 1}
            onToggle={handleToggle}
            index={1}
          >
            <p>
              Manage multiple vendors effortlessly, optimizing contracts and
              relationships using data-driven insights to enhance negotiation
              outcomes.
            </p>
          </AccordionItem>
          <AccordionItem
            title="Instant Contract Generation"
            isOpen={openIndex === 2}
            onToggle={handleToggle}
            index={2}
          >
            <p className="text-[#888888]">
              Automate contract creation in real time, ensuring efficiency and
              minimizing errors with AI-assisted legal document generation.
            </p>
          </AccordionItem>
          <AccordionItem
            title="24/7 Negotiation"
            isOpen={openIndex === 3}
            onToggle={handleToggle}
            index={3}
          >
            <p className="text-[#888888]">
              Enable round-the-clock negotiation with AI, ensuring that your
              business never misses an opportunity regardless of time zones.
            </p>
          </AccordionItem>
          <AccordionItem
            title="Data-Driven Insights"
            isOpen={openIndex === 4}
            onToggle={handleToggle}
            index={4}
          >
            <p className="text-[#888888]">
              Gain valuable insights based on data analytics to optimize future
              negotiations and refine your strategies for better outcomes.
            </p>
          </AccordionItem>
        </div>

        <div className="relative col-span-2">
          <div className="rounded-lg p-2 flex justify-center items-center">
            <img
              src={keyfeatures}
              alt="Content Block Preview"
              className="rounded-lg"
            />
          </div>
        </div>
      </div> */}

        <div className="relative grid md:grid-cols-2 grid-cols-1">
          <span class="z-[1] hidden lg:flex opacity-30 pointer-events-none select-none bg-gradient-fade-x h-[2px] w-[100%] xl:w-[130%] absolute top-0 left-1/2 -translate-x-1/2 m-auto"></span>
          <span class="z-[1] hidden lg:flex opacity-30 pointer-events-none select-none bg-gradient-fade-x h-[2px] w-[100%] xl:w-[130%] absolute bottom-0 left-1/2 -translate-x-1/2 right-0 m-auto"></span>
          <span class="z-[1] hidden lg:flex opacity-30 pointer-events-none select-none bg-gradient-fade-y w-[2px] h-[100%] xl:h-[130%] absolute left-0 top-0 bottom-0 m-auto"></span>
          <span class="z-[1] hidden lg:flex opacity-30 pointer-events-none select-none bg-gradient-fade-y w-[2px] h-[100%] xl:h-[130%] absolute right-0 top-0 bottom-0 m-auto"></span>
          <div class="bg-black border-b text-white border-[#FFFFFF1A] md:border-r">
            <div
              class="p-4 lg:p-8"
              id="conversation-explorer-results-discover-trends"
            >
              <img
                src={key1}
                alt="key1"
                className="xl:h-[347px] h-[300px] object-cover mx-auto"
              />
              <h4 class="lg:text-2xl text-xl mt-7 text-center">
                AI-Driven Negotiation Strategies
              </h4>
              <p class="mt-4 text-[#9f9f9f] text-justify">
                Harness the power of machine learning to automate and optimize
                negotiation tactics. Our AI understands complex bargaining
                scenarios and adapts in real-time to secure the best outcomes
                relationships using data-driven insights to enhance negotiation
                outcomes.
              </p>
            </div>
          </div>
          <div class="bg-black border-b text-white border-[#FFFFFF1A]">
            <div
              class="p-4 lg:p-8"
              id="conversation-explorer-results-discover-trends"
            >
              <img
                src={key2}
                alt="key2"
                className="xl:h-[347px] h-[300px] object-cover mx-auto"
              />
              <h4 class="lg:text-2xl text-xl mt-7 text-center">
                Multi-vendor Management
              </h4>
              <p class="mt-4 text-[#9f9f9f] text-justify">
                Manage multiple vendors effortlessly, optimizing contracts and
                relationships using data-driven insights to enhance negotiation
                outcomes.
              </p>
            </div>
          </div>
          <div class="bg-black text-white border-[#FFFFFF1A] md:border-r">
            <div
              class="p-4 lg:p-8"
              id="conversation-explorer-results-discover-trends"
            >
              <img
                src={key3}
                alt="key3"
                className="xl:h-[347px] h-[300px] object-cover mx-auto"
              />
              <h4 class="lg:text-2xl text-xl mt-7 text-center">
                Instant Contract Generation
              </h4>
              <p class="mt-4 text-[#9f9f9f] text-justify">
                Automate contract creation in real time, ensuring efficiency and
                minimizing errors with AI-assisted legal document generation.
              </p>
            </div>
          </div>
          <div class="bg-black border-t text-white border-[#FFFFFF1A] md:border-none">
            <div
              class="p-4 lg:p-8"
              id="conversation-explorer-results-discover-trends"
            >
              <img
                src={key4}
                alt="key4"
                className="xl:h-[347px] h-[300px] object-cover mx-auto"
              />
              <h4 class="lg:text-2xl text-xl mt-7 text-center">
                24/7 Negotiation
              </h4>
              <p class="mt-4 text-[#9f9f9f] text-justify">
                Enable round-the-clock negotiation with AI, ensuring that your
                business never misses an opportunity regardless of time zones.
              </p>
            </div>
          </div>
          {/* <div class="bg-black border-t text-white border-[#FFFFFF1A] md:border-r">
          <div
            class="p-4 lg:p-8"
            id="conversation-explorer-results-discover-trends"
          >
            <img src={key5} alt="key5" className="h-[347px] object-cover mx-auto" />
            <h4 class="text-2xl mt-7">Data-Driven Insights</h4>
            <p class="mt-4 text-[#9f9f9f]">
              Gain valuable insights based on data analytics to optimize future
              negotiations and refine your strategies for better outcomes.
            </p>
          </div>
        </div> */}
        </div>
      </div>
    </div>
  );
};

export default KeyFeatures;
