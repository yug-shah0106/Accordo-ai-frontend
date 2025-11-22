import React, { useDebugValue, useEffect, useState } from "react";
import { AiFillProduct } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { LuArrowUpDown } from "react-icons/lu";
import { VscEdit, VscSettings } from "react-icons/vsc";
import { PiPlusSquareBold } from "react-icons/pi";
import { Link } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { RiBox3Line, RiDeleteBin5Line } from "react-icons/ri";
import { FaCaretDown } from "react-icons/fa";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import Modal from "../Modal";
import { authApi } from "../../api";
import toast from "react-hot-toast";

const ProductManagement = () => {
  const [isModal, setIsModal] = useState(false);

  const {
    data: products,
    loading,
    error,
    totalCount,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    filter,
    setFilter,
    totalDoc,
    setTotalDoc,
    refetch,
  } = useFetchData("/product/get-all", 10);
  console.log({totalCount});
  console.log({page});
  console.log({totalDoc});

  
  const debounce = useDebounce(setSearch, 600);

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
        cell: ({ row }) => {
          const { gstType, gstPercentage } = row.original; // Extract values correctly
          return gstType === "GST" ? `GST % is - ${gstPercentage}` : "-";
        },
      
      
    },
    {
      header: "TDS",
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

  const handleDeleteModalConfirm = async (id) => {
    try {
      await authApi.delete(`/product/delete/${id}`);
      await refetch();
      toast.success("Deleted confirmation");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };
  const handleCloseModal = async () => {
    setIsModal(false);
  };

  const actions = [
    {
      type: "link",
      label: "Edit Details",
      icon: <VscEdit />,
      link: (row) => `/product-management/editproductform/${row.id}`,
    },
    {
      type: "button",
      label: "Delete",
      icon: <RiDeleteBin5Line />,
      onClick: (row) => {
        setIsModal(row.id);
      },
    },
  ];
console.log({products});

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-lg h-full p-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <RiBox3Line className="text-xl" />
            Product Management
          </h1>
        </div>

        <div className="flex justify-between gap-2 mb-4 ">
          <div className="relative w-[30%]">
            <input
              onChange={(e) => debounce(e.target.value)}
              type="text"
              placeholder=" Search by name "
              className="border border-gray-300 rounded-md pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full px-4"
            />
            <IoSearchOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
        <div className="flex flex-col justify-between">
          <div className="border rounded-md hide-scrollbar  overflow-auto h-[70vh]">
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
          handleClose={handleCloseModal}
        >
          Are you sure you want to delete this product?
        </Modal>
      )}
    </div>
  );
};

export default ProductManagement;
