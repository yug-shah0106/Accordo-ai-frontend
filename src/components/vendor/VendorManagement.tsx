import { useEffect, useRef, useState } from "react";
import { IoSearchOutline, IoCloseCircle } from "react-icons/io5";
import { VscEdit } from "react-icons/vsc";
import { PiPlusSquareBold } from "react-icons/pi";
import { Link } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaArrowLeft, FaRegEye } from "react-icons/fa";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import { authApi } from "../../api";
import Modal from "../Modal";
import { FiGitBranch } from "react-icons/fi";
import Filter from "../Filter";
import type {
  VendorRow,
  Company,
  TableColumn,
  TableAction,
  FilterOption,
  UseFetchDataReturn
} from "../../types/management.types";

const VendorManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<VendorRow | null>(null);
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    locationDetails: true,
    financialBanking: true,
    contactDocuments: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([
    {
      moduleName: "Vendors",
      filterBy: "totalContracts",
      controlType: "rangeNumeric",
      label: "Total Contracts",
      description: "The total contract price is $200",
      range: [1, 360],
      value: [1, 360],
    },
    {
      moduleName: "Vendors",
      filterBy: "completedContracts",
      controlType: "rangeNumeric",
      label: "Completed Contracts",
      description: "The total contract price is $200",
      range: [1, 360],
      value: [1, 360],
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

  const columns: TableColumn[] = [
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
  } = useFetchData("/vendor/get-all", 10) as UseFetchDataReturn<VendorRow>;
  const debounce = useDebounce(setSearch, 600);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debounce(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearch("");
  };

  const data = [
    { title: " Total Vendor ", count: additionalData.totalVendors },
    {
      title: "Active Vendor",
      count: additionalData.totalVendors - additionalData.inactiveVendors,
    },
    { title: "Inactive Vendor", count: additionalData.inactiveVendors },
  ];

  const actions: TableAction[] = [
    {
      type: "link",
      label: "Edit Details",
      icon: <VscEdit />,
      link: (row: VendorRow) => `/vendor-management/edit-vendor/${row.Vendor?.Company?.id || row.Vendor?.companyId || row.companyId}`,
    },
    {
      type: "button",
      label: "View Details",
      icon: <FaRegEye />,
      onClick: (row: VendorRow) => {
        handleRowClick(row);
      },
    },
    {
      type: "button",
      label: "Change Status",
      icon: <RiDeleteBin5Line />,
      onClick: (row: VendorRow) => {
        handleStatusChange(row);
      },
    },
  ];
  const handleStatusChange = async (row: VendorRow) => {
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

  const handleRowClick = (vendors: VendorRow) => {
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

  const handleDeleteModalConfirm = async (id: string) => {
    // Placeholder for delete confirmation
    console.log("Delete vendor:", id);
  };

  useEffect(() => {
    if (selectedProject) {
      fetchCompanyData();
    }
  }, [selectedProject]);

  const fetchCompanyData = async () => {
    if (!selectedProject) return;

    // Get companyId from various possible locations in the data structure
    const companyId = selectedProject?.Vendor?.companyId ||
                      selectedProject?.Vendor?.Company?.id ||
                      selectedProject?.companyId;

    if (!companyId) {
      console.error("No companyId found for vendor");
      return;
    }

    setIsLoadingDetails(true);
    try {
      const response = await authApi.get(`/company/get/${companyId}`);
      setCompanyData(response.data.data);
      console.log("Company data loaded:", response.data.data);
    } catch (error) {
      console.error("Error fetching company details:", error);
      setCompanyData(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const applyFilters = (filters: Record<string, FilterOption> | null) => {
    if (filters === null) {
      const clearedFilters = selectedFilters.map((filter) => {
        if (filter.controlType === "rangeNumeric" && filter.range) {
          return { ...filter, value: [filter.range[0], filter.range[1]] };
        } else if (filter.controlType === "checkbox") {
          return { ...filter, selected: {}, value: [] };
        } else if (filter.controlType === "rangeDate") {
          return { ...filter, value: { from: "", to: "" } };
        } else if (filter.controlType === "inputText") {
          return { ...filter, value: "" };
        }
        return filter;
      });
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
            (k) => filter.selected![k]
          ),
        };
      } else {
        acc[key] = filter;
      }

      return acc;
    }, {} as Record<string, FilterOption>);
    const apiFilters = Object.values(filters).map((filter: FilterOption) => {
      if (
        filter.controlType === "checkbox" &&
        typeof filter.selected === "object"
      ) {
        return {
          ...filter,
          value: Object.keys(filter.selected).filter(
            (key) => filter.selected![key]
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

    setSelectedFilters(Object.values(transformedFilters));
    setFilters(JSON.stringify(apiFilters));
    setIsFilterModalOpen(false);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedProject(null);
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col bg-white rounded-lg min-h-full">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-6 px-6 pb-4 flex-shrink-0">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FiGitBranch className="text-xl" />
            Vendor Management
          </h1>
        </div>

        {/* <div className=" grid xl:grid-cols-6 sm:grid-cols-3 gap-4 pt-4 pb-0">
          {data.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg shadow-sm pt-4 px-4 pb-0 flex flex-col justify-start"
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

        <div className="flex justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              type="text"
              placeholder="Search by ID, name, email..."
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
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 pb-6">

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
        <div className="border rounded-md overflow-auto hide-scrollbar">
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
      </div>

      <div
        ref={menuRef}
        className={`fixed top-0 right-0 w-[33%] bg-white shadow-lg h-full z-10 transition-transform transform overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <p className="text-lg font-semibold flex items-center gap-3">
              <button onClick={closeSidebar} className="hover:bg-gray-100 p-1 rounded">
                <FaArrowLeft />
              </button>
              <span>
                {companyData?.Vendor?.[0]?.name || selectedProject?.Vendor?.name || "Vendor Details"}
                {(companyData?.Vendor?.[0]?.id || selectedProject?.Vendor?.id) && (
                  <span className="text-gray-500 text-sm ml-2">
                    #{companyData?.Vendor?.[0]?.id || selectedProject?.Vendor?.id}
                  </span>
                )}
              </span>
            </p>
          </div>

          {/* Loading State */}
          {isLoadingDetails && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading vendor details...</span>
            </div>
          )}

          {/* No Data State */}
          {!isLoadingDetails && !companyData && (
            <div className="text-center py-12 text-gray-500">
              <p>No vendor details available</p>
            </div>
          )}

          {/* Content */}
          {!isLoadingDetails && companyData && (
            <>
              {/* Step 1: Basic & Company Info */}
              <div
                className="flex justify-between items-center pt-2 pb-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                onClick={() => toggleSection('basicInfo')}
              >
                <h3 className="text-md font-semibold text-gray-900">Basic & Company Info</h3>
                {expandedSections.basicInfo ? (
                  <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
                ) : (
                  <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
                )}
              </div>
              {expandedSections.basicInfo && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Contact Details</p>
                  <div className="grid grid-cols-3 text-sm gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-gray-900 font-medium">{companyData?.Vendor?.[0]?.name || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-900 font-medium">{companyData?.Vendor?.[0]?.phone || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium break-all">{companyData?.Vendor?.[0]?.email || "-"}</p>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Company Details</p>
                    <div className="grid grid-cols-3 text-sm gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Company Name</p>
                        <p className="text-gray-900 font-medium">{companyData?.companyName || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Establishment Date</p>
                        <p className="text-gray-900 font-medium">{companyData?.establishmentDate?.split("T")[0] || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Type/Nature</p>
                        <p className="text-gray-900 font-medium">{companyData?.nature || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location Details */}
              <div
                className="flex justify-between items-center pt-2 pb-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                onClick={() => toggleSection('locationDetails')}
              >
                <h3 className="text-md font-semibold text-gray-900">Location Details</h3>
                {expandedSections.locationDetails ? (
                  <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
                ) : (
                  <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
                )}
              </div>
              {expandedSections.locationDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 text-sm gap-4">
                    <div className="space-y-1 col-span-3">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-gray-900 font-medium">{companyData?.Addresses?.[0]?.address || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">City</p>
                      <p className="text-gray-900 font-medium">{companyData?.Addresses?.[0]?.city || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">State</p>
                      <p className="text-gray-900 font-medium">{companyData?.Addresses?.[0]?.state || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Zip Code</p>
                      <p className="text-gray-900 font-medium">{companyData?.Addresses?.[0]?.postalCode || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Country</p>
                      <p className="text-gray-900 font-medium">{companyData?.Addresses?.[0]?.country || "-"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Financial & Banking */}
              <div
                className="flex justify-between items-center pt-2 pb-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                onClick={() => toggleSection('financialBanking')}
              >
                <h3 className="text-md font-semibold text-gray-900">Financial & Banking</h3>
                {expandedSections.financialBanking ? (
                  <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
                ) : (
                  <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
                )}
              </div>
              {expandedSections.financialBanking && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Currency & Banking</p>
                  <div className="grid grid-cols-3 text-sm gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Currency</p>
                      <p className="text-gray-900 font-medium">{companyData?.typeOfCurrency || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Bank Name</p>
                      <p className="text-gray-900 font-medium">{companyData?.bankName || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Beneficiary Name</p>
                      <p className="text-gray-900 font-medium">{companyData?.beneficiaryName || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Account No</p>
                      <p className="text-gray-900 font-medium">{companyData?.accountNumber || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">IFSC Code</p>
                      <p className="text-gray-900 font-medium">{companyData?.ifscCode || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Swift Code</p>
                      <p className="text-gray-900 font-medium">{companyData?.swiftCode || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">IBAN</p>
                      <p className="text-gray-900 font-medium">{companyData?.iBanNumber || "-"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 text-sm gap-4 mt-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Bank Address</p>
                      <p className="text-gray-900 font-medium">{companyData?.fullAddress || "-"}</p>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Compliance Documents</p>
                    <div className="grid grid-cols-2 text-sm gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">GST Number</p>
                        <p className="text-gray-900 font-medium">
                          {companyData?.gstNumber || "-"}
                          {companyData?.gstFileUrl && (
                            <a
                              href={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.gstFileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 ml-2 text-xs hover:underline"
                            >
                              View
                            </a>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">PAN Number</p>
                        <p className="text-gray-900 font-medium">
                          {companyData?.panNumber || "-"}
                          {companyData?.panFileUrl && (
                            <a
                              href={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.panFileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 ml-2 text-xs hover:underline"
                            >
                              View
                            </a>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">MSME Number</p>
                        <p className="text-gray-900 font-medium">
                          {companyData?.msmeNumber || "-"}
                          {companyData?.msmeFileUrl && (
                            <a
                              href={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.msmeFileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 ml-2 text-xs hover:underline"
                            >
                              View
                            </a>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">CI Number</p>
                        <p className="text-gray-900 font-medium">
                          {companyData?.ciNumber || "-"}
                          {companyData?.ciFileUrl && (
                            <a
                              href={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.ciFileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 ml-2 text-xs hover:underline"
                            >
                              View
                            </a>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Contact & Documents */}
              <div
                className="flex justify-between items-center pt-2 pb-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                onClick={() => toggleSection('contactDocuments')}
              >
                <h3 className="text-md font-semibold text-gray-900">Contact & Documents</h3>
                {expandedSections.contactDocuments ? (
                  <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
                ) : (
                  <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
                )}
              </div>
              {expandedSections.contactDocuments && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Point of Contact</p>
                  <div className="grid grid-cols-3 text-sm gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-gray-900 font-medium">{companyData?.pocName || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Designation</p>
                      <p className="text-gray-900 font-medium">{companyData?.pocDesignation || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium break-all">{companyData?.pocEmail || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-900 font-medium">{companyData?.pocPhone || "-"}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="text-gray-900 font-medium">{companyData?.pocWebsite || "-"}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* delete Modal */}
      {isModal && (
        <Modal
          wholeModalStyle="text-center"
          heading="Are you sure do you want to Delete?"
          body="Are you sure you want to delete this vendor?"
          onClose={handleCloseModal}
          onAction={() => {
            handleDeleteModalConfirm("vendor-id");
            setIsModal(false);
          }}
          actionText="Yes"
          cancelText="No"
          isDeleteIcon={true}
          btnsStyle="justify-center"
        />
      )}
    </div>
  );
};

export default VendorManagement;
