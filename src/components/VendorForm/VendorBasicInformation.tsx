import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Button from "../Button";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Company {
  id?: string;
  Vendor?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }>;
}

interface VendorBasicInformationProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  projectId: any;
  companyId: string;
  company: Company | null;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
}

const VendorBasicInformation: React.FC<VendorBasicInformationProps> = ({
  currentStep,
  nextStep,
  prevStep,
  projectId,
  companyId,
  company
}) => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });
  const location = useLocation();
  const apicall = location.pathname.split("/")[2];
  

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
  };
  
  
  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      if (apicall !== "add-vendor") {
        // Try to get vendor ID from either direct Vendor association or VendorCompanies
        const vendorId = (company as any)?.Vendor?.[0]?.id || (company as any)?.VendorCompanies?.[0]?.Vendor?.id;
        if (vendorId) {
          await authApi.put(`/vendor/update/${vendorId}`, data);
        } else {
          throw new Error("Vendor ID not found");
        }
      } else {
        await authApi.post("/vendor/create", {
          ...data,
          companyId: companyId,
          userType: "vendor",
        });
      }
      nextStep();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (company) {
      // Try to get vendor from either direct Vendor association or VendorCompanies
      const vendor = (company as any)?.Vendor?.[0] || (company as any)?.VendorCompanies?.[0]?.Vendor;

      console.log('=== STEP 2 - BASIC INFORMATION ===');
      console.log('Company object:', company);
      console.log('Vendor from company.Vendor[0]:', (company as any)?.Vendor?.[0]);
      console.log('Vendor from VendorCompanies:', (company as any)?.VendorCompanies?.[0]?.Vendor);
      console.log('Selected vendor:', vendor);
      console.log('Resetting form with:', {
        name: vendor?.name || "",
        phone: vendor?.phone || "",
        email: vendor?.email || "",
      });

      reset({
        name: vendor?.name || "",
        phone: vendor?.phone || "",
        email: vendor?.email || "",
      });
    }
  }, [company, reset]);


  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <p className="font-normal text-[#46403E] py-2">
        Your details will be used for Basic information
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Name Input */}
          <InputField
            label="Name"
            name="name"
            placeholder="Enter Name"
            type="text"
            register={register}
            error={errors.name}
            validation={{ required: validationSchema.name.required }}
            wholeInputClassName="my-1"
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
          />

          {/* Email Input */}
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
          />
        </div>

        <div className="mt-4 flex justify-start gap-4 ">
          {/* Previous Button */}
          <Button
            className="px-4 py-2 !bg-[white] !text-[black] border rounded !w-fit"
            type="button"
            onClick={() => prevStep()}
            disabled={isSubmitting || currentStep === 1}
          >
            Previous
          </Button>

          {/* Next Button */}
          <Button
            type="submit"
            disabled={isSubmitting || currentStep === 7}
            className="px-4 py-2 bg-blue-500 text-white rounded !w-fit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorBasicInformation;
