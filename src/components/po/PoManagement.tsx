import { useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Table from "../Table";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import Modal from "../Modal";
import { BsDownload } from "react-icons/bs";
import { FaArrowLeft, FaCaretDown, FaRegEye } from "react-icons/fa";
import { authApi } from "../../api";
import { VscSettings } from "react-icons/vsc";
import { PiFramerLogo } from "react-icons/pi";
import Filter from "../Filter";
import type {
  PurchaseOrder,
  TableColumn,
  TableAction,
  FilterOption,
  UseFetchDataReturn
} from "../../types/management.types";

const PoManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PurchaseOrder | null>(null);
  const [isModal, setIsModal] = useState(false);
  const [cancelPoId, setCancelPoId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([
    {
      moduleName: "Po",
      filterBy: "status",
      controlType: "checkbox",
      label: "Po Status",
      description: "Po Status ",
      value: [],
      options: ["Created", "Cancelled"],
    },
    {
      moduleName: "Po",
      filterBy: "deliveryDate",
      controlType: "rangeDate",
      label: "PO Generated At ",
      value: { from: "", to: "" },
    },
  ]);

  const {
    data: pos,
    loading,
    totalCount,
    page,
    setPage,
    limit,
    setSearch,
    setFilters,
    totalDoc,
    refetch,
  } = useFetchData("/po/get-all", 10) as UseFetchDataReturn<PurchaseOrder>;
  const debounceSearch = useDebounce(setSearch, 600);

  const columns: TableColumn[] = [
    {
      header: "Req ID",
      accessor: "requisitionId",
    },
    {
      header: "Seller",
      accessor: "Vendor",
      accessorKey: "name",
    },
    {
      header: "PO Generated At",
      accessor: "createdAt",
    },
    {
      header: "Status",
      accessor: "status",
      isBadge: true,
    },
  ];

  const handleCloseModal = () => {
    setIsModal(false);
    setCancelPoId(null);
  };

  const handleCancelPo = async () => {
    if (cancelPoId) {
      try {
        const response = await authApi.put(`/po/cancel/${cancelPoId}`);
        console.log(response.status);
        refetch(); // Refresh data
        setIsModal(false);
        setCancelPoId(null);
      } catch (error) {
        console.error("Error canceling PO:", error);
        alert("An error occurred while canceling the purchase order.");
      }
    }
  };

  const actions: TableAction[] = [
    {
      type: "button",
      label: "View Details",
      icon: <FaRegEye />,
      onClick: (row: PurchaseOrder) => {
        handleRowClick(row);
      },
    },
    {
      type: "link",
      label: "Download PO",
      icon: <BsDownload />,
      link: (row: PurchaseOrder) =>
        `${import.meta.env.VITE_BACKEND_URL}/po/download/${row.id}`,
    },
    {
      type: "button",
      label: "Cancel PO",
      icon: <RiDeleteBin5Line />,
      onClick: (row: PurchaseOrder) => {
        setCancelPoId(row.id);
        setIsModal(true);
      },
    },
  ];

  const handleRowClick = (project: PurchaseOrder) => {
    setSelectedProject(project);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProject(null);
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

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-lg h-full p-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <PiFramerLogo className="text-xl" />
            PO Management
          </h1>
        </div>

        <div className="flex justify-between gap-2 mb-4">
          <div className="relative ">
            <input
              onChange={(e) => debounceSearch(e.target.value)}
              type="text"
              placeholder="Search by Seller"
              className="border border-gray-300 rounded-md pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full px-4"
            />
            <IoSearchOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <div className="flex gap-6">
            {/* <Link to="/po-management/summary">Summary</Link> */}
            <button
              onClick={() => setIsFilterModalOpen((prev) => !prev)}
              className="rounded-md px-4 py-2 text-sm font-medium text-black bg-[#F7F9FB] flex items-center gap-1"
            >
              <VscSettings /> Filter <FaCaretDown />
            </button>
            <div className="absolute z-30 md:right-[8%] mt-10 right-[20%]">
              {isFilterModalOpen && (
                <div className="overflow-auto border rounded-md shadow-md">
                  <Filter
                    onClose={closeFilterModal}
                    onApply={applyFilters}
                    filtersData={selectedFilters.reduce((acc, filter, idx) => {
                      acc[idx] = filter;
                      return acc;
                    }, {} as Record<string, FilterOption>)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="border rounded-md overflow-auto hide-scrollbar h-[70vh] ">
            <Table
              data={pos}
              columns={columns}
              actions={actions}
              loading={loading}
              style={"bg-gray-100 "}
              onRowClick={handleRowClick}
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
        className={`fixed top-0 right-0 w-1/4 p-6 bg-white shadow-lg h-full z-10 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="">
          {selectedProject && (
            <div className="flex justify-between mb-4 mt-8 items-center">
              <p className="text-md font-semibold flex items-center gap-2">
                <button onClick={closeSidebar}>
                  <FaArrowLeft />
                </button>
                <h3 className="text-lg font-medium ">Basic Information</h3>
                {selectedProject.id}
              </p>
            </div>
          )}

          {selectedProject && (
            <div className="grid grid-cols-3 text-sm gap-8">
              <div className="space-y-2">
                <p>PO ID</p>
                <p>{selectedProject.id}</p>
              </div>
              <div className="space-y-2">
                <p>Req ID</p>
                <p>{selectedProject.requisitionId}</p>
              </div>
              <div className="space-y-2">
                <p>Seller</p>
                <p>{selectedProject.vendorId}</p>
              </div>
              <div className="space-y-2">
                <p>PO Generated At</p>
                <p>{selectedProject.createdAt.split("T")[0]}</p>
              </div>
              <div className="space-y-2">
                <p>Status</p>
                <p>{selectedProject.status}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModal && (
        <Modal
          wholeModalStyle="text-center"
          heading="Are you sure you want to cancel this PO?"
          body="Are you sure you want to cancel this purchase order?"
          onClose={handleCloseModal}
          onAction={handleCancelPo}
          actionText="Yes"
          cancelText="No"
          isDeleteIcon={true}
          btnsStyle="justify-center"
        />
      )}
    </div>
  );
};

export default PoManagement;
