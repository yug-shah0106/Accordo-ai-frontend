import { useForm } from "react-hook-form";
import Button from "../Button";
import { authMultiFormApi } from "../../api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import InputField from "../InputField";
import toast from "react-hot-toast";

interface Company {
  id?: string;
  gstNumber?: string;
  panNumber?: string;
  msmeNumber?: string;
  ciNumber?: string;
  type?: string;
  gstFileUrl?: string;
  panFileUrl?: string;
  msmeFileUrl?: string;
  ciFileUrl?: string;
}

interface VendorDetailProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  companyId: string;
  company: Company | null;
}

interface FormData {
  gstNumber: string;
  panNumber: string;
  msmeNumber: string;
  ciNumber: string;
  type: string;
  gstFile: FileList | string;
  panFile: FileList | string;
  msmeFile: FileList | string;
  ciFile: FileList | string;
}

const VendorDetail: React.FC<VendorDetailProps> = ({
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
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      gstNumber: "",
      panNumber: "",
      msmeNumber: "",
      ciNumber: "",
      type: "",
      gstFile: "",
      panFile: "",
      msmeFile: "",
      ciFile: "",
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      const formData = new FormData();

      formData.append("gstNumber", data.gstNumber);
      formData.append("panNumber", data.panNumber);
      formData.append("msmeNumber", data.msmeNumber);
      formData.append("ciNumber", data.ciNumber);
      formData.append("type", data.type);

      if (data.gstFile instanceof FileList && data.gstFile[0]) {
        formData.append("gstFile", data.gstFile[0]);
      }
      if (data.panFile instanceof FileList && data.panFile[0]) {
        formData.append("panFile", data.panFile[0]);
      }
      if (data.msmeFile instanceof FileList && data.msmeFile[0]) {
        formData.append("msmeFile", data.msmeFile[0]);
      }
      if (data.ciFile instanceof FileList && data.ciFile[0]) {
        formData.append("ciFile", data.ciFile[0]);
      }

      await authMultiFormApi.put(
        `/company/update/${companyId}`,
        formData
      );

      nextStep();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    console.log('=== STEP 3 - VENDOR DETAILS ===');
    console.log('Company object:', company);
    console.log('GST Number:', company?.gstNumber);
    console.log('PAN Number:', company?.panNumber);
    console.log('Resetting form with:', {
      gstNumber: company?.gstNumber || "",
      panNumber: company?.panNumber || "",
      msmeNumber: company?.msmeNumber || "",
      ciNumber: company?.ciNumber || "",
      type: company?.type || "",
    });

    reset({
      gstNumber: company?.gstNumber || "",
      panNumber: company?.panNumber || "",
      msmeNumber: company?.msmeNumber || "",
      ciNumber: company?.ciNumber || "",
      type: company?.type || "",
      gstFile: company?.gstFileUrl || "",
      panFile: company?.panFileUrl || "",
      msmeFile: company?.msmeFileUrl || "",
      ciFile: company?.ciFileUrl || "",
    });
  }, [company, reset]);

  return (
    <div className="border-2 rounded pt-4 px-4 pb-0">
      <h3 className="text-lg font-semibold">Vendor Details</h3>
      <p className="font-normal text-[#46403E] pt-2 pb-0">
        Your details will be used for vendor registration.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* GST Number and File Upload */}
        <div className="flex items-center gap-4 ml-10 justify-start">
          <InputField
            label="GST No"
            name="gstNumber"
            placeholder="Enter GST No"
            type="text"
            register={register}
            error={errors.gstNumber}
            validation={{ required: "GST Number is required" }}
            wholeInputClassName={`my-1`}
          />
          <div className="mt-8">
            <input
              id="file-upload-gst"
              type="file"
              name="gstFile"
              {...register("gstFile")}
              className="block  text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
            />
          </div>
            {company?.gstFileUrl && (
              <img
                src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${company.gstFileUrl}`}
                alt="GST File"
                className="w-[10%] h-auto"
              />
            )}
        </div> 

        
        <div className="flex items-center gap-4 ml-10 justify-start">
          <InputField
            label="PAN No"
            name="panNumber"
            placeholder="Enter PAN No"
            type="text"
            register={register}
            error={errors.panNumber}
            validation={{ required: "PAN Number is required" }}
            wholeInputClassName={`my-1`}
          />
          <div className="mt-8">
            <input
              id="file-upload-pan"
              type="file"
              name="panFile"
              {...register("panFile")}
              className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
            />
          </div>
          {company?.panFileUrl && (
            <img
              src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${company.panFileUrl}`}
              alt="PAN File"
              className="w-[10%] h-auto"
            />
          )}
        </div>

    
        <div className="flex items-center gap-4 ml-10 justify-start">
          <InputField
            label="MSME No"
            name="msmeNumber"
            placeholder="Enter MSME No"
            type="text"
            register={register}
            error={errors.msmeNumber}
            validation={{ required: "MSME Number is required" }}
            wholeInputClassName={`my-1`}
          />
          <div className="mt-8">
            <input
              id="file-upload-msme"
              type="file"
              name="msmeFile"
              {...register("msmeFile")}
              className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
            />
          </div>
          {company?.msmeFileUrl && (
            <img
              src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${company.msmeFileUrl}`}
              alt="MSME File"
              className="w-[10%] h-auto"
            />
          )}
        </div>

        
        <div className="flex items-center gap-4 ml-10 justify-start">
          <InputField
            label="Certificate of Incorporation"
            name="ciNumber"
            placeholder="Enter Certificate No"
            type="text"
            register={register}
            error={errors.ciNumber}
            validation={{
              required: "Certificate of Incorporation is required",
            }}
            wholeInputClassName={`my-1`}
          />
          <div className="mt-8">
            <input
              id="file-upload-ci"
              type="file"
              name="ciFile"
              {...register("ciFile")}
              className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
            />
          </div>
          {company?.ciFileUrl && (
            <img
              src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${company.ciFileUrl}`}
              alt="CI File"
              className="w-[10%] h-auto"
            />
          )}
        </div>

        <div className="flex items-center gap-4 ml-10 justify-start">
          <InputField
            label="Type of Product/Services"
            name="type"
            placeholder="Enter Type of Product/Services"
            type="text"
            register={register}
            error={errors.type}
            validation={{
              required: "Please enter the type of product/service",
            }}
            wholeInputClassName="my-1"
          />
        </div>

        {/* Buttons */}
        <div className="mt-4 ml-10 flex justify-start gap-4">
          <Button
            className="px-4 pt-2 pb-0 bg-[white] text-[black] border rounded !w-fit"
            onClick={() => {
              prevStep();
            }}
            type="button"
            disabled={isSubmitting || currentStep === 1}
          >
            Previous
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || currentStep === 7}
            className="px-4 pt-2 pb-0 bg-blue-500 text-white rounded  !w-fit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorDetail;
