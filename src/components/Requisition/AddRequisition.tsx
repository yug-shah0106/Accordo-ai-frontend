import { useEffect, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { VerticalStepProgress, Step } from "../shared";
import BasicInformation from "./BasicInformation";
import ProductDetails from "./ProductDetails";
import VendorDetails from "./VendorDetails";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../api";

interface Requisition {
  id: string;
  benchmarkingDate?: string;
  subject?: string;
  category?: string;
  deliveryDate?: string;
  maxDeliveryDate?: string; // Backend uses maxDeliveryDate
  maximumDeliveryDate?: string; // Keep for backward compatibility
  negotiationClosureDate?: string;
  typeOfCurrency?: string;
  rfqId?: string;
  projectId?: string;
  totalPrice?: string;
  paymentTerms?: string;
  netPaymentDay?: string;
  prePaymentPercentage?: string;
  postPaymentPercentage?: string;
  discountTerms?: string;
  pricePriority?: number;
  deliveryPriority?: number;
  paymentTermsPriority?: number;
  productData?: any[];
  RequisitionProduct?: any[];
  RequisitionAttachment?: any[];
  Contract?: any[];
  status?: string;
}

interface ProjectState {
  id?: string;
  tenureInDays?: number;
}

const AddRequisition: React.FC = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const redirect = queryParams.get("redirect");
  const { id } = useParams<{ id: string }>();

  // Persist current step in localStorage to survive page refresh
  const getInitialStep = (): number => {
    if (redirect === "3") return 3;
    if (id) {
      const savedStep = localStorage.getItem(`requisition_step_${id}`);
      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (step >= 1 && step <= 3) return step;
      }
    }
    return 1;
  };

  const [currentStep, setCurrentStep] = useState<number>(getInitialStep());
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const navigate = useNavigate();
  const { state } = useLocation() as { state: ProjectState };

  // Save current step to localStorage whenever it changes (only for edit mode)
  useEffect(() => {
    if (id) {
      localStorage.setItem(`requisition_step_${id}`, String(currentStep));
    }
  }, [currentStep, id]);

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (stepId: number) => {
    // Allow navigation to completed steps (previous steps)
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const fetchRequisitionData = async (requisitionId: string): Promise<void> => {
    try {
      const {
        data: { data },
      } = await authApi.get<{ data: Requisition }>(`/requisition/get/${requisitionId}`);
      setRequisition(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      console.error(errorMessage);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequisitionData(id);
    }
  }, [id, currentStep]);

  // Define steps for VerticalStepProgress
  const steps: Step[] = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Project and requisition details'
    },
    {
      id: 2,
      title: 'Product Details',
      description: 'Products, pricing, and priorities'
    },
    {
      id: 3,
      title: 'Vendor Details',
      description: 'Vendor selection and negotiation'
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-6 px-8 xl:px-16 pb-4 flex-shrink-0">
        <p className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <IoArrowBackOutline
            onClick={() => {
              navigate(-1);
            }}
            className="cursor-pointer"
          />
          {id ? "Edit" : "Add"} Requisition
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-8 xl:px-16 pb-6">
        <div className="flex flex-wrap xl:flex-nowrap pt-4 gap-6">
          {/* Step Progress Sidebar */}
          <div className="xl:w-[20%] w-full">
            <div className="h-fit mt-4 rounded p-6 border-2 bg-white">
              <h2 className="text-lg font-semibold border-b-2 pb-2 mb-4">Details</h2>
              <VerticalStepProgress
                steps={steps}
                currentStep={currentStep}
                onStepClick={handleStepClick}
                allowNavigation={true}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 p-4">
            {currentStep === 1 && (
              <BasicInformation
                currentStep={currentStep}
                nextStep={nextStep}
                projectId={state}
                requisitionId={id ?? requisition?.id ?? ""}
                requisition={requisition}
                setRequisition={setRequisition}
              />
            )}
            {currentStep === 2 && (
              <ProductDetails
                currentStep={currentStep}
                prevStep={prevStep}
                nextStep={nextStep}
                requisitionId={id ?? requisition?.id ?? ""}
                requisition={requisition}
                setRequisition={setRequisition}
              />
            )}
            {currentStep === 3 && (
              <VendorDetails
                currentStep={currentStep}
                prevStep={prevStep}
                nextStep={nextStep}
                requisition={requisition}
                requisitionId={id ?? requisition?.id ?? ""}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRequisition;
