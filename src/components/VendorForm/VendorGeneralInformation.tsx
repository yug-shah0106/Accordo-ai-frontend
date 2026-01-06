import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Button from "../Button";
import DateField from "../DateField";
import { authApi } from "../../api";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Company {
  id?: string;
  companyName?: string;
  establishmentDate?: string;
  nature?: string;
  companyLogo?: string;
}

interface VendorGeneralInformationProps {
  currentStep: number;
  nextStep: () => void;
  prevStep?: () => void;
  company: Company | null;
}

interface FormData {
  companyName: string;
  establishmentDate: string;
  nature: string;
}

const VendorGeneralInformation: React.FC<VendorGeneralInformationProps> = ({
  currentStep,
  nextStep,
  prevStep,
  company,
}) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      companyName: "",
      establishmentDate: "",
      nature: "",
    },
  });

  const validationSchema = {
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
      const formData = new FormData();

      formData.append("companyName", data.companyName);
      formData.append("establishmentDate", data.establishmentDate);
      formData.append("nature", data.nature);
      if (selectedImage) {
        formData.append("companyLogo", selectedImage);
      }

      if (company?.id) {
        await authApi.put(
          `/company/update/${company.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        nextStep();
      } else {
        const response = await authApi.post<{ data: { id: string } }>(
          "/company/create",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        navigate(`/vendor-management/add-vendor/${response.data.data.id}`, {
          state: { currentStep: currentStep + 1 },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    reset({
      companyName: company?.companyName || "",
      establishmentDate: company?.establishmentDate?.split("T")?.[0] || "",
      nature: company?.nature || "",
    });
    if (company?.companyLogo) {
      setPreview(
        `${import.meta.env.VITE_ASSEST_URL}/uploads/${company.companyLogo}`
      );
    }
  }, [company, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (): void => {
    setPreview(null);
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="border-2 rounded pt-4 px-4 pb-0">
      <h3 className="text-lg font-semibold">General Information</h3>
      <p className="font-normal text-[#46403E] pt-2 pb-0">
        Your details will be used for general information
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Company Name */}
          <InputField
            label="Company Name"
            name="companyName"
            placeholder="Enter Company Name"
            type="text"
            register={register}
            error={errors.companyName}
            validation={{ required: validationSchema.companyName.required }}
            wholeInputClassName="my-1"
          />

          {/* Establishment Date */}
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
          />

          {/* Type of Business */}
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
          />
           <div className="">
        
                  
        
        
        
    
                
                </div>
        </div>
        

        <div className="mt-4 flex justify-start gap-4">
          {/* Previous Button */}
          <Button
            className="px-4 py-2 bg-[white] text-[black] border rounded !w-fit"
            onClick={() => prevStep()}
            type="button"
            disabled={isSubmitting || currentStep === 1}
          >
            Previous
          </Button>

          {/* Next Button */}
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

export default VendorGeneralInformation;
