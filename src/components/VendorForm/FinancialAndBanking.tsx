import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Button from "../Button";
import { authApi } from "../../api";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Company {
  id?: string;
  typeOfCurrency?: string;
  bankName?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  iBanNumber?: string;
  swiftCode?: string;
  bankAccountType?: string;
  cancelledChequeURL?: string;
  ifscCode?: string;
  fullAddress?: string;
}

interface VendorFormData {
  typeOfCurrency?: string;
  bankName?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  iBanNumber?: string;
  swiftCode?: string;
  bankAccountType?: string;
  ifscCode?: string;
  [key: string]: any;
}

interface FinancialAndBankingProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  companyId: string;
  company: Company | null;
  // New props for create mode
  isCreateMode?: boolean;
  formData?: VendorFormData;
  updateFormData?: (data: Partial<VendorFormData>) => void;
  // Step submission handler for progressive save
  onStepSubmit?: (data: VendorFormData) => Promise<void>;
  isSubmitting?: boolean;
  projectId?: any;
}

interface FormData {
  typeOfCurrency: string;
  bankName: string;
  beneficiaryName: string;
  accountNumber: string;
  iBanNumber: string;
  swiftCode: string;
  bankAccountType: string;
  cancelledChequeURL: FileList | string;
  ifscCode: string;
  fullAddress: string;
}

const FinancialAndBanking: React.FC<FinancialAndBankingProps> = ({
  currentStep,
  nextStep,
  prevStep,
  companyId,
  company,
  isCreateMode = false,
  formData: parentFormData,
  updateFormData,
  onStepSubmit,
  isSubmitting: parentIsSubmitting = false,
  projectId: _projectId,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      typeOfCurrency: "",
      bankName: "",
      beneficiaryName: "",
      accountNumber: "",
      iBanNumber: "",
      swiftCode: "",
      bankAccountType: "",
      cancelledChequeURL: "",
      ifscCode: "",
      fullAddress: "",
    },
  });

  const validationSchema = {
    typeOfCurrency: {
      required: "Currency type is required",
    },
    bankName: {
      required: false,
    },
    beneficiaryName: {
      required: false,
    },
    accountNumber: {
      required: false,
    },
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      const stepData = {
        typeOfCurrency: data.typeOfCurrency,
        bankName: data.bankName,
        beneficiaryName: data.beneficiaryName,
        accountNumber: data.accountNumber,
        iBanNumber: data.iBanNumber,
        swiftCode: data.swiftCode,
        bankAccountType: data.bankAccountType,
        ifscCode: data.ifscCode,
        fullAddress: data.fullAddress,
      };

      // If we have a step submit handler (progressive save mode), use it
      if (onStepSubmit) {
        await onStepSubmit(stepData);
        return;
      }

      // CREATE MODE (legacy): Accumulate data and move to next step
      if (isCreateMode && updateFormData) {
        updateFormData(stepData);

        // Move to next step without making API calls
        nextStep();
        return;
      }

      // EDIT MODE: Save data immediately via API
      const formDataObj = new FormData();

      // Add all text fields
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof FormData];
        if (value && key !== "cancelledChequeURL") {
          formDataObj.append(key, value as string);
        }
      });

      // Add file if present
      if (data.cancelledChequeURL instanceof FileList && data.cancelledChequeURL[0]) {
        formDataObj.append("cancelledChequeURL", data.cancelledChequeURL[0]);
      }

      await authApi.put(`/company/update/${companyId}`, formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      nextStep();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // In create mode, populate from parent form data if available
    if (isCreateMode && parentFormData) {
      reset({
        typeOfCurrency: parentFormData.typeOfCurrency || "",
        bankName: parentFormData.bankName || "",
        beneficiaryName: parentFormData.beneficiaryName || "",
        accountNumber: parentFormData.accountNumber || "",
        iBanNumber: parentFormData.iBanNumber || "",
        swiftCode: parentFormData.swiftCode || "",
        bankAccountType: parentFormData.bankAccountType || "",
        cancelledChequeURL: "",
        ifscCode: parentFormData.ifscCode || "",
        fullAddress: "",
      });
      return;
    }

    // In edit mode, populate from company data
    if (company) {
      reset({
        typeOfCurrency: company?.typeOfCurrency || "",
        bankName: company?.bankName || "",
        beneficiaryName: company?.beneficiaryName || "",
        accountNumber: company?.accountNumber || "",
        iBanNumber: company?.iBanNumber || "",
        swiftCode: company?.swiftCode || "",
        bankAccountType: company?.bankAccountType || "",
        cancelledChequeURL: company?.cancelledChequeURL || "",
        ifscCode: company?.ifscCode || "",
        fullAddress: company?.fullAddress || "",
      });
    }
  }, [company, reset, isCreateMode, parentFormData]);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Financial & Banking Details</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter currency preference and banking information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Currency Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Currency Preference</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Type of Currency"
              name="typeOfCurrency"
              placeholder="Select Currency"
              register={register}
              value={watch("typeOfCurrency")}
              error={errors.typeOfCurrency}
              validation={{ required: validationSchema.typeOfCurrency.required }}
              options={[
                { label: "INR", value: "INR" },
                { label: "USD", value: "USD" },
                { label: "EUR", value: "EUR" },
                { label: "GBP", value: "GBP" },
                { label: "AUD", value: "AUD" },
              ]}
              optionValue="value"
              optionKey="label"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Banking Information Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Banking Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Bank Name"
              name="bankName"
              placeholder="Enter Bank Name"
              type="text"
              register={register}
              error={errors.bankName}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Beneficiary Name"
              name="beneficiaryName"
              placeholder="Enter Beneficiary Name"
              type="text"
              register={register}
              error={errors.beneficiaryName}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Account Number"
              name="accountNumber"
              placeholder="Enter Account Number"
              type="text"
              register={register}
              error={errors.accountNumber}
              wholeInputClassName="my-1"
            />

            <InputField
              label="IBAN"
              placeholder="Enter IBAN"
              name="iBanNumber"
              type="text"
              register={register}
              error={errors.iBanNumber}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Swift/BIC Code"
              name="swiftCode"
              placeholder="Enter Swift/BIC Code"
              type="text"
              register={register}
              error={errors.swiftCode}
              wholeInputClassName="my-1"
            />

            <InputField
              label="IFSC Code"
              name="ifscCode"
              placeholder="Enter IFSC Code"
              type="text"
              register={register}
              error={errors.ifscCode}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Bank Account Type"
              name="bankAccountType"
              placeholder="Enter Account Type"
              type="text"
              register={register}
              error={errors.bankAccountType}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Bank Address"
              name="fullAddress"
              placeholder="Enter Bank Address"
              type="text"
              register={register}
              error={errors.fullAddress}
              wholeInputClassName="my-1"
            />
          </div>

          {/* Cancelled Cheque Upload */}
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Upload Cancelled Cheque (Optional)
            </label>
            <div className="flex items-start gap-4">
              <input
                id="file-upload"
                type="file"
                accept="image/*,.pdf"
                {...register("cancelledChequeURL")}
                className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {company?.cancelledChequeURL && (
                <img
                  src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${company.cancelledChequeURL}`}
                  alt="Cancelled Cheque"
                  className="w-32 h-auto border border-gray-300 rounded"
                />
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-start gap-4 mt-6">
          <Button
            className="px-4 py-2 !bg-[white] !text-[black] border rounded !w-fit"
            type="button"
            onClick={prevStep}
            disabled={isSubmitting || parentIsSubmitting || currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || parentIsSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded !w-fit"
          >
            {(isSubmitting || parentIsSubmitting) ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FinancialAndBanking;
