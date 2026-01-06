import { useEffect, useRef, useState } from "react";
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
import Badge from "../badge";
import Breadcrumb from "../BreadeCrum";
import { LuGitPullRequest } from "react-icons/lu";

const RequisitionsManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cursorLoading, setCursorLoading] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log({ state });

  const [isModal, setIsModal] = useState(false);
  const [benchmarkModal, setBenchMarkModal] = useState(false);
  const companyId = localStorage.getItem("%companyId%");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const menuRef = useRef(null);

  const [selectedFilters, setSelectedFilters] = useState([
    {
      moduleName: "Requisition",
      filterBy: "totalVendors",
      controlType: "rangeNumeric",
      label: "Total Vendor",
      description: "the Requisition",
      range: [0, 500],
      value: [0, 500],
    },
    {
      moduleName: "Requisition",
      filterBy: "subject",
      controlType: "inputText",
      label: "Subject",
      value: "",
    },
    {
      moduleName: "Requisition",
      filterBy: "category",
      controlType: "inputText",
      label: "Category",
      value: "",
    },
    {
      moduleName: "Requisition",
      filterBy: "status",
      controlType: "checkbox",
      label: "Requisition Status",
      description: "Requisition Status ",
      value: [],
      options: ["Fulfilled", "Created", "Benchmarked", "NegotiationStarted"],
    },
    // {
    //   "moduleName": "Requisition",
    //   "filterBy": "deliveryDate",
    //   "controlType": "rangeDate",
    //   "label": "Delivery Date",
    //   "value": []
    // },
    // {
    //   moduleName:"Requisition",
    //   filterBy:"targetPrice",
    //   controlType: "rangeNumeric",
    //   label: "Target Price",
    //   description: "the Target Price",
    //   range: [0, 500],
    //   value: [0, 500],
    // },
    // {
    //   moduleName:"Requisition",
    //   filterBy:"totalPrice",
    //   controlType: "rangeNumeric",
    //   label: "Total Price",
    //   description: "the Total Price",
    //   range: [0, 500],
    //   value: [0, 500],
    // },
  ]);

  const {
    data: requisitions,
    loading,
    error,
    totalCount,
    page,
    setPage,
    limit,
    setSearch,
    setFilters,
    totalDoc,
    refetch,
  } = useFetchData(
    state
      ? `/requisition/get-all?projectid=${state.id}`
      : `/requisition/get-all`,
    10
  );
  const debounce = useDebounce(setSearch, 600);

  console.log(state);

  useEffect(() => {
    if (cursorLoading) {
      document.body.style.cursor = "wait";
    } else {
      document.body.style.cursor = "default";
    }

    return () => {
      document.body.style.cursor = "default";
    };
  }, [cursorLoading]);

  const handleDeleteModalConfirm = async (id) => {
    try {
      await authApi.delete(`/requisition/delete/${id}`);
      await refetch();
      toast.success("Cancel confirmation");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };
  const handleCloseModal = async () => {
    setIsModal(false);
  };
  const handleCreateBenchMark = async (row) => {
    console.log(row);

    const isContractCreated = row?.Contract?.some(
      (contract) => contract?.status === "Created"
    );

    // If a contract is 'Created', show an error and return early
    if (isContractCreated) {
      toast.error("Contract not submitted the quotation.");
      return;
    }

    try {
      setCursorLoading(true);
      await authApi.post(`/benchmark/create`, {
        requisitionId: row?.id,
      });
      toast.success("Benchmark Created Successfully");
      await refetch();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setCursorLoading(false); // ✅ Stop loading
    }
  };

  const columns = [
    {
      header: "Project Id",
      accessor: "Project",
      accessorKey: "projectId",
    },
    {
      header: "RFQ Id",
      accessor: "rfqId",
    },
    {
      header: "Name",
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
    // {
    //   header: "DeliveryDate",
    //   accessor: "deliveryDate",
    // },
    // {
    //   header: "NegotiationDate",
    //   accessor: "negotiationClosureDate",
    // },
    {
      header: "Status",
      accessor: "status",
      isBadge: true,
    },
  ];

  const actions = [
    {
      type: "button",
      label: "View Contracts",
      icon: <FaRegEye />,
      // link: (row) => `/project-management/requisition/contract`,
      onClick: (row) => {
        handleRowClick(row);
      },
      state: "whole",
      condition: (row) => {
        if (row.status !== "Cancelled") {
          return true;
        }
        return false;
      },
    },
    {
      type: "button",
      label: "Add Vendor",
      icon: <FaPlus />,
      // link: (row) => `/requisition-management/edit-requisition/${row.id}?redirect=3`,
      onClick: (row) => addVendor(row),
      condition: (row) => {
        if (row.status !== "Cancelled") {
          return true;
        }
        return false;
      },
    },
    {
      type: "button",
      label: "Create Bench Mark",
      icon: <FaPlus />,
      condition: (row) => {
        // Hide if already benchmarked
        if (row.status === "Benchmarked") {
          return false;
        }
        // Show for Created and InitialQuotation statuses
        if (row.status === "InitialQuotation") {
          return true;
        }
        return false;
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
        console.log({ row });
        console.log(JSON.parse(row.benchmarkResponse));

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
      condition: (row) => {
        if (row.status !== "Cancelled") {
          return true;
        }
        return false;
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
      type: "button",
      label: "Edit Details",
      icon: <VscEdit />,
      // link: (row) => `/project-management/edit-requisition/${row.id}`,
      onClick: (row) => editDetails(row),
      condition: (row) => {
        if (row.status !== "Cancelled") {
          return true;
        }
        return false;
      },
    },
    {
      type: "button",
      label: "View Summary",
      icon: <FaRegEye />,
      condition: (row) => {
        // Check if any contract has status "Rejected" or "Accepted"
        if (row.Contract && row.Contract.some((contract) => 
          contract.status === "Accepted"
        )) {
          return true;
        }
        return false;
      },
      onClick: (row) => {
        navigate(`/group-summary?requisitionId=${row.id}`);
      },
    },
  ];

  const handleRowClick = (project) => {
    console.log({ project });

    if (project.status === "Cancelled") {
      toast.error("Requsition is Cancelled");
      return;
    }
    navigate(`/requisition-management/requisition/contract`, {
      state: project,
    });
    // setSelectedProject(project);
    // setIsSidebarOpen(true);
  };
  const editDetails = (row) => {
    console.log({ row });

    if (
      row.Contract &&
      row.Contract.some((contract) => contract.status !== "Created")
    ) {
      toast.error(
        "Editing is not allowed because a contract has 'InitialQuotation' status."
      );
      return;
    }

    navigate(`/requisition-management/edit-requisition/${row.id}`);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProject(null);
  };
  const addVendor = (row) => {
    navigate(`/requisition-management/edit-requisition/${row.id}?redirect=3`);
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

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const breadcrumbItems = [];

  if (state?.projectId) {
    breadcrumbItems.push({
      label: "Product", // Static label for projectId
      value: state.projectId, // Dynamic value
      onClick: () => navigate(-1),
    });
  }

  if (state?.rfqId) {
    breadcrumbItems.push({
      label: "Requisition", // Static label for rfqId
      value: state.rfqId, // Dynamic value
      onClick: () => navigate(-1),
    });
  }

  return (
    <div className="flex flex-col bg-white rounded-lg h-full overflow-hidden">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-6 px-6 pb-4 flex-shrink-0">
        <div className="mb-4">
          <p className="text-xl font-medium text-gray-800 flex items-center gap-2">
            {/* <FaArrowLeft
              onClick={() => {
                navigate(-1);
              }}
              className="cursor-pointer"
            /> */}
            <LuGitPullRequest className="text-xl" />
            All Requisitions
          </p>
          {/* {state !== null && <div className="text-sm text-[#234BF3] cursor-pointer" onClick={() => { navigate(-1) }}>{state.projectId} </div>} */}
          {state !== null && <Breadcrumb breadcrumbItems={breadcrumbItems} />}
        </div>

        <div className="flex justify-between gap-2">
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
            {/* <button
              onClick={() => setIsFilterModalOpen((prev) => !prev)}
              className="rounded-md px-4 py-2 text-sm font-medium text-black bg-[#F7F9FB] flex items-center gap-1"
            >
              <VscSettings /> Filter <FaCaretDown />
            </button> */}

            <div className="absolute md:right-[15%] mt-10 right-[20%]">
              {isFilterModalOpen && (
                <div className="overflow-auto h-[60vh] border rounded-md shadow-md">
                  <Filter
                    onClose={closeFilterModal}
                    onApply={applyFilters}
                    filtersData={selectedFilters}
                  />
                </div>
              )}
            </div>

            <Link
              to="/requisition-management/create-requisition"
              {...(state
                ? { state: { id: state.id, tenureInDays: state.tenureInDays } }
                : {})}
              className="bg-[#234BF3] text-white font-medium rounded-md px-4 py-2 text-sm flex items-center gap-2"
            >
              <PiPlusSquareBold className="font-extrabold text-xl rounded-3xl" />
              Create
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-0">
        <div
          className={`border rounded-md overflow-x-scroll hide-scrollbar-y ${cursorLoading ? "opacity-60 pointer-events-none cursor-wait" : ""
            }`}
        >
          <Table
            data={requisitions}
            columns={columns}
            actions={actions}
            style={"bg-gray-100 "}
            onRowClick={handleRowClick}
            loading={loading}
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
      {/* End Scrollable Content Area */}

      {/* Sidebar */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 w-2/6 pt-6 px-6 pb-0 bg-white shadow-lg h-full z-10 transition-transform transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
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
              {/* <Link
                to="/project-management/create-requisition"
                state={state}
                className="bg-[#FEEBDB] text-[#B24D00] font-sm rounded-full px-4 pt-2 pb-0 text-sm flex items-center gap-2"
              > */}
              <Badge status={selectedProject.status} />
              {/* </Link> */}
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
                <p>Benchmarking Date</p>
                <p>{selectedProject?.benchmarkingDate?.split("T")?.[0]}</p>
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
                      <td>{product?.targetPrice}</td>
                    </tr>
                  )) || <tr>No products found</tr>}
                </tbody>
              </table>
            </>
          )}

          <div className="grid grid-cols-3 mt-4 text-sm gap-8">
            <div className="space-y-2">
              <p className="font-medium text-gray-500">Total Price</p>
              <p>{selectedProject?.totalPrice}</p>
            </div>
          </div>
        </div>
        {selectedProject?.paymentTerms && (
          <div className="mt-2 pt-2 pb-0">
            <p className="font-medium text-gray-500">Payment Terms</p>
            <p className="text-xs">{selectedProject?.paymentTerms}</p>
          </div>
        )}
        {selectedProject?.RequisitionAttachment?.length > 0 && (
          <div className="mt-2 pt-2 pb-0">
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
          heading="Are you sure do you want to Cancel?"
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
          heading="Benchmark Details"
          btnsStyle="justify-center"
          additionalClasses="w-[50%]"
          showCancelButton={false}
          isDeleteIcon={false}
          handleClose={() => setBenchMarkModal(false)}
          body={
            <div className="overflow-x-auto pt-4 px-4 pb-0">
              {(() => {
                // Parse benchmark response once
                const benchmarkData = JSON.parse(
                  benchmarkModal?.benchmarkResponse || "{}"
                );

                // Get FinalBenchmark object
                const finalBenchmarkData = benchmarkData?.FinalBenchmark || {};

                // Extract all keys from FinalBenchmark (e.g., "Testing Product", "test")
                const benchmarkKeys = Object.keys(finalBenchmarkData);

                // Prepare combined data for each product with Price, Delivery Date, and Payment Terms
                const combinedData = benchmarkKeys.map((key) => {
                  const benchmarkItems = finalBenchmarkData[key] || [];

                  // Extract values for Price, Delivery Date, and Payment Terms
                  const priceItem = benchmarkItems.find((item) => item.name === "Price");
                  const deliveryItem = benchmarkItems.find((item) => item.name === "Delivery Date");
                  const paymentItem = benchmarkItems.find((item) => item.name === "Payment Terms");

                  return {
                    product: key,
                    price: priceItem?.value || "N/A",
                    deliveryDate: deliveryItem?.value || "N/A",
                    paymentTerms: paymentItem?.value || "N/A",
                  };
                });

                return combinedData.length > 0 ? (
                  <table className="w-full rounded-lg border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 pt-2 pb-0 text-center">
                          Product Name
                        </th>
                        <th className="border border-gray-300 px-4 pt-2 pb-0 text-center">
                          Price
                        </th>
                        <th className="border border-gray-300 px-4 pt-2 pb-0 text-center">
                          Delivery Date
                        </th>
                        <th className="border border-gray-300 px-4 pt-2 pb-0 text-center">
                          Payment Terms
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedData.map((item, idx) => (
                        <tr key={idx} className="even:bg-gray-50">
                          <td className="border border-gray-300 px-4 pt-2 pb-0 text-center">
                            {item?.product || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 pt-2 pb-0 text-center">
                            {item?.price || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 pt-2 pb-0 text-center">
                            {item?.deliveryDate || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 pt-2 pb-0 text-center">
                            {item?.paymentTerms || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600">No benchmark data available.</p>
                );
              })()}
            </div>
          }
        ></Modal>
      )}
    </div>
  );
};

export default RequisitionsManagement;
