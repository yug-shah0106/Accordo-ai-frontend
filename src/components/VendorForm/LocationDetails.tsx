import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Button from "../Button";
import { authApi } from "../../api";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Company {
  id?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface AddressData {
  label: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

interface VendorFormData {
  addresses?: AddressData[];
  [key: string]: any;
}

interface LocationDetailsProps {
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
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({
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
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const validationSchema = {
    address: {
      required: "Address is required",
    },
    city: {
      required: "City is required",
    },
    state: {
      required: "State is required",
    },
    zipCode: {
      required: "Zip code is required",
      pattern: {
        value: /^[0-9]{5,6}$/,
        message: "Zip code must be 5-6 digits",
      },
    },
    country: {
      required: "Country is required",
    },
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      const stepData = {
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      };

      // If we have a step submit handler (progressive save mode), use it
      if (onStepSubmit) {
        await onStepSubmit(stepData);
        return;
      }

      // CREATE MODE (legacy): Accumulate data and move to next step
      if (isCreateMode && updateFormData) {
        // Convert to address array format expected by the unified endpoint
        const addressData: AddressData = {
          label: 'Primary Address',
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.zipCode,
          isDefault: true,
        };

        updateFormData({
          addresses: [addressData],
        });

        // Move to next step without making API calls
        nextStep();
        return;
      }

      // EDIT MODE: Save data immediately via API
      await authApi.put(`/company/update/${companyId}`, data);
      nextStep();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // In create mode, populate from parent form data if available
    if (isCreateMode && parentFormData?.addresses?.[0]) {
      const addr = parentFormData.addresses[0];
      reset({
        address: addr.address || "",
        city: addr.city || "",
        state: addr.state || "",
        zipCode: addr.postalCode || "",
        country: addr.country || "",
      });
      return;
    }

    // In edit mode, populate from company data
    if (company) {
      // Address data is in the Addresses array from the backend
      const companyAddr = (company as any)?.Addresses?.[0];
      if (companyAddr) {
        reset({
          address: companyAddr.address || "",
          city: companyAddr.city || "",
          state: companyAddr.state || "",
          zipCode: companyAddr.postalCode || "",
          country: companyAddr.country || "",
        });
      } else {
        // Fallback to legacy format (direct fields on company)
        reset({
          address: (company as any)?.address || "",
          city: (company as any)?.city || "",
          state: (company as any)?.state || "",
          zipCode: (company as any)?.zipCode || "",
          country: (company as any)?.country || "",
        });
      }
    }
  }, [company, reset, isCreateMode, parentFormData]);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter company address and location information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Location Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Company Address</h4>
          <div className="grid grid-cols-1 gap-4">
            {/* Address */}
            <InputField
              label="Address"
              name="address"
              placeholder="Enter Street Address"
              type="text"
              register={register}
              error={errors.address}
              validation={{ required: validationSchema.address.required }}
              wholeInputClassName="my-1"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <InputField
                label="City"
                name="city"
                placeholder="Enter City"
                type="text"
                register={register}
                error={errors.city}
                validation={{ required: validationSchema.city.required }}
                wholeInputClassName="my-1"
                required
              />

              {/* State */}
              <InputField
                label="State"
                name="state"
                placeholder="Enter State"
                type="text"
                register={register}
                error={errors.state}
                validation={{ required: validationSchema.state.required }}
                wholeInputClassName="my-1"
                required
              />

              {/* Zip Code */}
              <InputField
                label="Zip Code"
                name="zipCode"
                placeholder="Enter Zip Code"
                type="text"
                register={register}
                error={errors.zipCode}
                validation={{
                  required: validationSchema.zipCode.required,
                  pattern: validationSchema.zipCode.pattern,
                }}
                wholeInputClassName="my-1"
                required
              />

              {/* Country */}
              <SelectField
                label="Country"
                name="country"
                placeholder="Select Country"
                register={register}
                value={watch("country")}
                error={errors.country}
                validation={{ required: validationSchema.country.required }}
                options={[
                  { value: "India", label: "India" },
                  { value: "USA", label: "United States" },
                  { value: "UK", label: "United Kingdom" },
                  { value: "Canada", label: "Canada" },
                  { value: "Australia", label: "Australia" },
                  { value: "Other", label: "Other" },
                ]}
                optionValue="value"
                optionKey="label"
                required
              />
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

export default LocationDetails;
