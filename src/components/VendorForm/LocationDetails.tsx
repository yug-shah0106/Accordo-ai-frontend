import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Button from "../Button";
import { authApi } from "../../api";
import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  getCountries,
  getStatesForCountry,
  getCitiesForState,
} from "../../types/address";

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
  isCreateMode?: boolean;
  formData?: VendorFormData;
  updateFormData?: (data: Partial<VendorFormData>) => void;
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
    setValue,
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

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  const countryOptions = getCountries();
  const stateOptions = selectedCountry ? getStatesForCountry(selectedCountry) : [];
  const cityOptions = selectedCountry && selectedState
    ? getCitiesForState(selectedCountry, selectedState)
    : [];

  const validationSchema = {
    address: {
      required: "Address is required",
    },
    city: {
      required: "City is required",
    },
    state: {
      required: "State / Province is required",
    },
    zipCode: {
      required: "Postal code is required",
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

      if (onStepSubmit) {
        await onStepSubmit(stepData);
        return;
      }

      if (isCreateMode && updateFormData) {
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

        nextStep();
        return;
      }

      await authApi.put(`/company/update/${companyId}`, data);
      nextStep();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
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

    if (company) {
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
              {/* Country */}
              <SelectField
                label="Country"
                name="country"
                placeholder="Select country"
                register={register}
                value={selectedCountry}
                onChange={(e) => {
                  setValue("country", e.target.value);
                  setValue("state", "");
                  setValue("city", "");
                }}
                error={errors.country}
                validation={{ required: validationSchema.country.required }}
                options={countryOptions}
                wholeInputClassName="my-1"
                required
              />

              {/* State / Province */}
              <SelectField
                label="State / Province"
                name="state"
                placeholder="Select state"
                register={register}
                value={selectedState}
                onChange={(e) => {
                  setValue("state", e.target.value);
                  setValue("city", "");
                }}
                error={errors.state}
                validation={{ required: validationSchema.state.required }}
                options={stateOptions}
                wholeInputClassName="my-1"
                required
              />

              {/* City */}
              <SelectField
                label="City"
                name="city"
                placeholder="Select city"
                register={register}
                value={watch("city")}
                onChange={(e) => {
                  setValue("city", e.target.value);
                }}
                error={errors.city}
                validation={{ required: validationSchema.city.required }}
                options={cityOptions}
                wholeInputClassName="my-1"
                required
              />

              {/* Postal Code */}
              <InputField
                label="Postal Code"
                name="zipCode"
                placeholder="Enter postal code"
                type="text"
                register={register}
                error={errors.zipCode}
                validation={{
                  required: validationSchema.zipCode.required,
                }}
                wholeInputClassName="my-1"
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
