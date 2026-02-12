import { useState } from "react";
import { IoCheckmarkCircleOutline, IoSearchOutline } from "react-icons/io5";
import { VscSettings } from "react-icons/vsc";
import { PiDownloadSimpleBold, PiPlusSquareBold } from "react-icons/pi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaArrowLeft, FaCaretDown, FaPlus, FaRegEye } from "react-icons/fa";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import { authApi } from "../../api";
import Filter from "../Filter";
import Modal from "../Modal";
import Breadcrumb from "../BreadeCrum";
import toast from "react-hot-toast";

const Contracts = () => {
  const { state } = useLocation();

  const navigate = useNavigate();
  const [selectedContract, setSelectedContract] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [contractModel, setContractModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([
    {
      moduleName: "Contracts",
      filterBy: "rating",
      controlType: "rangeNumeric",
      label: "Rating",
      description: "",
      range: [0, 10],
      value: [0, 10],
    },
    {
      moduleName: "Contracts",
      filterBy: "status",
      controlType: "checkbox",
      label: "Status",
      description: "Include only active projects",
      value: false,
      options: ["Created", "Opened", "Completed", "Verified", "InitialQuotation", "Expired", "Accepted"],
    },
  ])


  const {
    data: contract,
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
    setFilters,
    totalDoc,
    setTotalDoc,
    refetch,
  } = useFetchData("/contract/get-all", 10, undefined, undefined, {
    requisitionid: state.id,
  });
  console.log({ contract });

  const debounce = useDebounce(setSearch, 600);

  const columns = [
    {
      header: "Contract ID",
      accessor: "id",
    },

    {
      header: "Vendor Name",
      accessor: "Vendor",
      accessorKey: "name",
    },
    {
      header: "Rating",
      accessor: "vendorId",

      isRating: (id) => {
        // Ensure benchmarkResponse exists and is parsed properly
        const benchmarkData = state?.benchmarkResponse
          ? JSON.parse(state.benchmarkResponse)
          : null;

        if (!benchmarkData?.VendorComparison || !Array.isArray(benchmarkData.VendorComparison)) {
          return "0.00";
        }

        // Get the vendor by ID and check if it exists
        const vendor = benchmarkData.VendorComparison[id];
        if (!vendor || !Array.isArray(vendor.Products)) return "0.00";

        // Calculate the total rating
        let totalRatingSum = 0;
        let validProductCount = 0;

        vendor.Products.forEach((product) => {
          if (!product?.ContractDetails || !Array.isArray(product.ContractDetails)) return;

          let productRatingSum = 0;
          let validContractCount = 0;

          product.ContractDetails.forEach((contract) => {
            if (typeof contract.rating === "number") {
              productRatingSum += contract.rating;
              validContractCount++;
            }
          });

          if (validContractCount > 0) {
            totalRatingSum += productRatingSum / validContractCount; // Average per product
            validProductCount++;
          }
        });

        // If no valid products, return "0.00" instead of NaN
        return validProductCount > 0 ? (totalRatingSum / validProductCount).toFixed(2) : "0.00";
      },


    },
    {
      header: "Link",
      accessor: "uniqueToken",
      isLink: `${import.meta.env.VITE_FRONTEND_URL}/vendor-contract/`,
    },
    {
      header: "Created On",
      accessor: "createdAt",
    },
    {
      header: "Contract Status",
      accessor: "status",
      isBadge: true,
    },
  ];

  const handleContractApproved = async (row) => {
    try {
      const {
        data: { data },
      } = await authApi.put(`/contract/approve/${row.id}`);
      console.log("Approved Data:", data);

      const response = await authApi.get(
        `/requisition/get/${row.requisitionId}`
      );
      const requisitionData = response.data.data;

      const detailsArray = JSON.parse(row.contractDetails);

      const lineItems = requisitionData.RequisitionProduct.map((product) => ({
        productId: product.productId,
        qty: product.qty,
        price: product.price || 0,
      }));

      const payload = {
        contractId: row.id,
        requisitionId: row.requisitionId,
        vendorId: row.Vendor.id,
        lineItems,
        // poUrl: "https://www.google.com/",
      };

      console.log("Payload for PO:", payload);

      const po = await authApi.post(`/po/create`, payload);
      console.log("PO Created:", po.data);

      refetch();
    } catch (error) {
      console.error(error.message || "Something went wrong");
    } finally {
      setIsModalOpen(false);
    }
  };

  const actions = [
    {
      type: "button",
      label: "Approve Contract",
      icon: <IoCheckmarkCircleOutline />,
      condition: (row) => {
        if (row.status === "Accepted" || row.status === "Rejected" || row.status === "Created" || row.status === "InitialQuotation") {
          return false;
        }
        return true;
      },
      onClick: (row) => {
        setCurrentRow(row);
        setIsModalOpen(true);
      },
    },
    // {
    //   type: "button",
    //   label: "Download Pdf",
    //   icon: <PiDownloadSimpleBold />,
    // },
    {
      type: "button",
      label: "View Contracts",
      icon: <FaRegEye />,
      onClick: (row) => {
        console.log({ row: JSON.parse(row.contractDetails) });
        setContractModal(row);
      },
    },
  ];

  const handleRowClick = (contract) => {
    setSelectedContract(contract);
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
      setSelectedFilters(clearedFilters)
      setFilters(null)
      setIsFilterModalOpen((prev) => (!prev))
      return;
    }
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

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const breadcrumbItems = [];

  if (state?.Project?.projectId) {
    breadcrumbItems.push({
      label: "Project", // Static label for projectId
      value: state.Project.projectId, // Actual value
      onClick: () => navigate("/project-management"),
    });
  }

  if (state?.rfqId) {
    breadcrumbItems.push({
      label: "Requisition", // Static label for rfqId
      value: state.rfqId, // Actual value
      onClick: () => navigate(-1),
    });
  }
  const handleNavigation = (e) => {
    const hasDraft = contract.some(
      (cnt) => cnt.Requisition?.status === "Draft"
    );

    if (hasDraft) {
      navigate(`/requisition-management/edit-requisition/${state.id}?redirect=3`);
    } else {
      e.preventDefault(); // Prevent Link navigation
      toast.error("Cannot edit now. No draft requisition found!")
    }
  };


  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-lg shadow-md pt-6 px-6 pb-0 h-full">
        <div className=" justify-between gap-2 mb-4">
          <div className="mb-4">
            <p className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaArrowLeft
                onClick={() => navigate(-1)}
                className="cursor-pointer"
              />
              Contracts
            </p>
            {/* {state !== null && (
              <div className="flex gap-2  text-[#234BF3]  ">
                <div
                  className="text-sm cursor-pointer"
                  onClick={() => {
                    navigate(-2);
                  }}
                >
                  {state?.Project?.projectId}
                </div>
                {">"}
                <div
                  className="text-sm cursor-pointer"
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  {state?.rfqId}
                </div>
              </div>
            )} */}
            <Breadcrumb breadcrumbItems={breadcrumbItems} />
          </div>
          {console.log({ state })}


          <div className="flex justify-between gap-2 mb-4">
            <div className="relative col-span-1">
              <input
                onChange={(e) => debounce(e.target.value)}
                type="text"
                placeholder="Search Product"
                className="border pt-2 px-2 pb-0 border-gray-300 rounded-md pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
              />
              <IoSearchOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => setIsFilterModalOpen((prev) => !prev)}
                className="rounded-md px-4 pt-2 pb-0 text-sm font-medium text-black bg-[#F7F9FB] flex items-center gap-1"
              >
                <VscSettings /> Filter <FaCaretDown />
              </button>
              <button
                // to={`/requisition-management/edit-requisition/${state.id}?redirect=3`}
                className="bg-[#234BF3] text-white font-medium rounded-md px-4 pt-2 pb-0 text-sm flex items-center gap-2"
                onClick={handleNavigation}
              >
                <PiPlusSquareBold className="font-bold text-xl rounded-3xl" />{" "}
                Create
              </button>
              <div className="absolute md:right-[35%] right-[20%]">
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
            </div>
          </div>
        </div>
        <div className="border rounded-md overflow-auto h-[70vh]">
          <Table
            data={contract}
            columns={columns}
            actions={actions}
            loading={loading}
            currentPage={page}
            style={'bg-gray-100 '}
            itemsPerPage={10}
            onRowClick={handleRowClick}
          />
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalCount}
          onPageChange={setPage}
          limit={limit}
          totalDoc={totalDoc}
        />

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white pt-6 px-6 pb-0 rounded-md shadow-md w-1/3">
              <p className="text-lg font-semibold mb-4">
                Are you sure you want to approve this contract?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 pt-2 pb-0 bg-gray-300 rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 pt-2 pb-0 bg-blue-600 text-white rounded-md"
                  onClick={() => handleContractApproved(currentRow)}
                >
                  Yes, Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {contractModel && (
          <Modal
            wholeModalStyle="text-center"
            heading="Contract Details"
            btnsStyle="justify-center"
            additionalClasses="w-6/12 max-w-4xl"
            showCancelButton={false}
            isDeleteIcon={false}
            handleClose={() => {
              setContractModal(false);
            }}
            body={
              (() => {
                let contractDetails = {};

                try {
                  contractDetails = JSON.parse(contractModel?.contractDetails || "{}");
                } catch (error) {
                  console.error("Error parsing contract details:", error);
                  // Fallback to empty object if parsing fails
                  contractDetails = {};
                }

                // Handle both old flat structure and new nested structure
                let products = [];
                let paymentTerms = "N/A";
                let netPaymentDay = "";
                let prePaymentPercentage = "";
                let postPaymentPercentage = "";
                let additionalNotes = "";

                if (contractDetails.products && Array.isArray(contractDetails.products)) {
                  // New nested structure
                  products = contractDetails.products;
                  paymentTerms = contractDetails.additionalTerms?.paymentTerms || "N/A";
                  netPaymentDay = contractDetails.additionalTerms?.netPaymentDay || "";
                  prePaymentPercentage = contractDetails.additionalTerms?.prePaymentPercentage || "";
                  postPaymentPercentage = contractDetails.additionalTerms?.postPaymentPercentage || "";
                  additionalNotes = contractDetails.additionalTerms?.additionalNotes || "";
                } else if (Array.isArray(contractDetails)) {
                  // Old flat structure (fallback)
                  const paymentTermsObj = contractDetails.find(
                    (item) => item.name === "Payment Terms"
                  );
                  paymentTerms = paymentTermsObj?.value || "N/A";

                  // Group products from flat structure
                  const productMap = new Map();
                  contractDetails.forEach((item) => {
                    if (item.name && item.name.includes(" - ")) {
                      const [productName, field] = item.name.split(" - ");
                      if (!productMap.has(productName)) {
                        productMap.set(productName, { productName });
                      }
                      const product = productMap.get(productName);
                      if (field === "Quoted Price") {
                        product.quotedPrice = item.value;
                      } else if (field === "Delivery Date") {
                        product.deliveryDate = item.value;
                      }
                    }
                  });
                  products = Array.from(productMap.values());
                }

                // Format payment terms display
                let formattedPaymentTerms = paymentTerms;
                if (paymentTerms === "net_payment" && netPaymentDay) {
                  formattedPaymentTerms = `Net Payment - ${netPaymentDay} days`;
                } else if (paymentTerms === "pre_post_payment") {
                  const pre = prePaymentPercentage ? `${prePaymentPercentage}%` : "";
                  const post = postPaymentPercentage ? `${postPaymentPercentage}%` : "";
                  if (pre && post) {
                    formattedPaymentTerms = `Pre: ${pre}, Post: ${post}`;
                  } else if (pre) {
                    formattedPaymentTerms = `Pre: ${pre}`;
                  } else if (post) {
                    formattedPaymentTerms = `Post: ${post}`;
                  } else {
                    formattedPaymentTerms = "Pre and Post Payment";
                  }
                } else if (paymentTerms === "net_payment") {
                  formattedPaymentTerms = "Net Payment";
                } else if (paymentTerms === "pre_post_payment") {
                  formattedPaymentTerms = "Pre and Post Payment";
                }

                return (
                  <div className="space-y-6">
                    {/* Vendor Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg pt-4 px-4 pb-0 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {contractModel?.Vendor?.name || "Vendor Name"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Contract ID: {contractModel?.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 pt-1 pb-0 rounded-full text-xs font-medium ${
                            contractModel?.status === "Accepted" ? "bg-green-100 text-green-800" :
                            contractModel?.status === "Rejected" ? "bg-red-100 text-red-800" :
                            contractModel?.status === "InitialQuotation" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {contractModel?.status || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-6 pt-4 pb-0 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Product Quotations
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quoted Price
                              </th>
                              <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Value
                              </th>
                              <th className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delivery Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product, i) => {
                              const quantity = parseInt(product.quantity) || 1;
                              const price = parseFloat(product.quotedPrice) || 0;
                              const totalValue = price * quantity;
                              
                              return (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 pt-4 pb-0 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {product?.productName || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 pt-4 pb-0 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {quantity}
                                    </div>
                                  </td>
                                  <td className="px-6 pt-4 pb-0 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 font-semibold">
                                      {product?.quotedPrice ? `₹${product.quotedPrice}` : "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 pt-4 pb-0 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 font-semibold text-green-600">
                                      {totalValue > 0 ? `₹${totalValue.toLocaleString()}` : "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 pt-4 pb-0 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {product?.deliveryDate ? new Date(product.deliveryDate).toLocaleDateString() : "N/A"}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Payment Terms Section */}
                    <div className="bg-white rounded-lg border border-gray-200 pt-6 px-6 pb-0 shadow-sm">
                      <div className="flex items-center mb-4">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <h4 className="text-lg font-semibold text-gray-800">Payment Terms</h4>
                      </div>
                      <div className="bg-blue-50 rounded-lg pt-4 px-4 pb-0 border border-blue-100">
                        <p className="text-sm font-medium text-blue-900">
                          {formattedPaymentTerms}
                        </p>
                      </div>
                    </div>

                    {/* Additional Notes Section */}
                    {additionalNotes && (
                      <div className="bg-white rounded-lg border border-gray-200 pt-6 px-6 pb-0 shadow-sm">
                        <div className="flex items-center mb-4">
                          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h4 className="text-lg font-semibold text-gray-800">Additional Notes</h4>
                        </div>
                        <div className="bg-gray-50 rounded-lg pt-4 px-4 pb-0 border border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {additionalNotes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contract Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg pt-6 px-6 pb-0 border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Contract Summary</h4>
                          <p className="text-sm text-gray-600">
                            Total Products: {products.length} | 
                            Created: {new Date(contractModel?.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ₹{products.reduce((total, product) => {
                              const price = parseFloat(product.quotedPrice) || 0;
                              const quantity = parseInt(product.quantity) || 1; // Default to 1 if quantity not available
                              return total + (price * quantity);
                            }, 0).toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-500">Total Value</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            }
          ></Modal>
        )}


      </div>
    </div>
  );
};

export default Contracts;
