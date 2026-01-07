import { useEffect, useState } from "react";
import { GoCircle } from "react-icons/go";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../api";
import VendorBasicInformation from "../VendorForm/VendorBasicInformation";
import VendorGeneralInformation from "../VendorForm/VendorGeneralInformation";
import VendorDetail from "../VendorForm/VendorDetail";
import VendorContactDetails from "../VendorForm/VendorContactDetails";
import VendorBankDetails from "../VendorForm/VendorBankDetails";
import VendorCurrencyDetails from "../VendorForm/VendorCurrencyDetails";
import VendorReview from "../VendorForm/VendorReview";
import toast from "react-hot-toast";

interface Company {
  id: string;
  companyName?: string;
  establishmentDate?: string;
  nature?: string;
  companyLogo?: string;
  typeOfCurrency?: string;
  pocName?: string;
  pocDesignation?: string;
  pocEmail?: string;
  pocPhone?: string;
  pocWebsite?: string;
  bankName?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  iBanNumber?: string;
  swiftCode?: string;
  bankAccountType?: string;
  cancelledChequeURL?: string;
  ifscCode?: string;
  fullAddress?: string;
  gstNumber?: string;
  panNumber?: string;
  msmeNumber?: string;
  ciNumber?: string;
  type?: string;
  gstFileUrl?: string;
  panFileUrl?: string;
  msmeFileUrl?: string;
  ciFileUrl?: string;
  Vendor?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }>;
}

interface LocationState {
  currentStep?: number;
}

const AddVendor: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { state } = useLocation() as { state: LocationState };
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    setCurrentStep(state?.currentStep || 1);
  }, [state]);

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const fetchRequisitionData = async (companyId: string): Promise<void> => {
    try {
      const {
        data: { data },
      } = await authApi.get<{ data: Company }>(`/company/get/${companyId}`);

      setCompany(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequisitionData(id);
    }
  }, [id, currentStep]);

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
          {/* {id ? "Edit" : "Add"} */}
           Vendor
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-8 xl:px-16 pb-6">
        <div className="flex flex-wrap xl:flex-nowrap pt-4">
        <div className="xl:w-[20%] h-[20%] mt-4 rounded p-6 border-2 sm:w-full ">
          <h2 className="text-lg font-semibold border-b-2">Details </h2>
          <ul className="sm:flex xl:block xl:whitespace-normal scroll_hide whitespace-nowrap overflow-x-auto gap-3 sm:justify-between text-sm">
            {/* Basic Information */}
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
              <p className="xl:truncate">General Information</p>
            </li>

            {/* General Information */}
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
              <p> Basic Information</p>
            </li>

            {/* Vendor Details */}
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

            {/* Point of Contact Details */}
            <li
              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep >= 4 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 4 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p>Point of Contact Details</p>
            </li>

            {/* Bank Details */}
            <li
              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep >= 5 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 5 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p>Bank Details</p>
            </li>

            {/* Currency Details */}
            <li
              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep >= 6 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 6 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p>Currency Details</p>
            </li>

            {/* Review */}
            <li
              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep >= 7 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 7 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p>Review</p>
            </li>
          </ul>
        </div>

        <div className="w-full p-4">
          {currentStep === 1 && (
            <VendorGeneralInformation
              currentStep={currentStep}
              nextStep={nextStep}
              company={company}
            />
          )}
          {currentStep === 2 && (
            <VendorBasicInformation
              currentStep={currentStep}
              nextStep={nextStep}
              prevStep={prevStep}
              projectId={state}
              companyId={id ?? company?.id ?? ""}
              company={company}
            />
          )}

          {currentStep === 3 && (
            <VendorDetail
              currentStep={currentStep}
              prevStep={prevStep}
              nextStep={nextStep}
              companyId={id ?? company?.id ?? ""}
              company={company}
            />
          )}

          {currentStep === 4 && (
            <VendorContactDetails
              currentStep={currentStep}
              prevStep={prevStep}
              nextStep={nextStep}
              companyId={id ?? company?.id ?? ""}
              company={company}
            />
          )}

          {currentStep === 5 && (
            <VendorBankDetails
              currentStep={currentStep}
              prevStep={prevStep}
              nextStep={nextStep}
              companyId={id ?? company?.id ?? ""}
              company={company}
            />
          )}

          {currentStep === 6 && (
            <VendorCurrencyDetails
              currentStep={currentStep}
              prevStep={prevStep}
              nextStep={nextStep}
              companyId={id ?? company?.id ?? ""}
              company={company}
            />
          )}

          {currentStep === 7 && (
            <VendorReview
              currentStep={currentStep}
              prevStep={prevStep}
              nextStep={nextStep}
              companyId={id ?? company?.id ?? ""}
              company={company}
            />
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default AddVendor;
