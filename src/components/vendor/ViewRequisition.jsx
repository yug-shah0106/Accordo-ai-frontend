import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { VscEdit, VscSettings } from "react-icons/vsc";
import { PiPlusSquareBold } from "react-icons/pi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaArrowLeft, FaCaretDown, FaPlus, FaRegEye } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import { authApi } from "../../api";
import toast from "react-hot-toast";
import Modal from "../Modal";
import Filter from "../Filter";

const ViewRequisition = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log({ state });
  const [isModal, setIsModal] = useState(false);
  const [benchmarkModal, setBenchMarkModal] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    {
      moduleName: "Requisition",
      filterBy: "totalVendors",
      controlType: "rangeNumeric",
      label: "Total Vendor",
      description: "the Requisition",
      range: [0, 500],
      value: [],
    },
    {
      "moduleName": "Requisition",
      "filterBy": "subject",
      "controlType": "inputText",
      "label": "Subject",
      "value": ""
    },
    {
      "moduleName": "Requisition",
      "filterBy": "category",
      "controlType": "inputText",
      "label": "Category",
      "value": ""
    },
    {
      moduleName: "Requisition",
      filterBy: "status",
      controlType: "checkbox",
      label: "Requisition Status",
      description: "Requisition Status ",
      value: [],
      options: ["Fulfilled", "Created", "Cancelled"],
    },
    {
      "moduleName": "Requisition",
      "filterBy": "deliveryDate",
      "controlType": "rangeDate",
      "label": "Delivery Date",
      "value": []
    },
    {
      moduleName: "Requisition",
      filterBy: "targetPrice",
      controlType: "rangeNumeric",
      label: "Target Price",
      description: "the Target Price",
      range: [0, 500],
      value: [],
    },
    {
      moduleName: "Requisition",
      filterBy: "totalPrice",
      controlType: "rangeNumeric",
      label: "Total Price",
      description: "the Total Price",
      range: [0, 500],
      value: [],
    },
  ])


  const {
    data: requisitions,
    loading,
    error,
    totalCount,
    page,
    setPage,
    limit,
    setSearch,
    // filter,
    setFilters,
    totalDoc,
    refetch,
  } = useFetchData(`/requisition/get-all`, 10, undefined, undefined, {
    projectid: state,
  });
  const debounce = useDebounce(setSearch, 600);



  const handleDeleteModalConfirm = async (id) => {
    try {
      await authApi.delete(`/requisition/delete/${id}`);
      await refetch();
      toast.success("Deleted confirmation");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };
  const handleCloseModal = async () => {
    setIsModal(false);
  };
  const handleCreateBenchMark = async (row) => {
    try {
      await authApi.post(`/benchmark/create`, {
        requisitionId: row?.id,
      });
      toast.success("Bench Mark Created Successfully");
      await refetch();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const columns = [
    {
      header: "Project ID",
      accessor: "projectId",
    },
    {
      header: "RFQ ID",
      accessor: "rfqId",
    },
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Category",
      accessor: "category",
    },
    {
      header: "Vendor",
      accessor: "Contract",
      accessorKey: "Vendor",
      accessorSubKey: "name",
    },
    {
      header: "DeliveryDate",
      accessor: "deliveryDate",
    },
    {
      header: "NegotiationDate",
      accessor: "negotiationClosureDate",
    },
    {
      header: "Status",
      accessor: "status",
      isBadge: true,
    },
  ];

  const actions = [
    {
      type: "link",
      label: "View Contracts",
      icon: <FaRegEye />,
      link: (row) => `/requisition-management/requisition/contract`,
      state: "whole",
    },
    {
      type: "link",
      label: "Add Vendor",
      icon: <FaPlus />,
      link: (row) => `/requisition-management/edit-requisition/${row.id}?redirect=3`,
    },
    {
      type: "button",
      label: "Create Bench Mark",
      icon: <FaPlus />,
      condition: (row) => {
        if (row.status === "Benchmarked") {
          return false;
        }
        return true;
      },
      onClick: (row) => {
        handleCreateBenchMark(row);
      },
    },
    {
      type: "button",
      label: "View Bench Mark",
      icon: <FaRegEye />,
      condition: (row) => {
        if (row.status === "Benchmarked") {
          return true;
        }
        return false;
      },
      onClick: (row) => {
        setBenchMarkModal(row);
      },
    },
    {
      type: "button",
      label: "Cancel Requisition",
      icon: <RiDeleteBin5Line />,
      onClick: (row) => {
        setIsModal(row.id);
      },
    },
    {
      type: "button",
      label: "View Details",
      icon: <FaRegEye />,
      onClick: (row) => {
        setSelectedProject(row);
        setIsSidebarOpen(row);
      },
    },
    {
      type: "link",
      label: "Edit Details",
      icon: <VscEdit />,
      link: (row) => `/requisition-management/edit-requisition/${row.id}`,
    },
  ];

  const handleRowClick = (project) => {


    setSelectedProject(project);
    setIsSidebarOpen(true);
  };

  const applyFilters = (filters) => {
    const transformedFilters = Object.keys(filters).reduce((acc, key) => {
      const filter = filters[key];

      if (filter.controlType === "checkbox" && typeof filter.selected === "object") {
        acc[key] = {
          ...filter,
          value: Object.keys(filter.selected).filter((key) => filter.selected[key]),
        };
      } else {
        acc[key] = filter;
      }

      return acc;
    }, {});
    const apiFilters = Object.values(filters).map(filter => {
      if (filter.controlType === "checkbox" && typeof filter.selected === "object") {
        return {
          ...filter,
          value: Object.keys(filter.selected).filter(key => filter.selected[key]),
          selected: undefined,
        };
      }

      if (filter.controlType === "rangeDate") {
        return {
          ...filter,
          value: [filter.value.from, filter.value.to],
        };
      }

      return filter;
    });

    setSelectedFilters(transformedFilters)
    setFilters(JSON.stringify(apiFilters));
    setIsFilterModalOpen(false);
  };



  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProject(null);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="mb-4">
        <p className="text-xl font-medium text-gray-800 flex items-center gap-2">
          <FaArrowLeft
            onClick={() => {
              navigate(-1);
            }}
            className="cursor-pointer"
          />
          View Requisitions
        </p>
      </div>

      <div className="flex justify-between gap-2 mb-4">
        <div className="relative ">
          <input
            onChange={(e) => debounce(e.target.value)}
            type="text"
            placeholder=" Search by name"
            className="border border-gray-300 rounded-md pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full px-4"
          />
          <IoSearchOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => setIsFilterModalOpen((prev) => (!prev))}
            className="rounded-md px-4 py-2 text-sm font-medium text-black bg-[#F7F9FB] flex items-center gap-1">
            <VscSettings /> Filter <FaCaretDown />
          </button>

          <div className="absolute md:right-[35%] right-[20%]">
            {isFilterModalOpen && <div className="overflow-auto h-[60vh] border rounded-md shadow-md">
              <Filter
                onClose={closeFilterModal}
                onApply={applyFilters}
                filtersData={selectedFilters}
              />
            </div>
            }
          </div>

          <Link
            to="/project-management/create-requisition"
            state={state}
            className="bg-[#234BF3] text-white font-medium rounded-md px-4 py-2 text-sm flex items-center gap-2"
          >
            <PiPlusSquareBold className="font-extrabold text-xl rounded-3xl" />{" "}
            Add
          </Link>
        </div>
      </div>

      <div className="border rounded-md overflow-auto h-[50vh] !overflow-visible" >
        <Table
          data={requisitions}
          columns={columns}
          actions={actions}
          onRowClick={handleRowClick}
          loading={loading}
        />
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalCount}
        onPageChange={setPage}
        limit={limit}
        totalDoc={totalDoc}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 w-1/4 p-6 bg-white shadow-lg h-full z-10 transition-transform transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="">
          {selectedProject && (
            <div className="flex justify-between mb-4 mt-8 items-center">
              <p className="text-md font-semibold flex items-center gap-2">
                <button onClick={closeSidebar}>
                  <FaArrowLeft />
                </button>
                {selectedProject.ReqId}
              </p>
              <Link
                to="/project-management/create-requisition"
                state={state}
                className="bg-[#FEEBDB] text-[#B24D00] font-sm rounded-full px-4 py-2 text-sm flex items-center gap-2"
              >
                Create
              </Link>
            </div>
          )}

          <div className="flex justify-between">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <MdOutlineKeyboardArrowDown />
          </div>
          {selectedProject && (
            <div className="grid grid-cols-3 text-sm gap-8">
              <div className="space-y-2">
                <p>Subject</p>
                <p>{selectedProject.subject}</p>
              </div>
              <div className="space-y-2">
                <p>Category</p>
                <p>{selectedProject.category}</p>
              </div>
              <div className="space-y-2">
                <p>Vendor</p>
                <ul className="list-disc">
                  {selectedProject.Contract.map((vendor) => (
                    <li key={vendor?.Vendor?.id}>{vendor?.Vendor?.name}</li>
                  ))}
                </ul>
                <p>{selectedProject.vendor}</p>
              </div>
              <div className="space-y-2">
                <p>Delivery Date</p>
                <p>{selectedProject?.deliveryDate?.split("T")?.[0]}</p>
              </div>
              <div className="space-y-2">
                <p>Negotiation Closure Date</p>
                <p>
                  {selectedProject?.negotiationClosureDate?.split("T")?.[0]}
                </p>
              </div>
              <div className="space-y-2">
                <p>Currency</p>
                <p>{selectedProject.typeOfCurrency}</p>
              </div>
            </div>
          )}

          {selectedProject?.RequisitionProduct?.length > 0 && (
            <>
              <div className="flex justify-between">
                <h3 className="text-lg font-medium mt-6">Product Details</h3>
                <MdOutlineKeyboardArrowDown />
              </div>
              <table className="w-full bg-white mt-4 rounded overflow-hidden">
                <thead>
                  <tr className="border">
                    <th className="py-2 px-6 text-left font-semibold">
                      Product Name
                    </th>
                    <th className="py-2 px-6 text-left font-semibold">
                      Quantity
                    </th>
                    <th className="py-2 px-6 text-left font-semibold">
                      Target Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProject?.RequisitionProduct?.map((product, idx) => (
                    <tr
                      key={product.id}
                      className={`border ${idx % 2 && "bg-gray-100"}`}
                    >
                      <td className="py-2 px-6">
                        {product?.Product?.productName}
                      </td>
                      <td className="py-2 px-6">{product?.qty}</td>
                      <td className="py-2 px-6">{product?.targetPrice}</td>
                    </tr>
                  )) || <tr>No products found</tr>}
                </tbody>
              </table>
            </>
          )}

          <div className="grid grid-cols-3 mt-4 text-sm gap-8">
            {/* <div className="space-y-2">
              <p className="font-medium text-gray-500">Target Price</p>
              <p>{selectedProject?.targetPrice}</p>
            </div> */}
            <div className="space-y-2">
              <p className="font-medium text-gray-500">Total Price</p>
              <p>{selectedProject?.totalPrice}</p>
            </div>
            {selectedProject?.paymentTerms && (
              <div className="space-y-2">
                <p className="font-medium text-gray-500">Payment Terms</p>
                <p className="text-xs">{selectedProject?.paymentTerms}</p>
              </div>
            )}
          </div>
        </div>

        {selectedProject?.RequisitionAttachment?.length > 0 && (
          <div className="mt-2 py-2">
            <p className="font-medium text-gray-500">Attachments</p>
            <div className="flex gap-4 mt-4">
              {selectedProject?.RequisitionAttachment?.map((attachment) => (
                <img
                  key={attachment.id}
                  className="h-10 w-10"
                  src={
                    import.meta.env.VITE_ASSEST_URL +
                    "/uploads/" +
                    attachment?.attachmentUrl
                  }
                />
              )) || <p>No attachments found.</p>}
            </div>
          </div>
        )}
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
      {benchmarkModal && (
        <Modal
          wholeModalStyle="text-center"
          heading="Bench Mark Details"
          btnsStyle="justify-center"
          showCancelButton={false}
          isDeleteIcon={false}
          handleClose={() => {
            setBenchMarkModal(false);
          }}
          body={JSON.parse(benchmarkModal?.benchmarkResponse)?.FinalBenchmark?.map((i) => {
            return (
              <div key={i.id}>
                <p className="text-black font-bold text-start">
                  {i.name} : <span className="font-normal">{i.value}</span>
                </p>
              </div>
            );
          })}
        ></Modal>
      )}
    </div>
  );
};

export default ViewRequisition;
