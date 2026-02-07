import { useForm } from "react-hook-form";
import { FormSelect, SelectOption } from "../shared";
import Button from "../Button";
import useFetchData from "../../hooks/useFetchData";
import { RiDeleteBinLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { authApi } from "../../api";
import { FiExternalLink, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import chatbotService from "../../services/chatbot.service";
import type { DealStatus, VendorDealSummary } from "../../types/chatbot";

interface Contract {
  id: string;
  vendorId: string;
  uniqueToken: string;
}

interface Product {
  Product?: {
    productName: string;
  };
  qty: number;
  targetPrice: number;
}

interface Requisition {
  id: string;
  rfqNumber?: string;
  title?: string;
  projectName?: string;
  paymentTerms?: string;
  deliveryDate?: string;
  negotiationClosureDate?: string;
  status?: string;
  typeOfCurrency?: string;
  totalPrice?: string;
  Contract?: Contract[];
  RequisitionProduct?: Product[];
}

interface Vendor {
  id: string;
  vendorId: string;
  Vendor?: {
    name: string;
    companyName?: string;
    email?: string;
  };
}

interface VendorDetailsProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  requisitionId: string;
  requisition: Requisition | null;
}

interface FormData {
  selectedVendor: string;
  contractData?: Contract[];
}

// Deal status badge colors
const statusColors: Record<DealStatus, { bg: string; text: string }> = {
  NEGOTIATING: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ACCEPTED: { bg: 'bg-green-100', text: 'text-green-700' },
  WALKED_AWAY: { bg: 'bg-red-100', text: 'text-red-700' },
  ESCALATED: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

const VendorDetails: React.FC<VendorDetailsProps> = ({
  currentStep,
  nextStep,
  prevStep,
  requisitionId,
  requisition,
}) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      selectedVendor: "",
    },
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [deals, setDeals] = useState<VendorDealSummary[]>([]);
  const [loadingDeals, setLoadingDeals] = useState<boolean>(false);

  useEffect(() => {
    reset({
      contractData: requisition?.Contract,
    });
  }, [requisition, reset]);

  // Fetch deals for this requisition
  useEffect(() => {
    const fetchDeals = async () => {
      if (!requisitionId) return;

      setLoadingDeals(true);
      try {
        const response = await chatbotService.getRequisitionDeals(parseInt(requisitionId));
        setDeals(response.data?.deals || []);
      } catch (error) {
        console.warn('Failed to load deals:', error);
        setDeals([]);
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchDeals();
  }, [requisitionId]);

  const onSubmit = (data: FormData): void => {
    if (!watch("contractData")?.length && deals.length === 0) {
      toast.error("Add Vendor First");
      return;
    }
    try {
      toast.success("Requisition saved successfully");
      submitRequisition();
      navigate("/requisition-management");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  const { data, loading, error } = useFetchData<Vendor>("/vendor/get-all");
  const contractData = watch("contractData") || [];

  // Add vendor to requisition (creates contract without starting negotiation)
  const handleAddContract = async (): Promise<void> => {
    try {
      if (!watch("selectedVendor")) {
        toast.error("Select Vendor First");
        return;
      }
      const {
        data: { data: contractResponse },
      } = await authApi.post<{ data: Contract }>("/contract/create", {
        requisitionId: parseInt(requisitionId, 10),
        vendorId: parseInt(watch("selectedVendor"), 10),
        skipEmail: true,      // Don't send email - just adding vendor
        skipChatbot: true,    // Don't auto-create deal - user can start negotiation later
      });

      setValue("contractData", [...(watch("contractData") || []), contractResponse]);
      setValue("selectedVendor", "");
      toast.success("Vendor added successfully");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(errorMessage);
    }
  };

  const handleDeleteContract = async (id: string): Promise<void> => {
    try {
      await authApi.delete(`/contract/delete/${id}`);

      setValue(
        "contractData",
        watch("contractData")?.filter(
          (i) => i?.id?.toString() !== id?.toString()
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  // Open contract link in new window
  const handleOpenContractLink = (contract: Contract): void => {
    const link = `${import.meta.env.VITE_FRONTEND_URL}/vendor-contract/${contract?.uniqueToken}`;
    window.open(link, '_blank');
  };

  // Start negotiation for a vendor from Legacy Portal contract list
  const handleStartNegotiationForContract = (contract: Contract): void => {
    // Find the vendor data for this contract
    const matchedVendor = data?.find(
      (v) => v?.vendorId?.toString() === contract?.vendorId?.toString()
    );

    const searchParams = new URLSearchParams({
      rfqId: requisitionId,
      vendorId: contract.vendorId?.toString() || '',
      vendorName: matchedVendor?.Vendor?.name || '',
      locked: 'true',
      returnTo: `/requisition-management/edit-requisition/${requisitionId}`,
    });

    navigate(`/chatbot/requisitions/deals/new?${searchParams.toString()}`);
  };

  const handleModalConfirm = (): void => {
    setIsConfirmed(true);
    setIsModalOpen(false);
    try {
      navigate(-1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
  };

  // Navigate to deal negotiation room
  const handleViewDeal = (deal: VendorDealSummary): void => {
    navigate(`/chatbot/requisitions/${requisitionId}/vendors/${deal.vendorId}/deals/${deal.dealId}`);
  };

  const submitRequisition = async (): Promise<void> => {
    try {
      if (!requisition) return;

      const requestData = {
        id: requisition.id,
        payment_terms: requisition.paymentTerms,
        delivery_date: requisition.deliveryDate?.split("T")[0],
        negotiation_closure_date:
          requisition.negotiationClosureDate?.split("T")[0],
        status: requisition.status,
        type_of_currency: requisition.typeOfCurrency,
        total_price: requisition.totalPrice,
        products: requisition.RequisitionProduct?.map((product) => {
          return {
            product_name: product.Product
              ? product.Product.productName
              : "Unknown",
            quantity: product.qty,
            target_price: product.targetPrice,
          };
        }),
      };

      // Commented out as it's not currently used
      // const response = await axios.post(
      //   "https://model.accordo.ai/rfq/requisitions/",
      //   requestData
      // );
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  // Get vendors that don't already have a deal or contract
  const availableVendors = (data || []).filter((vendor) => {
    const hasContract = contractData.find(
      (contract) => contract?.vendorId?.toString() === vendor.vendorId?.toString()
    );
    const hasDeal = deals.find(
      (deal) => deal?.vendorId?.toString() === vendor.vendorId?.toString()
    );
    return !hasContract && !hasDeal;
  });

  // Format vendors for FormSelect
  const vendorOptions: SelectOption[] = availableVendors.map((vendor) => ({
    value: vendor.vendorId,
    label: vendor.Vendor?.name || vendor.Vendor?.companyName || 'Unknown Vendor',
  }));

  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">Vendor Details</h3>
      <p className="font-normal text-[#46403E] py-2">
        Select a vendor and start a negotiation deal
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-2 justify-between">
          <div className="grow">
            <FormSelect
              name="selectedVendor"
              placeholder="Select Vendor"
              options={vendorOptions}
              value={watch("selectedVendor") || ""}
              onChange={(e) => setValue("selectedVendor", e.target.value)}
              error={errors.selectedVendor?.message}
              className="my-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="px-4 cursor-pointer bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddContract}
              type="button"
              disabled={!watch("selectedVendor")}
            >
              Add Vendor
            </Button>
          </div>
        </div>

        {/* Active Negotiations Section */}
        {(deals.length > 0 || loadingDeals) && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Active Negotiations</h4>
            {loadingDeals ? (
              <div className="text-sm text-gray-500">Loading deals...</div>
            ) : (
              <ul className="space-y-2">
                {deals.map((deal) => {
                  const statusStyle = statusColors[deal.status] || statusColors.NEGOTIATING;

                  return (
                    <li
                      key={deal.dealId}
                      className="bg-blue-50 px-4 py-3 flex items-center justify-between gap-3 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {deal.vendorName || 'Unknown Vendor'}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                              {deal.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              Round {deal.currentRound}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleViewDeal(deal)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        View Deal
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Legacy Contracts Section */}
        {contractData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Vendor Contracts (Legacy Portal)</h4>
            <ul className="space-y-2">
              {contractData.map((contract, index) => {
                const matchedProduct = data?.find(
                  (i) => i?.vendorId?.toString() === contract?.vendorId?.toString()
                );
                return (
                  <li
                    key={index}
                    className="bg-[#F3F3F3] px-[10px] py-[10px] flex items-center justify-between gap-3 border-1 border-[#DDDDDD] select-none"
                  >
                    <div className="d-flex flex-md-row flex-column">
                      <span className="md:text-base flex-grow text-[13px] font-[590]">
                        {matchedProduct?.Vendor?.name}
                      </span>
                    </div>
                    <span className="flex items-center gap-3 flex-grow">
                      <div className="flex items-center px-[10px] py-[5px] bg-white min-w-[400px]">
                        <div className="cursor-pointer text-xs whitespace-nowrap overflow-x-auto">{`${import.meta.env.VITE_FRONTEND_URL
                          }/vendor-contract/${contract?.uniqueToken}`}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenContractLink(contract)}
                          className="p-2 rounded border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
                          title="Open contract link in new window"
                        >
                          <FiExternalLink className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteContract(contract?.id)}
                          className="p-2 rounded border border-red-300 bg-white hover:bg-red-50 transition-colors"
                          title="Delete contract"
                        >
                          <RiDeleteBinLine className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                      <Button
                        className="px-1 py-1 cursor-pointer bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1 text-xs whitespace-nowrap"
                        onClick={() => handleStartNegotiationForContract(contract)}
                        type="button"
                      >
                        <FiPlay className="w-3 h-3" />
                        Start Negotiation
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-start gap-4">
          <Button
            className="px-4 py-2 bg-[white] text-[black] border rounded !w-fit"
            onClick={() => {
              prevStep();
            }}
            type="button"
            disabled={isSubmitting || currentStep === 1}
          >
            Previous
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded !w-fit"
          >
            Done
          </Button>
        </div>
      </form>

      {isModalOpen && (
        <Modal
          wholeModalStyle="text-center"
          heading="Are you sure you want to proceed without adding any vendor?"
          cancelText="No"
          actionText="Yes"
          isDeleteIcon={true}
          btnsStyle="justify-center"
          onAction={handleModalConfirm}
          handleClose={handleModalClose}
        ></Modal>
      )}
    </div>
  );
};

export default VendorDetails;
