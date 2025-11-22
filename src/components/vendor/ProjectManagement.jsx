import React, { useEffect, useState } from "react";
import { AiFillProject } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { VscEdit, VscSettings } from "react-icons/vsc";
import { PiPlusSquareBold } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";
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
import { useRef } from "react";
import { LuTwitch } from "react-icons/lu";
import { hasPermission } from "../../utils/permissions";
import { createPortal } from "react-dom";

const FilterModal = ({ isOpen, onClose, selectedFilters, setSelectedFilters, applyFilters }) => {
  const [localMin, setLocalMin] = useState(selectedFilters[0].value[0]);
  const [localMax, setLocalMax] = useState(selectedFilters[0].value[1]);

  useEffect(() => {
    if (isOpen) {
      setLocalMin(selectedFilters[0].value[0]);
      setLocalMax(selectedFilters[0].value[1]);
    }
  }, [isOpen, selectedFilters]);

  const handleApply = () => {
    // Validate the range values
    const minValue = localMin === '' ? selectedFilters[0].range[0] : Number(localMin);
    const maxValue = localMax === '' ? selectedFilters[0].range[1] : Number(localMax);

    // Ensure min is not greater than max
    if (minValue > maxValue) {
      toast.error('Minimum value cannot be greater than maximum value');
      return;
    }

    const newFilters = [...selectedFilters];
    newFilters[0].value = [minValue, maxValue];
    setSelectedFilters(newFilters);
    applyFilters(newFilters);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-start justify-center pt-20">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden relative max-w-2xl w-full mx-4">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234BF3] to-blue-400"></div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <VscSettings className="text-[#234BF3] text-lg" />
              <h3 className="text-lg font-semibold text-gray-900">Filter Projects</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {selectedFilters.map((filter, index) => (
              <div key={index} className="space-y-3 bg-gray-50/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900">
                    {filter.label}
                  </label>
                </div>

                {filter.controlType === "rangeNumeric" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                        <input
                          type="number"
                          min={filter.range[0]}
                          max={filter.range[1]}
                          value={localMin}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value);
                            setLocalMin(value);
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#234BF3] focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="Min"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                        <input
                          type="number"
                          min={filter.range[0]}
                          max={filter.range[1]}
                          value={localMax}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value);
                            setLocalMax(value);
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#234BF3] focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#234BF3] transition-all duration-200 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 text-sm font-medium text-white bg-[#234BF3] border border-transparent rounded-lg hover:bg-[#1d3fd8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#234BF3] transition-all duration-200 shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ProjectManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [localFilterValues, setLocalFilterValues] = useState({ min: 1, max: 360 });
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [selectedFilters, setSelectedFilters] = useState([
    {
      moduleName: "Project",
      filterBy: "tenureInDays",
      controlType: "rangeNumeric",
      label: "Tenure",
      range: [1, 360],
      value: [1, 360],
    }
  ]);

  const columns = [
    { header: "Project Id", accessor: "projectId" },
    { header: "Name", accessor: "projectName" },
    { header: "Business Category", accessor: "typeOfProject" },
    { header: "Tenure", accessor: "tenureInDays" },
    {
      header: "POC",
      accessor: "ProjectPoc",
      accessorKey: "User",
      accessorSubKey: "name",
    },
  ];

  const {
    data: projects,
    loading,
    error,
    totalCount,
    page,
    setPage,
    limit,
    setSearch,
    totalDoc,
    setFilters,
    refetch,
  } = useFetchData("/project/get-all", 10);

  const debounceSearch = useDebounce(setSearch, 600);

  const actions = [
    {
      type: "button",
      label: "View Requisition",
      icon: <FaRegEye />,
      // link: (row) => ({
      //   pathname: `/requisition-management`,
      //   state: row,
      // }),
      onClick: (row) => handleViewRequisition(row),
      state: "whole",
    },
    {
      type: "button",
      label: "View Details",
      icon: <FaRegEye />,
      onClick: (row) => handleViewDetails(row),
    },
    {
      type: "button",
      label: "Add Requisition",
      icon: <FaPlus />,
      // link: () => `/project-management/create-requisition`,
      onClick: (row) => addRequisition(row),
    },
    {
      type: "button",
      label: "Edit Details",
      icon: <VscEdit />,
      // link: (row) => `/project-management/editprojectform/${row.id}`,
      onClick: (row) => editProject(row),
    },
    {
      type: "button",
      label: "Delete",
      icon: <RiDeleteBin5Line />,
      onClick: (row) => setIsDeleteModalOpen(row.id),
    },
  ];

  const handleRowClick = (project) => {
    navigate("/requisition-management", { state: project });

    // setSelectedProject(project);
    // setIsSidebarOpen(true);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsSidebarOpen(true);
  };
  const handleViewRequisition = (row) => {
    navigate("/requisition-management", {
      id: row.id,
      tenureInDays: row.tenureInDays,
    });
  };
  const addRequisition = (row) => {
    navigate(`/requisition-management/create-requisition`, {
      state: { id: row.id, tenureInDays: row.tenureInDays },
    });
  };
  const editProject = (row) => {
    navigate(`/project-management/editprojectform/${row.id}`);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProject(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async (id) => {
    try {
      await authApi.delete(`/project/delete/${id}`);
      await refetch();
      toast.success("Project deleted successfully.");
    } catch (error) {
      toast.error(error.message || "An error occurred while deleting.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const applyFilters = (filters) => {
    try {
      if (filters === null) {
        // Reset filters to default values
        const resetFilters = selectedFilters.map(filter => {
          if (filter.controlType === "rangeNumeric") {
            return { ...filter, value: [...filter.range] };
          }
          return filter;
        });
        setSelectedFilters(resetFilters);
        setFilters(null);
        setIsFilterModalOpen(false);
        return;
      }

      // Transform filters for API
      const apiFilters = filters.map(filter => {
        if (filter.controlType === "rangeNumeric") {
          // Ensure we have valid numbers for the range
          const minValue = filter.value[0] === '' ? filter.range[0] : Number(filter.value[0]);
          const maxValue = filter.value[1] === '' ? filter.range[1] : Number(filter.value[1]);
          
          return {
            moduleName: "Project",
            filterBy: "tenureInDays",
            operator: "between",
            controlType: "rangeNumeric",
            value: [minValue, maxValue]
          };
        }
        return filter;
      });

      // Apply the filters to the table
      setFilters(JSON.stringify(apiFilters));
      setIsFilterModalOpen(false);
      
      // Show a toast notification
      toast.success('Filters applied successfully');
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Error applying filters. Please try again.');
    }
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

  // Add error boundary component
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error in component:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-red-800 font-medium">Something went wrong.</h2>
            <p className="text-red-600 text-sm mt-1">Please try refreshing the page.</p>
          </div>
        );
      }

      return this.props.children;
    }
  }

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-lg h-full p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
              <LuTwitch className="text-2xl text-[#234BF3]" /> Project Management
            </h1>
            {hasPermission("project", "C") && (
              <Link
                to="/project-management/create-project"
                className="bg-[#234BF3] text-white font-medium rounded-lg px-5 py-2.5 text-sm flex items-center gap-2 hover:bg-[#1d3fd8] transition-colors duration-200 shadow-sm"
              >
                <PiPlusSquareBold className="font-extrabold text-xl" /> Create Project
              </Link>
            )}
          </div>
        </div>

        {/* Search and Stats Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                onChange={(e) => debounceSearch(e.target.value)}
                type="text"
                placeholder="Search projects by name..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#234BF3] focus:border-transparent transition-all duration-200"
              />
              <IoSearchOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Total Projects: </span>
                <span className="font-semibold text-gray-900">{totalDoc}</span>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Page: </span>
                <span className="font-semibold text-gray-900">{page} of {Math.ceil(totalCount / limit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterModalOpen((prev) => !prev)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                isFilterModalOpen 
                  ? 'bg-[#234BF3] text-white shadow-sm' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <VscSettings className={isFilterModalOpen ? 'text-white' : 'text-gray-500'} /> 
              Filters
              <FaCaretDown className={`transition-transform duration-200 ${isFilterModalOpen ? 'rotate-180' : ''}`} />
            </button>
            {selectedFilters.some(filter => 
              (filter.controlType === "rangeNumeric" && (filter.value[0] !== filter.range[0] || filter.value[1] !== filter.range[1]))
            ) && (
              <button
                onClick={() => applyFilters(null)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                Clear all filters
              </button>
            )}
          </div>

          <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            applyFilters={applyFilters}
          />
        </div>

        {/* Table Section */}
        <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-auto h-[70vh] hide-scrollbar">
            <Table
              data={projects}
              columns={columns}
              actions={actions}
              onRowClick={handleRowClick}
              loading={loading}
              currentPage={page}
              style="bg-white"
              itemsPerPage={10}
            />
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalCount}
            onPageChange={setPage}
            limit={limit}
            totalDoc={totalDoc}
          />
        </div>

        {/* Project Details Sidebar */}
        {isSidebarOpen && selectedProject && (
          <div
            ref={menuRef}
            className={`fixed top-0 right-0 w-1/3 p-6 bg-white shadow-xl h-full z-10 transition-transform transform ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={closeSidebar}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <FaArrowLeft className="text-gray-600" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">Project Details</h2>
                </div>
                <span className="text-sm text-gray-500">ID: {selectedProject.Id}</span>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Project Name</p>
                      <p className="font-medium text-gray-900">{selectedProject.projectName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Project Type</p>
                      <p className="font-medium text-gray-900">{selectedProject.typeOfProject}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{selectedProject.projectAddress}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Tenure</p>
                      <p className="font-medium text-gray-900">
                        {selectedProject.tenureInDays} Day{selectedProject.tenureInDays > 1 && "s"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Point of Contact</h3>
                  <div className="space-y-2">
                    {selectedProject?.ProjectPoc?.map((poc) => (
                      <div key={poc?.userId} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#234BF3] rounded-full"></div>
                        <span className="text-gray-900">{poc?.User?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <Modal
            wholeModalStyle="text-center"
            heading="Delete Project"
            cancelText="Cancel"
            actionText="Delete"
            isDeleteIcon
            btnsStyle="justify-center"
            onAction={() => confirmDelete(isDeleteModalOpen)}
            handleClose={closeDeleteModal}
          >
            <div className="py-4">
              <p className="text-gray-600 mb-2">Are you sure you want to delete this project?</p>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </Modal>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ProjectManagement;
