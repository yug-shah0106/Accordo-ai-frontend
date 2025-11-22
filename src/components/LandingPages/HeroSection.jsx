import React from "react";
import img from "../../assets/image.png";
import dashboard from "../../assets/Dashboard.png";
import heroChart from "../../assets/heroChart.png";
import Singles from "../../assets/Singles.png";
import rectangle from "../../assets/rectangle.png";
import rect2 from "../../assets/rectangle2.png";

const HeroSection = () => {
  return (
    <div className="bg-black text-white">
      {/* <div className="grid grid-cols-1 items-center p-4 justify-center h-full gap-8"> */}
      <div className="flex justify-center w-[90%] text-center mx-auto items-center xl:pt-36 pt-10">
        <div className="xl:w-[60%] sm:w-[80%] ">
          <h1 className="text-2xl text-wrap lg:text-4xl font-bold mb-4 leading-tight lg:leading-[3rem]">
            The Advance Agentic AI Platform for Effortless Enterprise
            Procurement Negotiations
          </h1>
          {/* <p className="text-white text-wrap mb-8 text-sm lg:text-base">
              Stand out with the top-rated solution for creating, managing,
              tracking, and eSigning every important document you handle.
            </p> */}
          <div className="flex justify-center space-y-4 sm:space-y-0 sm:space-x-8 mt-10">
            <button className="bg-[#234BF3] text-white font-medium xl:font-bold py-2 px-4 rounded-lg w-auto">
              Request a demo
            </button>
            {/* <button className="bg-white text-gray-600 font-bold py-1 px-4 rounded-lg border border-[#272626] w-full sm:w-auto">
              Start free 14-day trial
            </button> */}
          </div>
        </div>
      </div>
      <img
        src={dashboard}
        alt="Hero Image"
        className="rounded-lg xl:w-[70%] lg:w-[80%] w-[90%] object-cover object-top mx-auto lg:mt-20 mt-10"
      />

      {/* <img
          src={heroChart}
          className="w-[20%]  absolute left-[50%] -translate-x-[15%] mb-28 hidden lg:block"
        />

        <img
          src={Singles}
          className="w-[30%]  absolute left-[45%] top-[60%] -translate-x-[15%] mb-28 hidden lg:block"
        />

        <div className="pl-0 md:pl-[5rem] h-full hidden lg:block">
          <div className="flex justify-start bg-[#D3DBFD] h-full rounded-bl-[20%]">
            <div className="flex gap-3 ml-auto justify-end items-end">
              <img
                src={img}
                alt="Hero Image"
                className="rounded-lg w-[70%] md:w-[55%] h-auto object-contain "
              />
              <div className="h-[80%] pb-7 flex w-[25%] md:w-[15%] flex-col justify-between mt-auto">
                <img
                  src={rectangle}
                  alt="Small Hero Image"
                  className="rounded h-auto w-[60%] sm:w-[50%] align-top"
                />
                <img
                  src={rect2}
                  alt="Small Hero Image"
                  className="rounded w-[50%] sm:w-[40%] h-auto mt-auto"
                />
              </div>
            </div>
          </div>
        </div> */}
    </div>
    // </div>
  );
};

export default HeroSection;
