import { useState } from "react";
import { AiFillProject } from "react-icons/ai";
import { VscEdit } from "react-icons/vsc";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaCaretDown, FaPlus, FaRegEye } from "react-icons/fa";
import useFetchData from "../../hooks/useFetchData";
import Table from "../Table";

const Test = () => {
  const [_isDeleteModalOpen, _setIsDeleteModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const companyId = localStorage.getItem("%companyId%");

  // Columns definition (unused but kept for reference)
  // const _columns = [
  //   { header: "ID", accessor: "projectId" },
  //   { header: "Name", accessor: "projectName" },
  //   { header: "Type", accessor: "typeOfProject" },
  //   { header: "Tenure", accessor: "tenureInDays" },
  // ];

  const Rcolumns = [
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
      type: "link" as const,
      label: "View Contracts",
      icon: <FaRegEye />,
      link: (_row: any) => `/project-management/requisition/contract`,
      state: "whole",
    },
    {
      type: "link" as const,
      label: "Add Vendor",
      icon: <FaPlus />,
      link: (row: any) => `/add-vendor/${row.Id}`,
    },
    {
      type: "button" as const,
      label: "Create Bench Mark",
      icon: <FaPlus />,
      condition: (row: any) => {
        if (row.status === "Benchmarked") {
          return false;
        }
        return true;
      },
      onClick: (_row: any) => {
        // handleCreateBenchMark(row);
      },
    },
    {
      type: "button" as const,
      label: "View Bench Mark",
      icon: <FaRegEye />,
      condition: (row: any) => {
        if (row.status === "Benchmarked") {
          return true;
        }
        return false;
      },
      onClick: (_row: any) => {
        // setBenchMarkModal(row);
      },
    },
    {
      type: "button" as const,
      label: "Cancel Requisition",
      icon: <RiDeleteBin5Line />,
      onClick: (_row: any) => {
        // setIsModal(row.id);
      },
    },
    {
      type: "button" as const,
      label: "View Details",
      icon: <FaRegEye />,
      onClick: (_row: any) => {
        // setSelectedProject(row);
        // setIsSidebarOpen(row);
      },
    },
    {
      type: "link" as const,
      label: "Edit Details",
      icon: <VscEdit />,
      link: (row: any) => `/requisition-management/edit-requisition/${row.id}`,
    },
  ];

  const {
    data: requisitions,
    //loading,
    error: _error,
    // totalCount,
    // page,
    //  setPage,
    // limit,
    setSearch: _setSearch,
    // filter,
    setFilters: _setFilters,
    totalDoc: _totalDoc,
    refetch: _refetch,
  } = useFetchData(`/requisition/get-all?companyid=${companyId}`, 10);

  const { data: projects, loading, page, setPage, limit, totalCount } = useFetchData("/project/get-all", 10);

  const toggleAccordion = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg h-max shadow-md pt-6 px-6 pb-0">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <AiFillProject /> Project Management Testing
        </h1>
      </div>

      {projects.map((project: any, i: number) => (
        <div key={i} className="rounded-md mb-2">
          <div
            className="flex justify-between items-center rounded-md pt-4 px-4 pb-0 border cursor-pointer"
            onClick={() => toggleAccordion(i)}
          >
            <span className="text-lg font-semibold">{project.projectName}</span>
            <FaCaretDown className={`${expandedRow === project.projectId ? "rotate-180" : ""} transition-all`} />
          </div>

          {expandedRow === i && (
            <div className="p-4 border-t">
              <h3 className="text-md font-semibold">Project Details</h3>
              <Table
                data={requisitions ?? ''}
                columns={Rcolumns ?? ''}
                loading={loading ?? ''}
                actions={actions ?? ''}
              />
            </div>
          )}
        </div>
      ))}

      <Pagination currentPage={page} totalPages={totalCount} onPageChange={setPage} limit={limit} totalDoc={0} />
    </div>
  );
};

export default Test;
