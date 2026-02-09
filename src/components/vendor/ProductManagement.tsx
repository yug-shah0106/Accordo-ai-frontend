import { useEffect, useState } from "react";
import { IoSearchOutline, IoCloseCircle } from "react-icons/io5";
import { VscEdit } from "react-icons/vsc";
import { PiPlusSquareBold } from "react-icons/pi";
import { Link } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { RiBox3Line, RiDeleteBin5Line } from "react-icons/ri";
import { FaRegEye, FaArrowLeft } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import Modal from "../Modal";
import { authApi } from "../../api";
import toast from "react-hot-toast";

const ProductManagement = () => {
  const [isModal, setIsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    specifications: true,
    taxInfo: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProduct(null);
  };

  const {
    data: products,
    loading,
    error: _error,
    totalCount,
    page,
    setPage,
    limit,
    setLimit: _setLimit,
    search: _search,
    setSearch,
    totalDoc,
    setTotalDoc: _setTotalDoc,
    refetch,
  } = useFetchData("/product/get-all", 10);
  console.log({totalCount});
  console.log({page});
  console.log({totalDoc});

  
  const debounce = useDebounce(setSearch, 600);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debounce(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearch("");
  };

  const columns = [
    // {
    //   header: "ID",
    //   accessor: "id",
    // },
    {
      header: "Category",
      accessor: "category"
    },
    {
      header: "Name",
      accessor: "productName",
    },
    {
      header: "Brand",
      accessor: "brandName",
    },
    {
      header: "GST",
      accessor: "gstType",
    },
    {

        header: "GST %",
        accessor: "gstPercentage",
        cell: ({ row }: { row: { original: { gstType: string; gstPercentage: string } } }) => {
          const { gstType, gstPercentage } = row.original; // Extract values correctly
          return gstType === "GST" ? `GST % is - ${gstPercentage}` : "-";
        },


    },
    {
      header: "HSN/SAC Code",
      accessor: "tds",
    },
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "UOM",
      accessor: "UOM",
    },
  ];

  const handleDeleteModalConfirm = async (id: any) => {
    try {
      await authApi.delete(`/product/delete/${id}`);
      await refetch();
      toast.success("Deleted confirmation");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };
  const handleCloseModal = async () => {
    setIsModal(false);
  };

  const actions = [
    {
      type: "button" as const,
      label: "View Details",
      icon: <FaRegEye />,
      onClick: (row: any) => {
        setSelectedProduct(row);
        setIsSidebarOpen(true);
      },
    },
    {
      type: "link" as const,
      label: "Edit Details",
      icon: <VscEdit />,
      link: (row: any) => `/product-management/editproductform/${row.id}`,
    },
    {
      type: "button" as const,
      label: "Delete",
      icon: <RiDeleteBin5Line />,
      onClick: (row: any) => {
        setIsModal(row.id);
      },
    },
  ];
console.log({products});

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col bg-white rounded-lg h-full overflow-hidden">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-6 px-6 pb-4 flex-shrink-0">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <RiBox3Line className="text-xl" />
            Product Management
          </h1>
        </div>

        <div className="flex justify-between gap-2">
          <div className="relative flex-1 max-w-md">
            <input
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              type="text"
              placeholder="Search by category, name, brand, HSN/SAC..."
              className="w-full border border-gray-300 rounded-md pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 px-4"
            />
            {searchTerm ? (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <IoCloseCircle className="text-lg" />
              </button>
            ) : (
              <IoSearchOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            )}
          </div>
          <div className="flex gap-6">

            <Link
              to="/product-management/createproductform"
              className="bg-[#234BF3] text-white font-medium rounded-md px-4 py-2 text-sm flex items-center gap-2"
            >
              <PiPlusSquareBold className="font-extrabold text-xl rounded-3xl" />{" "}
              Create
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col justify-between">
          <div className="border rounded-md hide-scrollbar overflow-auto">
            <Table data={products} columns={columns} actions={actions} loading={loading} style={'bg-gray-100 '} currentPage={page}
            itemsPerPage={10}/>
          </div>

          <div className="">
            <Pagination
              currentPage={page}
              totalPages={totalCount}
              onPageChange={setPage}
              limit={limit}
              totalDoc={totalDoc}
            />
          </div>
        </div>
      </div>
      {/* End Scrollable Content Area */}

      {/* View Details Sidebar */}
      <div
        className={`fixed top-0 right-0 w-2/6 p-6 bg-white shadow-lg h-full z-20 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        {selectedProduct && (
          <>
            <div className="flex justify-between mb-6 mt-8 items-center">
              <p className="text-md font-semibold flex items-center gap-2">
                <button onClick={closeSidebar}>
                  <FaArrowLeft />
                </button>
                Product Details
              </p>
            </div>

            {/* Basic Info Section */}
            <div
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2 py-2"
              onClick={() => toggleSection("basicInfo")}
            >
              <h3 className="text-lg font-medium">Basic Information</h3>
              {expandedSections.basicInfo ? (
                <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
              ) : (
                <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
              )}
            </div>
            {expandedSections.basicInfo && (
              <div className="grid grid-cols-2 text-sm gap-4 mt-4 mb-6">
                <div className="space-y-1">
                  <p className="text-gray-500">Product Name</p>
                  <p className="font-medium">{selectedProduct.productName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Brand</p>
                  <p className="font-medium">{selectedProduct.brandName || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{selectedProduct.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">UOM</p>
                  <p className="font-medium">{selectedProduct.UOM}</p>
                </div>
              </div>
            )}

            {/* Specifications Section */}
            <div
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2 py-2 border-t pt-4"
              onClick={() => toggleSection("specifications")}
            >
              <h3 className="text-lg font-medium">Specifications</h3>
              {expandedSections.specifications ? (
                <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
              ) : (
                <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
              )}
            </div>
            {expandedSections.specifications && (
              <div className="text-sm mt-4 mb-6">
                <p className="text-gray-500 mb-1">Description</p>
                <p className="font-medium">{selectedProduct.description || "No description available"}</p>
              </div>
            )}

            {/* Tax Info Section */}
            <div
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2 py-2 border-t pt-4"
              onClick={() => toggleSection("taxInfo")}
            >
              <h3 className="text-lg font-medium">Tax Information</h3>
              {expandedSections.taxInfo ? (
                <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
              ) : (
                <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
              )}
            </div>
            {expandedSections.taxInfo && (
              <div className="grid grid-cols-2 text-sm gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-gray-500">GST Type</p>
                  <p className="font-medium">{selectedProduct.gstType}</p>
                </div>
                {selectedProduct.gstType === "GST" && (
                  <div className="space-y-1">
                    <p className="text-gray-500">GST Percentage</p>
                    <p className="font-medium">{selectedProduct.gstPercentage}%</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-gray-500">HSN/SAC Code</p>
                  <p className="font-medium">{selectedProduct.tds || "-"}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={closeSidebar}
        />
      )}

      {isModal && (
        <Modal
          wholeModalStyle="text-center"
          heading="Are you sure do you want to Delete?"
          cancelText="No"
          actionText="Yes"
          isDeleteIcon={true}
          btnsStyle="justify-center"
          onAction={() => {
            handleDeleteModalConfirm(isModal);
            setIsModal(false);
          }}
          onClose={handleCloseModal}
          body="Are you sure you want to delete this product?"
        />
      )}
    </div>
  );
};

export default ProductManagement;
