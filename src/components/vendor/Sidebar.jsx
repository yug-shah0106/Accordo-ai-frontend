import React from "react";
import { IoDocumentOutline } from "react-icons/io5";
import logo from '../../assets/logo.png';

function Sidebar() {
  return (
    <div className="lg:w-1/4 w-2/3 lg:p-6 sm:p-2 bg-gray-100 h-screen hide-scrollbar overflow-y-scroll overflow-x-hidden">
      <div className="mb-4">
        <img src={logo} alt="Logo" className="w-16 mx-auto" />
      </div>

      <div className="flex items-center gap-2 bg-white lg:p-3 rounded-md shadow">
        <IoDocumentOutline className="text-2xl w-16 text-black" />
        <p className="lg:text-lg font-semibold text-gray-800 sm:text-sm">Requisition Details</p>
      </div>

      <div className="bg-white mt-5 p-6 rounded-md shadow h-auto max-w-full sm:p-4 md:p-5 lg:p-6">
        <p className="text-sm font-medium text-black text-start">Req Details</p>
        <p className="lg:text-base sm:text-xs text-gray-500 mt-4 text-justify leading-relaxed overflow-hidden text-ellipsis">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        </p>
        <div className="text-left">
          <button className="mt-7 px-3 py-2 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
            Created
          </button>
        </div>
      </div>

      <p className="lg:text-lg md:text-xs font-semibold text-gray-800 mt-6 text-left">Contract Timeline</p>
      <ol className="list-decimal pl-6 mt-4 space-y-4 text-black text-start font-normal">
        <li className="lg:text-base sm:text-xs md:text-sm">Contract Created 11/1/2024</li>
        <li className="lg:text-base sm:text-xs md:text-sm">Contract Live opened 11/1/2024</li>
        <li className="lg:text-base sm:text-xs md:text-sm">Negotiation Completed</li>
        <li className="lg:text-base sm:text-xs md:text-sm">Contract Verified by seller</li>
        <li className="lg:text-base sm:text-xs md:text-sm">Contract Approved/Rejected</li>
      </ol>
    </div>
  );
}

export default Sidebar;
