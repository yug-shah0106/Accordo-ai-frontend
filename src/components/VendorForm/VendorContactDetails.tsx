import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Button from "../Button";
import { authApi } from "../../api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Company {
  id?: string;
  pocName?: string;
  pocDesignation?: string;
  pocEmail?: string;
  pocPhone?: string;
  pocWebsite?: string;
}

interface VendorContactDetailsProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  companyId: string;
  company: Company | null;
}

interface FormData {
  pocName: string;
  pocDesignation: string;
  pocEmail: string;
  pocPhone: string;
  pocWebsite: string;
}

const VendorContactDetails: React.FC<VendorContactDetailsProps> = ({
  currentStep,
  nextStep,
  prevStep,
  companyId,
  company
}) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      pocName: "",
      pocDesignation: "",
      pocEmail: "",
      pocPhone: "",
      pocWebsite: "",
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      await authApi.put(`/company/update/${companyId}`, data);
      nextStep();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    reset({
      pocName: company?.pocName || "",
      pocDesignation: company?.pocDesignation || "",
      pocEmail: company?.pocEmail || "",
      pocPhone: company?.pocPhone || "",
      pocWebsite: company?.pocWebsite || "",
    });
  }, [company, reset]);

  return (
    <div className="border-2 rounded pt-4 px-4 pb-0">
      <h3 className="text-lg font-semibold">Point of Contact Details</h3>
      <p className="font-normal text-[#46403E] pt-2 pb-0">
        Your details will be used for contact details
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-6 px-6 pb-0">
          <InputField
            label="Person Name"
            name="pocName"
            placeholder="Enter Name"
            type="text"
            register={register}
            error={errors.pocName}
            wholeInputClassName={`my-1`}
          />
         
          <InputField
            label="Designation"
            name="pocDesignation"
            placeholder="Enter Designation"
            type="text"
            register={register}
            error={errors.pocDesignation}
            wholeInputClassName={`my-1`}
          />

          <InputField
            label="Email Id"
            name="pocEmail"
            placeholder="Enter Email"
            type="email"
            register={register}
            error={errors.pocEmail}
            wholeInputClassName={`my-1`}
          />

          <InputField
            label="Phone No"
            placeholder={"+91"}
            name="pocPhone"
            register={register}
            error={errors.pocPhone}
            className="text-gray-700"
          />

          <InputField
            label="Website"
            name="pocWebsite"
            placeholder="Enter Link"
            type="text"
            register={register}
            error={errors.pocWebsite}
            wholeInputClassName={`my-1`}
          />
        </div>
       
        <div className="mt-4 px-6 flex justify-start gap-4">
          <Button
            className="px-4 py-2 !bg-[white] !text-[black] border rounded !w-fit"
            type="button"
            disabled={isSubmitting || currentStep === 1}
            onClick={() => {
              prevStep();
            }}
          >
            Previous
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || currentStep === 7}
            className="px-4 py-2 bg-blue-500 text-white rounded  !w-fit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorContactDetails;





