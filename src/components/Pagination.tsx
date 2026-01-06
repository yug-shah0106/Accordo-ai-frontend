import { PiLessThanBold, PiGreaterThanBold } from "react-icons/pi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  totalDoc: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  totalDoc,
}: PaginationProps) => {
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-between items-end pt-4 pb-0">
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
            className={`px-3 pt-1 pb-0 text-sm text-gray-700 rounded-md ${currentPage === index + 1 ? "bg-blue-100" : ""
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
