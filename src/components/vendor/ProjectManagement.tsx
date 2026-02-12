import React, { useEffect, useState } from "react";
import { IoSearchOutline, IoCloseCircle } from "react-icons/io5";
import { VscEdit } from "react-icons/vsc";
import { PiPlusSquareBold } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaArrowLeft, FaPlus, FaRegEye } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import { authApi } from "../../api";
import toast from "react-hot-toast";
import Modal from "../Modal";
import { useRef } from "react";
import { LuTwitch } from "react-icons/lu";
import { hasPermission } from "../../utils/permissions";

// Error boundary component - defined outside to prevent re-creation on each render
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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

const ProjectManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<any>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    pocInfo: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
    error: _error,
    totalCount,
    page,
    setPage,
    limit,
    setSearch,
    totalDoc,
    refetch,
  } = useFetchData("/project/get-all", 10);

  const debounceSearch = useDebounce(setSearch, 600);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debounceSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearch("");
  };

  const actions = [
    {
      type: "button" as const,
      label: "View Requisition",
      icon: <FaRegEye />,
      // link: (row) => ({
      //   pathname: `/requisition-management`,
      //   state: row,
      // }),
      onClick: (row: any) => handleViewRequisition(row),
      state: "whole",
    },
    {
      type: "button" as const,
      label: "View Details",
      icon: <FaRegEye />,
      onClick: (row: any) => handleViewDetails(row),
    },
    {
      type: "button" as const,
      label: "Add Requisition",
      icon: <FaPlus />,
      // link: () => `/project-management/create-requisition`,
      onClick: (row: any) => addRequisition(row),
    },
    {
      type: "button" as const,
      label: "Edit Details",
      icon: <VscEdit />,
      // link: (row) => `/project-management/editprojectform/${row.id}`,
      onClick: (row: any) => editProject(row),
    },
    {
      type: "button" as const,
      label: "Delete",
      icon: <RiDeleteBin5Line />,
      onClick: (row: any) => setIsDeleteModalOpen(row.id),
    },
  ];

  const handleRowClick = (project: any) => {
    navigate("/requisition-management", { state: project });

    // setSelectedProject(project);
    // setIsSidebarOpen(true);
  };

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setIsSidebarOpen(true);
  };
  const handleViewRequisition = (row: any) => {
    navigate("/requisition-management", {
      state: { id: row.id, tenureInDays: row.tenureInDays },
    });
  };
  const addRequisition = (row: any) => {
    navigate(`/requisition-management/create-requisition`, {
      state: { id: row.id, tenureInDays: row.tenureInDays },
    });
  };
  const editProject = (row: any) => {
    navigate(`/project-management/editprojectform/${row.id}`);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProject(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async (id: any) => {
    try {
      await authApi.delete(`/project/delete/${id}`);
      await refetch();
      toast.success("Project deleted successfully.");
    } catch (error: any) {
      toast.error(error.message || "An error occurred while deleting.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
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
    <ErrorBoundary>
      <div className="flex flex-col bg-white rounded-lg min-h-full">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-6 px-6 pb-4 flex-shrink-0">
          {/* Header */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <LuTwitch className="text-xl" /> Project Management
              </h1>
              {hasPermission("project", "C") && (
                <Link
                  to="/project-management/create-project"
                  className="bg-[#234BF3] text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#1d3fd8] transition-colors duration-200 shadow-sm"
                >
                  <PiPlusSquareBold className="font-extrabold text-xl" /> Create Project
                </Link>
              )}
            </div>
          </div>

          {/* Search and Stats Section */}
          <div className="mb-4">
            <div className="flex flex-col md:flex-row justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  type="text"
                  placeholder="Search by ID, name, category, tenure, POC..."
                  className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#234BF3] focus:border-transparent transition-all duration-200"
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
                  <IoSearchOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="font-semibold text-gray-900">{totalDoc}</span>
                </div>
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                  <span className="text-sm text-gray-600">Page: </span>
                  <span className="font-semibold text-gray-900">{page}/{Math.ceil(totalCount / limit)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 pb-6">
          <div className="flex flex-col justify-between mt-4">
            {/* Table Section */}
            <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-auto hide-scrollbar">
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
          </div>
        </div>
      </div>

      {/* Project Details Sidebar */}
        {isSidebarOpen && selectedProject && (
          <div
            ref={menuRef}
            className={`fixed top-0 right-0 w-1/3 pt-6 px-6 pb-0 bg-white shadow-xl h-full z-10 transition-transform transform ${
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
                <span className="text-sm text-gray-500">ID: {selectedProject.projectId}</span>
              </div>

              <div className="space-y-4">
                {/* Basic Information Section */}
                <div className="bg-gray-50 rounded-lg px-4 py-2">
                  <div
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded px-2 -mx-2 py-2"
                    onClick={() => toggleSection('basicInfo')}
                  >
                    <h3 className="text-lg font-medium text-gray-800">Basic Information</h3>
                    {expandedSections.basicInfo ? (
                      <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
                    ) : (
                      <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
                    )}
                  </div>
                  {expandedSections.basicInfo && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pb-4">
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
                  )}
                </div>

                {/* Point of Contact Section */}
                <div className="bg-gray-50 rounded-lg px-4 py-2">
                  <div
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded px-2 -mx-2 py-2"
                    onClick={() => toggleSection('pocInfo')}
                  >
                    <h3 className="text-lg font-medium text-gray-800">Point of Contact</h3>
                    {expandedSections.pocInfo ? (
                      <MdOutlineKeyboardArrowUp className="text-xl text-gray-500" />
                    ) : (
                      <MdOutlineKeyboardArrowDown className="text-xl text-gray-500" />
                    )}
                  </div>
                  {expandedSections.pocInfo && (
                    <div className="space-y-2 mt-4 pb-4">
                      {selectedProject?.ProjectPoc?.length > 0 ? (
                        selectedProject.ProjectPoc.map((poc: any) => (
                          <div key={poc?.userId} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#234BF3] rounded-full"></div>
                            <span className="text-gray-900">{poc?.User?.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No POC assigned</p>
                      )}
                    </div>
                  )}
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
            onClose={closeDeleteModal}
            body={
              <div className="py-4">
                <p className="text-gray-600 mb-2">Are you sure you want to delete this project?</p>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            }
          />
        )}
    </ErrorBoundary>
  );
};

export default ProjectManagement;
