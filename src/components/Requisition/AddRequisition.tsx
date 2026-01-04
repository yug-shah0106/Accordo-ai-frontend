import { useEffect, useState } from "react";
import { GoCircle } from "react-icons/go";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
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
  maximumDeliveryDate?: string;
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
  const [currentStep, setCurrentStep] = useState<number>(redirect === "3" ? 3 : 1);
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state: ProjectState };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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

  return (
    <div className="w-full min-h-full mx-auto bg-white py-16 px-8 xl:px-16  rounded-md">
      <div className="mb-4 flex border-b-2 pb-4 justify-between">
        <p className="text-xl  font-semibold text-gray-800 flex items-center gap-2">
          <IoArrowBackOutline
            onClick={() => {
              navigate(-1);
            }}
            className="cursor-pointer"
          />
          {id ? "Edit" : "Add"} Requisition
        </p>
        {/* <p>REQ002</p> */}
      </div>

      <div className="flex flex-wrap xl:flex-nowrap">
        <div className="xl:w-[20%] h-[20%] mt-4 rounded p-6 border-2 sm:w-full ">
          <h2 className="text-lg font-semibold border-b-2">Details</h2>
          <ul className="sm:flex xl:block sm:justify-between">
            <li
              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep > 1 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 1 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p className="xl:trancate">Basic Information</p>
            </li>
            <li
              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep > 2 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 2 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] font-normal w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p>Product Details</p>
            </li>
            <li
              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep >= 3 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 3 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p>Vendor Details</p>
            </li>
          </ul>
        </div>

        <div className="w-full py-4 xl:p-4">
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
  );
};

export default AddRequisition;
