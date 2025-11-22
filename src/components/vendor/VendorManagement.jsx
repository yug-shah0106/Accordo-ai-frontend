import React, { useEffect, useRef, useState } from "react";
import { AiFillProduct } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { VscEdit, VscSettings } from "react-icons/vsc";
import { PiPlusSquareBold } from "react-icons/pi";
import { Link } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaArrowLeft, FaCaretDown, FaPlus, FaRegEye } from "react-icons/fa";
import {
  MdOutlineArrowOutward,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import { authApi } from "../../api";
import Modal from "../Modal";
import Filter from "../Filter";
import { FiGitBranch } from "react-icons/fi";

const VendorManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const menuRef = useRef(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    {
      moduleName: "Vendors",
      filterBy: "totalContracts",
      controlType: "rangeNumeric",
      label: "Total Contracts",
      description: "The total contract price is $200",
      range: [1, 360],
      value: [],
    },
    {
      moduleName: "Vendors",
      filterBy: "completedContracts",
      controlType: "rangeNumeric",
      label: "Completed Contracts",
      description: "The total contract price is $200",
      range: [1, 360],
      value: [],
    },
    {
      moduleName: "Vendors",
      filterBy: "vendorStatus",
      controlType: "checkbox",
      label: "Status",
      description: "Include only active projects",
      value: [],
      options: ["active", "inactive"],
    },
  ]);

  const columns = [
    {
      header: "Vendor Id",
      accessor: "Vendor",
      accessorKey: "id",
    },
    {
      header: "Name",
      accessor: "Vendor",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessor: "Vendor",
      accessorKey: "email",
    },
    // {
    //   header: "Total approved Contracts",
    //   accessor: "Vendor",
    //   accessorKey: "approvedContractCount",
    // },
    // {
    //   header: "Contracts",
    //   accessor: "Vendor",
    //   accessorKey: "contractCount",
    // },
    {
      header: "Status",
      accessor: "Vendor",
      accessorKey: "status",
      isBadge: true,
    },
  ];

  const {
    data: vendors,
    loading,
    totalCount,
    page,
    setPage,
    limit,
    setSearch,
    totalDoc,
    setFilters,
    refetch,
    additionalData,
  } = useFetchData("/vendor/get-all", 10);
  const debounce = useDebounce(setSearch, 600);

  const data = [
    { title: " Total Vendor ", count: additionalData.totalVendors },
    {
      title: "Active Vendor",
      count: additionalData.totalVendors - additionalData.inactiveVendors,
    },
    { title: "Inactive Vendor", count: additionalData.inactiveVendors },
  ];

  const actions = [
    {
      type: "link",
      label: "Edit Details",
      icon: <VscEdit />,
      link: (row) => `/vendor-management/edit-vendor/${row.companyId}`,
    },
    {
      type: "button",
      label: "View Details",
      icon: <FaRegEye />,
      onClick: (row) => {
        handleRowClick(row);
      },
    },
    {
      type: "button",
      label: "Change Status",
      icon: <RiDeleteBin5Line />,
      // onClick: (row) => {
      //   setIsModal(row.id);
      // },
      onClick: (row) => {
        handleStatusChange(row);
      },
    },
  ];
  const handleStatusChange = async (row) => {
    console.log({ row });

    try {
      const response = await authApi.put(`/vendor/update/${row.vendorId}`, {
        status: row.Vendor.status === "active" ? "inactive" : "active",
      });
      console.log({ response });

      refetch();
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  const handleRowClick = (vendors) => {
    setSelectedProject(vendors);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProject(null);
  };

  const handleCloseModal = async () => {
    setIsModal(false);
  };

  useEffect(() => {
    if (selectedProject) {
      fetchCompanyData();
    }
  }, [selectedProject]);

  const fetchCompanyData = async () => {
    try {
      const response = await authApi.get(
        `/company/get/${selectedProject.companyId}`
      );
      setCompanyData(response.data.data);
      // console.log({response});
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  const applyFilters = (filters) => {
    if (filters === null) {
      const clearedFilters = Object.keys(selectedFilters).reduce((acc, key) => {
        const filter = selectedFilters[key];

        if (filter.controlType === "rangeNumeric") {
          acc[key] = { ...filter, value: [filter.range[0], filter.range[1]] };
        } else if (filter.controlType === "checkbox") {
          acc[key] = { ...filter, selected: {}, value: [] };
        } else if (filter.controlType === "rangeDate") {
          acc[key] = { ...filter, value: { from: "", to: "" } };
        } else if (filter.controlType === "inputText") {
          acc[key] = { ...filter, value: "" };
        }
        return acc;
      }, {});
      setSelectedFilters(clearedFilters);
      setFilters(null);
      setIsFilterModalOpen((prev) => !prev);
      return;
    }
    const transformedFilters = Object.keys(filters).reduce((acc, key) => {
      const filter = filters[key];

      if (
        filter.controlType === "checkbox" &&
        typeof filter.selected === "object"
      ) {
        acc[key] = {
          ...filter,
          value: Object.keys(filter.selected).filter(
            (key) => filter.selected[key]
          ),
        };
      } else {
        acc[key] = filter;
      }

      return acc;
    }, {});
    const apiFilters = Object.values(filters).map((filter) => {
      if (
        filter.controlType === "checkbox" &&
        typeof filter.selected === "object"
      ) {
        return {
          ...filter,
          value: Object.keys(filter.selected).filter(
            (key) => filter.selected[key]
          ),
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

    setSelectedFilters(transformedFilters);
    setFilters(JSON.stringify(apiFilters));
    setIsFilterModalOpen(false);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedProject(null);
        setIsSidebarOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg h-full p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiGitBranch className="text-xl" />
          Vendor Management
        </h1>
      </div>

      {/* <div className=" grid xl:grid-cols-6 sm:grid-cols-3 gap-4 py-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-sm p-4 flex flex-col justify-start"
          >
            <p className="text-gray-500 font-medium lg:text-md md:text-md">
              {item.title}
            </p>
            <h2 className="lg:text-lg md:text-sm font-semibold text-gray-800 ">
              {item.count}
            </h2>
          </div>
        ))}
      </div> */}

      <div className="flex justify-between gap-3 mb-4">
        <div className="relative flex gap-3">
          <input
            onChange={(e) => debounce(e.target.value)}
            type="text"
            placeholder=" Search by Name"
            className="border border-gray-300 rounded-md pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full px-4"
          />
          
        </div>
        <div className="flex gap-3">
        {/* <button
            onClick={() => setIsFilterModalOpen((prev) => !prev)}
            className="rounded-md px-4 py-2 text-sm font-medium text-black bg-[#F7F9FB] flex items-center gap-1"
          >
            <VscSettings /> Filter <FaCaretDown />
          </button> */}
          <Link
            to="/vendor-management/create-vendor"
            className="bg-[#234BF3] text-white font-medium rounded-md px-4 py-2 text-sm flex items-center gap-2"
          >

            <PiPlusSquareBold className="font-extrabold text-xl rounded-3xl" />{" "}
            Create
          </Link>
        </div>
      </div>

      <div  className="absolute h-[50%] border-b-2 overflow-auto -mt-3   md:right-[35%] right-[20%] top-50">
        {isFilterModalOpen && (
          <div className="overflow-auto border rounded-md shadow-md">
            <Filter
              onClose={closeFilterModal}
              onApply={applyFilters}
              filtersData={selectedFilters}
            />
          </div>
        )}
      </div>

      <div className="">
        <div className="border rounded-md overflow-auto hide-scrollbar h-[55vh] ">
          <Table
            // data={vendors}
            data={vendors}
            columns={columns}
            actions={actions}
            onRowClick={handleRowClick}
            loading={loading}
            style={"bg-gray-100 "}
            currentPage={page}
            itemsPerPage={10}
          />
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

      <div
        ref={menuRef}
        className={`fixed top-0 right-0 w-[33%] p-6 bg-white shadow-lg h-full z-10 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="">
          {companyData && (
            <div className="flex justify-between mt-4  items-center">
              <p className="text-md font-semibold flex items-center gap-2">
                <button onClick={closeSidebar}>
                  <FaArrowLeft />
                </button>
                {companyData?.Vendor[0]?.name || ""}
                <span>{companyData?.Vendor[0]?.id || ""}</span>
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <h3 className="text-lg font-medium mt-4">Basic Information</h3>
            <MdOutlineKeyboardArrowDown />
          </div>
          {companyData && (
            <div className="grid grid-cols-3 text-sm gap-8">
              <div className="space-y-2">
                <p className="font-semibold">Name</p>
                <p>{companyData?.Vendor[0]?.name || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Phone</p>
                <p>{companyData?.Vendor[0]?.phone || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Email</p>
                <p>{companyData?.Vendor[0]?.email || ""}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between py-2">
            <h3 className="text-lg font-medium mt-4">General Information</h3>
            <MdOutlineKeyboardArrowDown />
          </div>
          {companyData && (
            <div className="grid grid-cols-3 text-sm gap-8">
              <div className="space-y-2">
                <p className="font-semibold">Company Name</p>
                <p>{companyData?.companyName || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Establishment Date</p>
                <p>{companyData?.establishmentDate?.split("T")[0] || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Type</p>
                <p>{companyData?.nature || ""}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between py-2">
            <h3 className="text-lg font-medium mt-4">Vendor Details</h3>
            <MdOutlineKeyboardArrowDown />
          </div>
          {companyData && (
            <div className="grid grid-cols-3 text-sm gap-8">
              <div className="space-y-2">
                <p className="font-semibold">GST No</p>
                <p>
                  {companyData?.gstNumber || ""}{" "}
                  <span className="text-blue-800">
                    <a
                      href={`${import.meta.env.VITE_ASSEST_URL}/uploads/${
                        companyData.gstFileUrl
                      }`}
                      target="_blank"
                    >
                      View
                    </a>
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Pan No</p>
                <p>
                  {companyData?.panNumber || ""}{" "}
                  <span className="text-blue-800">
                    <a
                      href={`${import.meta.env.VITE_ASSEST_URL}/uploads/${
                        companyData.panFileUrl
                      }`}
                      target="_blank"
                    >
                      View
                    </a>
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">MSME No</p>
                <p>
                  {companyData?.msmeNumber || ""}{" "}
                  <span className="text-blue-800">
                    <a
                      href={`${import.meta.env.VITE_ASSEST_URL}/uploads/${
                        companyData.msmeFileUrl
                      }`}
                      target="_blank"
                    >
                      View
                    </a>
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Certificate</p>
                <p>
                  {companyData?.ciNumber || ""}{" "}
                  <span className="text-blue-800">
                    <a
                      href={`${import.meta.env.VITE_ASSEST_URL}/uploads/${
                        companyData.ciFileUrl
                      }`}
                      target="_blank"
                    >
                      View
                    </a>
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold"> Type</p>
                <p>{companyData?.type || ""}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between py-2">
            <h3 className="text-lg font-medium mt-4">
              Point of Contact Details
            </h3>
            <MdOutlineKeyboardArrowDown />
          </div>
          {companyData && (
            <div className="grid grid-cols-3 text-sm gap-8">
              <div className="space-y-2">
                <p className="font-semibold">Name</p>
                <p>{companyData?.pocName || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Designation</p>
                <p>{companyData?.pocDesignation || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Email</p>
                <p>{companyData?.pocEmail || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Phone</p>
                <p>{companyData?.pocPhone || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Website</p>
                <p>{companyData?.pocWebsite || ""}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between py-2">
            <h3 className="text-lg font-medium mt-4">Bank Details</h3>
            <MdOutlineKeyboardArrowDown />
          </div>
          {companyData && (
            <div className="grid grid-cols-3 text-sm gap-8">
              <div className="space-y-2">
                <p className="font-semibold">Bank Name</p>
                <p>{companyData?.bankName || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Beneficiary Name</p>
                <p>{companyData?.beneficiaryName || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Account No</p>
                <p>{companyData?.accountNumber || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">IFSC Code</p>
                <p>{companyData?.ifscCode || ""}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Bank Address</p>
                <p>{companyData?.fullAddress || ""}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* delete Modal */}
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

export default VendorManagement;
