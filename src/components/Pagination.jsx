import React from "react";
import { PiLessThanBold, PiGreaterThanBold } from "react-icons/pi";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  totalDoc,
}) => {
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-between items-end py-4">
      <p className="text-sm font-medium text-gray-500">
        {Math.min(currentPage * limit, totalDoc) === 0
          ? "No entries found"
          : `Showing ${currentPage * limit - limit + 1} to ${Math.min(
            currentPage * limit,
            totalDoc
          )} of ${totalDoc} entries`}
      </p>

      <div className="flex gap-1 items-center">
        <PiLessThanBold
          className="text-gray-400"
          onClick={() => {
            handlePageClick(currentPage - 1);
          }}
        />
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(index + 1)}
            className={`px-3 py-1 text-sm text-gray-700 rounded-md ${currentPage === index + 1 ? "bg-blue-100" : ""
              }`}
          >
            {index + 1}
          </button>
        ))}
        <PiGreaterThanBold
          className="text-gray-400"
          onClick={() => {
            handlePageClick(currentPage + 1);
          }}
        />
      </div>
    </div>
  );
};

export default Pagination;
