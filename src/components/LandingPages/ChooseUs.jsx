import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { MdOutlineWatchLater } from 'react-icons/md';
import img from "../../assets/case1.png";
import { TbHours24 } from 'react-icons/tb';

const ChooseUs = () => {
  return (
    <div className="lg:flex justify-center space-x-6 p-6 ">
     
      <div className=" lg:w-1/4 w-[80%] mx-auto">
        <div className="  w-[100%] sm:h-auto h-[100%] shadow-[22px_20px_0px_-4px_#EF2D2E] bg-[#D9D9D9] "><img src={img} /></div>
      </div>

   
      <div className="flex flex-col mt-10">
        <h2 className="xl:text-4xl text-xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
        <p className="text-gray-600 mb-4 text-sm md:text-lg xl:w-[70%] ">
          Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document .
        </p>
        <ul className="space-y-6 text-lg text-[#242424B2]">
          <li className="flex items-start space-x-3">
          <MdOutlineWatchLater className='text-2xl' />
            <p className='text-sm md:text-lg lg:w-[70%]'>
              <strong className='text-black'>Time Saving:</strong> Automate tedious negotiation processes, freeing up your team for higher-value tasks.
            </p>
          </li>
          <li className="flex items-start space-x-3">
          <FiBarChart2  className='text-2xl'/>
            <p  className='text-sm md:text-lg lg:w-[70%]'>
              <strong className='text-black'>Cost Reduction:</strong> Achieve better deals and optimize vendor contracts, saving your business money.
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <TbHours24 className='text-2xl'/>
            <p  className='text-sm md:text-lg lg:w-[70%]'>
              <strong className='text-black'>24/7 Availability:</strong> Your AI bot works tirelessly around the clock, ensuring no opportunity is missed.
            </p>
          </li>
          <li className="flex items-start space-x-3">
          <FiBarChart2  className='text-2xl'/>
            <p  className='text-sm md:text-lg lg:w-[70%]'>
              <strong className='text-black'>Scalability:</strong> Perfect for businesses of any size, from start-ups to enterprises managing hundreds of vendors.
            </p>
          </li>
        </ul>
      </div>

    </div>
  );
};

export default ChooseUs;
