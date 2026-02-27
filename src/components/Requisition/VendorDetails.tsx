import { useForm } from "react-hook-form";
import { FormSelect, SelectOption } from "../shared";
import Button from "../Button";
import useFetchData from "../../hooks/useFetchData";
import { RiDeleteBinLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { authApi } from "../../api";
import { FiExternalLink, FiPlay, FiUser, FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "../Modal";
import chatbotService from "../../services/chatbot.service";
import type { DealStatus, VendorDealSummary } from "../../types/chatbot";

type ContractStatus = 'Created' | 'Active' | 'Opened' | 'Completed' | 'Verified' | 'Accepted' | 'Rejected' | 'Expired' | 'Escalated' | 'InitialQuotation';

interface Contract {
  id: string;
  vendorId: string;
  uniqueToken: string;
  status?: ContractStatus;
  createdAt?: string;
  chatbotDealId?: string | null;
  previousContractId?: string | null;
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

// Timeline item - can be either a deal or a contract
interface TimelineItem {
  type: 'deal' | 'contract';
  id: string;
  vendorId: string;
  createdAt: string;
  deal?: VendorDealSummary;
  contract?: Contract;
}

// Vendor group with their timeline items
interface VendorGroup {
  vendorId: string;
  vendorName: string;
  email?: string;
  items: TimelineItem[];
  dealCount: number;
  activeDeals: number;
  completedDeals: number;
}

// Deal status configuration with labels and colors
const statusConfig: Record<DealStatus, { label: string; bg: string; text: string; cardBg: string; cardBorder: string }> = {
  NEGOTIATING: {
    label: 'Active',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    cardBg: 'bg-blue-50',
    cardBorder: 'border-blue-200'
  },
  ACCEPTED: {
    label: 'Won',
    bg: 'bg-green-100',
    text: 'text-green-700',
    cardBg: 'bg-green-50',
    cardBorder: 'border-green-200'
  },
  WALKED_AWAY: {
    label: 'Lost',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    cardBg: 'bg-gray-50',
    cardBorder: 'border-gray-200'
  },
  ESCALATED: {
    label: 'Escalated',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    cardBg: 'bg-orange-50',
    cardBorder: 'border-orange-200'
  },
};

// Contract status configuration with labels and colors
const contractStatusConfig: Record<ContractStatus, { label: string; bg: string; text: string; cardBg: string; cardBorder: string }> = {
  Created: {
    label: 'Pending',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    cardBg: 'bg-purple-50',
    cardBorder: 'border-purple-200'
  },
  Active: {
    label: 'Negotiating',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    cardBg: 'bg-blue-50',
    cardBorder: 'border-blue-200'
  },
  Escalated: {
    label: 'Escalated',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    cardBg: 'bg-orange-50',
    cardBorder: 'border-orange-200'
  },
  Accepted: {
    label: 'Accepted',
    bg: 'bg-green-100',
    text: 'text-green-700',
    cardBg: 'bg-green-50',
    cardBorder: 'border-green-200'
  },
  Rejected: {
    label: 'Rejected',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    cardBg: 'bg-gray-50',
    cardBorder: 'border-gray-200'
  },
  Opened: {
    label: 'Opened',
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    cardBg: 'bg-cyan-50',
    cardBorder: 'border-cyan-200'
  },
  Completed: {
    label: 'Completed',
    bg: 'bg-green-100',
    text: 'text-green-700',
    cardBg: 'bg-green-50',
    cardBorder: 'border-green-200'
  },
  Verified: {
    label: 'Verified',
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    cardBg: 'bg-teal-50',
    cardBorder: 'border-teal-200'
  },
  Expired: {
    label: 'Expired',
    bg: 'bg-red-100',
    text: 'text-red-700',
    cardBg: 'bg-red-50',
    cardBorder: 'border-red-200'
  },
  InitialQuotation: {
    label: 'Quotation',
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    cardBg: 'bg-indigo-50',
    cardBorder: 'border-indigo-200'
  },
};

// Helper to get contract status config with fallback
const getContractStatusConfig = (status?: ContractStatus) => {
  return contractStatusConfig[status || 'Created'] || contractStatusConfig.Created;
};

// Helper to get deal counts by status for a vendor
const getVendorDealCounts = (vendorId: string, deals: VendorDealSummary[]): { active: number; completed: number } => {
  const vendorDeals = deals.filter(d => d.vendorId?.toString() === vendorId);
  const active = vendorDeals.filter(d => d.status === 'NEGOTIATING' || d.status === 'ESCALATED').length;
  const completed = vendorDeals.filter(d => d.status === 'ACCEPTED' || d.status === 'WALKED_AWAY').length;
  return { active, completed };
};

// Format vendor label with deal counts
const formatVendorLabel = (vendorName: string, active: number, completed: number): string => {
  if (active === 0 && completed === 0) {
    return vendorName;
  }

  const parts: string[] = [];
  if (active > 0) parts.push(`${active} Active`);
  if (completed > 0) parts.push(`${completed} Completed`);

  return `${vendorName} (${parts.join(', ')})`;
};

// Truncate token for display
const truncateToken = (token: string, maxLength: number = 12): string => {
  if (token.length <= maxLength) return token;
  return `${token.substring(0, maxLength)}...`;
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
  const [deals, setDeals] = useState<VendorDealSummary[]>([]);
  const [loadingDeals, setLoadingDeals] = useState<boolean>(false);
  const [activeVendorTab, setActiveVendorTab] = useState<string | null>(null);

  useEffect(() => {
    reset({
      contractData: requisition?.Contract,
    });
  }, [requisition, reset]);

  // Fetch deals for this requisition
  const fetchDeals = useCallback(async () => {
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
  }, [requisitionId]);

  // Fetch on mount
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Refetch when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDeals();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchDeals]);

  const { data, loading: _loading } = useFetchData<Vendor>("/vendor/get-all");
  const contractData = watch("contractData") || [];

  // Build vendor groups with timeline items
  const { vendorGroups, pendingContracts } = useMemo(() => {
    const groups: Map<string, VendorGroup> = new Map();
    const pending: Contract[] = [];

    // Add deals to groups
    deals.forEach(deal => {
      const vendorId = deal.vendorId?.toString() || '';
      if (!groups.has(vendorId)) {
        groups.set(vendorId, {
          vendorId,
          vendorName: deal.vendorName || 'Unknown Vendor',
          email: deal.vendorEmail,
          items: [],
          dealCount: 0,
          activeDeals: 0,
          completedDeals: 0,
        });
      }

      const group = groups.get(vendorId)!;
      group.items.push({
        type: 'deal',
        id: deal.dealId,
        vendorId,
        createdAt: deal.lastActivityAt || new Date().toISOString(),
        deal,
      });
      group.dealCount++;
      if (deal.status === 'NEGOTIATING' || deal.status === 'ESCALATED') {
        group.activeDeals++;
      } else {
        group.completedDeals++;
      }
    });

    // Process contracts - separate pending contracts from those linked to deals
    contractData.forEach(contract => {
      const vendorId = contract.vendorId?.toString() || '';
      // A contract is linked to a deal only if it has chatbotDealId set.
      // Unlinked contracts (chatbotDealId is null) are pending even if the vendor has other deals.
      const isLinkedToDeal = !!contract.chatbotDealId;

      if (!isLinkedToDeal) {
        // This is a pending contract (not linked to any deal)
        pending.push(contract);
      } else if (groups.has(vendorId)) {
        // Add contract to existing vendor group's timeline
        const group = groups.get(vendorId)!;
        group.items.push({
          type: 'contract',
          id: contract.id,
          vendorId,
          createdAt: contract.createdAt || new Date().toISOString(),
          contract,
        });
      }
    });

    // Sort timeline items chronologically (newest first)
    groups.forEach(group => {
      group.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    return {
      vendorGroups: Array.from(groups.values()),
      pendingContracts: pending,
    };
  }, [deals, contractData]);

  // Set default active tab
  useEffect(() => {
    if (!activeVendorTab && vendorGroups.length > 0) {
      setActiveVendorTab(vendorGroups[0].vendorId);
    }
  }, [vendorGroups, activeVendorTab]);

  const onSubmit = (): void => {
    if (!contractData?.length && deals.length === 0) {
      toast.error("Add Vendor First");
      return;
    }
    try {
      toast.success("Requisition saved successfully");
      submitRequisition();
      nextStep();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

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
      toast.success("Contract deleted successfully");
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

  // Copy link to clipboard
  const handleCopyLink = (contract: Contract): void => {
    const link = `${import.meta.env.VITE_FRONTEND_URL}/vendor-contract/${contract?.uniqueToken}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  // Start negotiation - opens wizard in a new tab with optional contractId or previousContractId
  const handleStartNegotiation = (vendorId: string, vendorName: string, contractId?: string, previousContractId?: string): void => {
    const searchParams = new URLSearchParams({
      rfqId: requisitionId,
      vendorId: vendorId,
      vendorName: vendorName,
      locked: 'true',
      returnTo: `/requisition-management/edit-requisition/${requisitionId}`,
    });

    // Re-negotiation: pass previousContractId so a new contract is created
    if (previousContractId) {
      searchParams.set('previousContractId', previousContractId);
    } else if (contractId) {
      searchParams.set('contractId', contractId);
    }

    window.open(`/chatbot/requisitions/deals/new?${searchParams.toString()}`, '_blank');
  };

  const handleModalConfirm = (): void => {
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

  // Open deal negotiation room in a new tab
  const handleViewDeal = (deal: VendorDealSummary): void => {
    window.open(`/chatbot/requisitions/${requisitionId}/vendors/${deal.vendorId}/deals/${deal.dealId}`, '_blank');
  };

  const submitRequisition = async (): Promise<void> => {
    try {
      if (!requisition) return;
      // Requisition submission logic (currently not used)
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  // Get all vendors that don't already have a contract
  const availableVendors = (data || []).filter((vendor) => {
    const hasContract = contractData.find(
      (contract) => contract?.vendorId?.toString() === vendor.vendorId?.toString()
    );
    const hasDeal = deals.find(
      (deal) => deal.vendorId?.toString() === vendor.vendorId?.toString()
    );
    return !hasContract && !hasDeal;
  });

  // Format vendors for FormSelect with deal count indicators
  const vendorOptions: SelectOption[] = availableVendors.map((vendor) => {
    const vendorName = vendor.Vendor?.name || vendor.Vendor?.companyName || 'Unknown Vendor';
    const { active, completed } = getVendorDealCounts(vendor.vendorId, deals);

    return {
      value: vendor.vendorId,
      label: formatVendorLabel(vendorName, active, completed),
    };
  });

  // Format date for timeline display (compact version)
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const activeGroup = vendorGroups.find(g => g.vendorId === activeVendorTab);

  return (
    <div className="border-2 rounded p-4 w-full max-w-full overflow-hidden">
      <h3 className="text-lg font-semibold">Vendor Details</h3>
      <p className="font-normal text-[#46403E] py-2 text-sm">
        Select a vendor and start a negotiation deal
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        {/* Vendor Selection */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-3/4">
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
          <div className="sm:w-1/4 flex items-center">
            <Button
              className="w-full px-3 py-2.5 cursor-pointer bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
              onClick={handleAddContract}
              type="button"
              disabled={!watch("selectedVendor")}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Tabbed Vendor View with Timeline */}
        {(vendorGroups.length > 0 || loadingDeals) && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Vendor Negotiations</h4>

            {loadingDeals ? (
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">Loading...</div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Tab Headers - Horizontal scroll */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                  {vendorGroups.map((group) => (
                    <button
                      key={group.vendorId}
                      type="button"
                      onClick={() => setActiveVendorTab(group.vendorId)}
                      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                        activeVendorTab === group.vendorId
                          ? 'border-blue-500 text-blue-600 bg-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        <span className="max-w-[120px] truncate">{group.vendorName}</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                          {group.dealCount}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Tab Content - Timeline View */}
                {activeGroup && (
                  <div className="p-4 bg-white">
                    {/* Vendor Summary Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 gap-3">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-gray-900 text-base truncate">{activeGroup.vendorName}</h5>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {activeGroup.activeDeals > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                            {activeGroup.activeDeals} Active
                          </span>
                        )}
                        {activeGroup.completedDeals > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            {activeGroup.completedDeals} Done
                          </span>
                        )}
                        <Button
                          className="px-3 py-1.5 cursor-pointer bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 text-sm"
                          onClick={() => handleStartNegotiation(activeGroup.vendorId, activeGroup.vendorName)}
                          type="button"
                        >
                          <FiPlay className="w-3 h-3" />
                          New
                        </Button>
                      </div>
                    </div>

                    {/* Deals Section */}
                    {(() => {
                      const dealItems = activeGroup.items.filter(i => i.type === 'deal');
                      return (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h6 className="text-sm font-semibold text-gray-700">Deals</h6>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                              {dealItems.length}
                            </span>
                          </div>
                          {dealItems.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No deals yet</p>
                          ) : (
                            <div className="space-y-2">
                              {dealItems.map((item) => (
                                <div
                                  key={item.id}
                                  className={`py-2 px-3 rounded-lg border ${statusConfig[item.deal!.status].cardBg} ${statusConfig[item.deal!.status].cardBorder}`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusConfig[item.deal!.status].bg} ${statusConfig[item.deal!.status].text}`}>
                                        {statusConfig[item.deal!.status].label}
                                      </span>
                                      <span className="text-xs text-gray-500 flex-shrink-0">
                                        Round {item.deal!.currentRound}/{item.deal!.maxRounds}
                                      </span>
                                      <span className="text-xs text-gray-400 flex-shrink-0">
                                        {formatDate(item.createdAt)}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleViewDeal(item.deal!)}
                                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                                    >
                                      <FiExternalLink className="w-4 h-4" />
                                      View
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Contracts Section */}
                    {(() => {
                      const contractItems = activeGroup.items.filter(i => i.type === 'contract');
                      return (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h6 className="text-sm font-semibold text-gray-700">Contracts</h6>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                              {contractItems.length}
                            </span>
                          </div>
                          {contractItems.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No contracts</p>
                          ) : (
                            <div className="space-y-2">
                              {contractItems.map((item) => {
                                const contractStatus = getContractStatusConfig(item.contract!.status);
                                const isSuperseded = item.contract!.status === 'Escalated' &&
                                  activeGroup.items.some(other =>
                                    other.type === 'contract' && other.contract?.previousContractId?.toString() === item.contract!.id.toString()
                                  );
                                return (
                                  <div
                                    key={item.id}
                                    className={`py-2 px-3 rounded-lg border ${contractStatus.cardBg} ${contractStatus.cardBorder} ${isSuperseded ? 'opacity-60 scale-[0.97] origin-left' : ''}`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${contractStatus.bg} ${contractStatus.text} flex-shrink-0`}>
                                          {contractStatus.label}
                                        </span>
                                        {isSuperseded && (
                                          <span className="text-xs text-gray-400 italic flex-shrink-0">(Superseded)</span>
                                        )}
                                        <span className="text-xs text-gray-400 flex-shrink-0">
                                          {formatDate(item.createdAt)}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenContractLink(item.contract!)}
                                        className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 transition-colors flex-shrink-0"
                                        title="Open link"
                                      >
                                        <FiExternalLink className="w-4 h-4 text-gray-700" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pending Contracts Section */}
        {pendingContracts.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Pending Contracts</h4>
            <p className="text-xs text-gray-500 mb-3">Vendors added but no negotiation started</p>
            <ul className="space-y-2">
              {pendingContracts.map((contract) => {
                const matchedVendor = data?.find(
                  (v) => v?.vendorId?.toString() === contract?.vendorId?.toString()
                );
                const vendorName = matchedVendor?.Vendor?.name || matchedVendor?.Vendor?.companyName || 'Unknown Vendor';
                const fullLink = `${import.meta.env.VITE_FRONTEND_URL}/vendor-contract/${contract?.uniqueToken}`;

                return (
                  <li
                    key={contract.id}
                    className="bg-amber-50 px-4 py-3 flex items-center justify-between gap-3 border border-amber-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-medium text-gray-900 text-sm truncate">{vendorName}</span>
                      <span
                        className="text-xs text-gray-500 truncate max-w-[140px] cursor-help"
                        title={fullLink}
                      >
                        ...{truncateToken(contract?.uniqueToken)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(contract)}
                        className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
                        title="Copy link"
                      >
                        <FiCopy className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenContractLink(contract)}
                        className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
                        title="Open link"
                      >
                        <FiExternalLink className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteContract(contract?.id)}
                        className="p-1.5 rounded border border-red-300 bg-white hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <RiDeleteBinLine className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-4 flex justify-start gap-3">
          <Button
            className="px-3 py-2 bg-[white] text-[black] border rounded !w-fit text-sm"
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
            className="px-3 py-2 bg-blue-500 text-white rounded !w-fit text-sm"
          >
            Next
          </Button>
        </div>
      </form>

      {isModalOpen && (
        <Modal
          wholeModalStyle="text-center"
          heading="Are you sure you want to proceed without adding any vendor?"
          body=""
          cancelText="No"
          actionText="Yes"
          isDeleteIcon={true}
          btnsStyle="justify-center"
          onAction={handleModalConfirm}
          onClose={handleModalClose}
          handleClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default VendorDetails;
