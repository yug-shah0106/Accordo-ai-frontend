import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Button from "../Button";
import DateField from "../DateField";
import { authApi } from "../../api";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Company {
  id?: string;
  companyName?: string;
  establishmentDate?: string;
  nature?: string;
  companyLogo?: string;
  Vendor?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }>;
  VendorCompanies?: Array<{
    Vendor: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  }>;
}

interface VendorFormData {
  name?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  establishmentDate?: string;
  nature?: string;
  [key: string]: any;
}

interface BasicAndCompanyInfoProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  projectId: any;
  companyId: string;
  company: Company | null;
  // New props for create mode
  isCreateMode?: boolean;
  formData?: VendorFormData;
  updateFormData?: (data: Partial<VendorFormData>) => void;
  // Step submission handler
  onStepSubmit?: (data: VendorFormData) => Promise<void>;
  isSubmitting?: boolean;
}

interface FormData {
  // Basic Information
  name: string;
  phone: string;
  email: string;
  // Company Information
  companyName: string;
  establishmentDate: string;
  nature: string;
}

const BasicAndCompanyInfo: React.FC<BasicAndCompanyInfoProps> = ({
  currentStep,
  nextStep,
  prevStep,
  projectId: _projectId,
  companyId: _companyId,
  company,
  isCreateMode = false,
  formData: parentFormData,
  updateFormData: _updateFormData,
  onStepSubmit,
  isSubmitting: parentIsSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      companyName: "",
      establishmentDate: "",
      nature: "",
    },
  });

  const validationSchema = {
    name: {
      required: "Name is required",
    },
    phone: {
      required: "Phone number is required",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Phone number must be 10 digits",
      },
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        message: "Please enter a valid email address",
      },
    },
    companyName: {
      required: "Company name is required",
    },
    establishmentDate: {
      required: "Establishment date is required",
    },
    nature: {
      required: "Type of business is required",
    },
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      const stepData = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        companyName: data.companyName,
        establishmentDate: data.establishmentDate,
        nature: data.nature,
      };

      // If we have a step submit handler (progressive save mode), use it
      if (onStepSubmit) {
        await onStepSubmit(stepData);
        return;
      }

      // EDIT MODE: Save data immediately via API calls (existing behavior)
      if (company?.id) {
        // Update vendor info
        const vendorId = (company as any)?.Vendor?.[0]?.id || (company as any)?.VendorCompanies?.[0]?.Vendor?.id;
        if (vendorId) {
          await authApi.put(`/vendor-management/update/${vendorId}`, {
            name: data.name,
            phone: data.phone,
            email: data.email,
          });
        }

        // Update company info
        const formDataObj = new FormData();
        formDataObj.append("companyName", data.companyName);
        formDataObj.append("establishmentDate", data.establishmentDate);
        formDataObj.append("nature", data.nature);

        await authApi.put(
          `/company/update/${company.id}`,
          formDataObj,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        nextStep();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // In create mode, populate from parent form data if available
    if (isCreateMode && parentFormData) {
      reset({
        name: parentFormData.name || "",
        phone: parentFormData.phone || "",
        email: parentFormData.email || "",
        companyName: parentFormData.companyName || "",
        establishmentDate: parentFormData.establishmentDate || "",
        nature: parentFormData.nature || "",
      });
      return;
    }

    // In edit mode, populate from company data
    if (company) {
      const vendor = (company as any)?.Vendor?.[0] || (company as any)?.VendorCompanies?.[0]?.Vendor;

      reset({
        name: vendor?.name || "",
        phone: vendor?.phone || "",
        email: vendor?.email || "",
        companyName: company?.companyName || "",
        establishmentDate: company?.establishmentDate?.split("T")?.[0] || "",
        nature: company?.nature || "",
      });
    }
  }, [company, reset, isCreateMode, parentFormData]);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information & Company Details</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter vendor contact details and company information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Contact Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Name"
              name="name"
              placeholder="Enter Name"
              type="text"
              register={register}
              error={errors.name}
              validation={{ required: validationSchema.name.required }}
              wholeInputClassName="my-1"
              required
            />

            <InputField
              label="Phone No"
              placeholder={"+91"}
              name="phone"
              type="number"
              register={register}
              error={errors.phone}
              validation={{
                required: validationSchema.phone.required,
                pattern: validationSchema.phone.pattern,
              }}
              className="text-gray-700"
              required
            />

            <InputField
              label="Email"
              name="email"
              placeholder="Enter Email"
              type="email"
              register={register}
              error={errors.email}
              validation={{
                required: validationSchema.email.required,
                pattern: validationSchema.email.pattern,
              }}
              wholeInputClassName="my-1"
              required
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Company Information Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Company Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Company Name"
              name="companyName"
              placeholder="Enter Company Name"
              type="text"
              register={register}
              error={errors.companyName}
              validation={{ required: validationSchema.companyName.required }}
              wholeInputClassName="my-1"
              required
            />

            <DateField
              label="Establishment Date"
              name="establishmentDate"
              register={register}
              value={watch("establishmentDate")}
              error={errors.establishmentDate}
              className="text-gray-700"
              validation={{
                required: validationSchema.establishmentDate.required,
              }}
              required
            />

            <SelectField
              label="Type/Nature of Business"
              name="nature"
              placeholder="Select Type/Nature of Business"
              register={register}
              value={watch("nature")}
              error={errors.nature}
              validation={{ required: validationSchema.nature.required }}
              options={[
                { value: "Domestic", label: "Domestic" },
                { value: "International", label: "International" }
              ]}
              optionValue="value"
              optionKey="label"
              required
            />
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

export default BasicAndCompanyInfo;
