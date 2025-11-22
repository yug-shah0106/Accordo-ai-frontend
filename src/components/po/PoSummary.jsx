import React from "react";
import { FaCaretDown } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { PiFramerLogo } from "react-icons/pi";
import { VscSettings } from "react-icons/vsc";
import price from "../../assets/price.svg";
import price1 from "../../assets/price1.svg";

const PoSummary = () => {
  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-lg h-full p-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <PiFramerLogo className="text-xl" />
            Summary
          </h1>
        </div>

        <div className="flex flex-wrap justify-between gap-2 mb-4">
          <div className="relative ">
            <input
              onChange={(e) => debounceSearch(e.target.value)}
              type="text"
              placeholder="Search Summary"
              className="border border-gray-300 rounded-md pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full px-4"
            />
            <IoSearchOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsFilterModalOpen((prev) => !prev)}
              className="rounded-md px-4 py-2 text-sm font-medium text-black bg-[#F7F9FB] flex items-center gap-1"
            >
              <VscSettings /> Filter <FaCaretDown />
            </button>
            {/* <div className="absolute z-30 md:right-[8%] mt-10 right-[20%]">
              {isFilterModalOpen && (
                <div className="overflow-auto *: border rounded-md shadow-md">
                  <Filter
                    onClose={closeFilterModal}
                    onApply={applyFilters}
                    filtersData={selectedFilters}
                  />
                </div>
              )}
            </div> */}
            <button
              onClick={() => setIsFilterModalOpen((prev) => !prev)}
              className="rounded-md px-4 py-2 text-sm font-medium text-black bg-[#F7F9FB] flex items-center gap-1"
            >
              Action <FaCaretDown />
            </button>
            <button
              onClick={() => setIsFilterModalOpen((prev) => !prev)}
              className="rounded-md px-4 py-2 text-sm font-medium text-white bg-[#234BF3] flex items-center gap-1"
            >
              Comparison <FaCaretDown />
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs">
          <tr className="text-[#00000066] align-middle border-b border-[#0000000D]">
            <td className="py-1 px-2 border-r text-center">
              <input type="checkbox" className="w-[16px] h-[16px]" />
            </td>
            <td className="py-1 px-2 border-r text-start w-[200px]">Total Amount</td>
            <td className="py-1 px-2 border-r text-center">20000</td>
            <td className="py-1 px-2 border-r text-center">21000</td>
            <td className="py-1 px-2 border-r text-center">2120000</td>
            <td className="py-1 px-2 border-r text-center">2120000</td>
            <td className="py-1 px-2 border-r text-center">2120000</td>
            <td className="py-1 px-2 border-r text-center">2120000</td>
            <td className="py-1 px-2 border-r text-center">2120000</td>
          </tr>
          <tr className="border-b">
            <td></td>
            <td colSpan={8} className="p-2">
              <p className="font-semibold">Sugar - 170114 Pure sugar</p>
              <p>100 kg | Low Filter</p>
            </td>
          </tr>
          <tr className="border-b">
            <td></td>
            <td className="font-semibold px-2 py-3">Rank</td>
            <td><div className="flex items-center justify-center gap-1 px-2 py-3"><img src={price} alt="price" />1</div></td>
            <td><div className="flex items-center justify-center gap-1 px-2 py-3"><img src={price1} alt="price1" />2</div></td>
            <td><div className="flex items-center justify-center gap-1 px-2 py-3"><img src={price1} alt="price1" />2</div></td>
            <td><div className="flex items-center justify-center gap-1 px-2 py-3"><img src={price1} alt="price1" />2</div></td>
            <td><div className="flex items-center justify-center gap-1 px-2 py-3"><img src={price1} alt="price1" />2</div></td>
            <td><div className="flex items-center justify-center gap-1 px-2 py-3"><img src={price1} alt="price1" />2</div></td>
            <td><div className="flex items-center justify-center gap-1 px-2 py-3"><img src={price1} alt="price1" />2</div></td>
          </tr>
          <tr className="border-b">
            <td></td>
            <td className="font-semibold px-2 py-3">Price</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
          </tr>
          <tr className="border-b">
            <td></td>
            <td className="font-semibold px-2 py-3">Price</td>
            <td className="px-2 py-3 text-center font-semibold text-[#EF2D2E]">-0.2% H</td>
            <td className="px-2 py-3 text-center font-semibold text-[#009A4F]">+3.2% H</td>
            <td className="px-2 py-3 text-center font-semibold text-[#EF2D2E]">-0.2% H</td>
            <td className="px-2 py-3 text-center font-semibold text-[#009A4F]">+3.2% H</td>
            <td className="px-2 py-3 text-center font-semibold text-[#009A4F]">+3.2% H</td>
            <td className="px-2 py-3 text-center font-semibold text-[#EF2D2E]">-0.2% H</td>
            <td className="px-2 py-3 text-center font-semibold text-[#009A4F]">+3.2% H</td>
          </tr>
          <tr className="border-b">
            <td></td>
            <td className="font-semibold px-2 py-3">Savings</td>
            <td className="px-2 py-3 text-center">100 kg</td>
            <td className="px-2 py-3 text-center">100 kg</td>
            <td className="px-2 py-3 text-center">100 kg</td>
            <td className="px-2 py-3 text-center">100 kg</td>
            <td className="px-2 py-3 text-center">100 kg</td>
            <td className="px-2 py-3 text-center">100 kg</td>
            <td className="px-2 py-3 text-center">100 kg</td>
          </tr>
          <tr className="border-b">
            <td></td>
            <td className="font-semibold px-2 py-3">Quantity Available</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
            <td className="px-2 py-3 text-center">₹200</td>
          </tr>
          <tr className="border-b">
            <td></td>
            <td className="font-semibold px-2 py-3">GST</td>
            <td className="px-2 py-3 text-center">18%</td>
            <td className="px-2 py-3 text-center">20%</td>
            <td className="px-2 py-3 text-center">30%</td>
            <td className="px-2 py-3 text-center">60%</td>
            <td className="px-2 py-3 text-center">90%</td>
            <td className="px-2 py-3 text-center">40%</td>
            <td className="px-2 py-3 text-center">10%</td>
          </tr>
          <tr className="border-b">
            <td></td>
            <td className="font-semibold px-2 py-3">Amount</td>
            <td className="px-2 py-3 text-center font-semibold">₹200</td>
            <td className="px-2 py-3 text-center font-semibold">₹200</td>
            <td className="px-2 py-3 text-center font-semibold">₹200</td>
            <td className="px-2 py-3 text-center font-semibold">₹200</td>
            <td className="px-2 py-3 text-center font-semibold">₹200</td>
            <td className="px-2 py-3 text-center font-semibold">₹200</td>
            <td className="px-2 py-3 text-center font-semibold">₹200</td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default PoSummary;
