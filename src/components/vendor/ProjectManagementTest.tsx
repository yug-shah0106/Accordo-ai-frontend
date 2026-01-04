import { useState } from "react";
import { AiFillProject } from "react-icons/ai";
import { VscEdit, VscSettings } from "react-icons/vsc";
import { PiPlusSquareBold } from "react-icons/pi";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaCaretDown, FaPlus, FaRegEye } from "react-icons/fa";
import useFetchData from "../../hooks/useFetchData";
import toast from "react-hot-toast";
import Table from "../Table";

const Test = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const companyId = localStorage.getItem("%companyId%");

  const columns = [
    { header: "ID", accessor: "projectId" },
    { header: "Name", accessor: "projectName" },
    { header: "Type", accessor: "typeOfProject" },
    { header: "Tenure", accessor: "tenureInDays" },
  ];

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
      type: "link",
      label: "View Contracts",
      icon: <FaRegEye />,
      link: (row) => `/project-management/requisition/contract`,
      state: "whole",
    },
    {
      type: "link",
      label: "Add Vendor",
      icon: <FaPlus />,
      link: (row) => `/add-vendor/${row.Id}`,
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

  const {
    data: requisitions,
    //loading,
    error,
    // totalCount,
    // page,
    //  setPage,
    // limit,
    setSearch,
    // filter,
    setFilters,
    totalDoc,
    refetch,
  } = useFetchData(`/requisition/get-all?companyid=${companyId}`, 10);

  const { data: projects, loading, page, setPage, limit, totalCount } = useFetchData("/project/get-all", 10);

  const toggleAccordion = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg h-max shadow-md p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <AiFillProject /> Project Management Testing
        </h1>
      </div>

      {projects.map((project, i) => (
        <div key={i} className="rounded-md mb-2">{console.log({ data: project.projectId })}
          <div
            className="flex justify-between items-center rounded-md p-4 border cursor-pointer"
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

      <Pagination currentPage={page} totalPages={totalCount} onPageChange={setPage} limit={limit} />
    </div>
  );
};

export default Test;
