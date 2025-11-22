import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Button from "../Button";
import DateField from "../DateField";
import { authApi } from "../../api";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
import toast from "react-hot-toast";

const VendorGeneralInformation = ({
  currentStep,
  nextStep,
  prevStep,
  company,
}) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
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

  const onSubmit = async (data) => {
  try {
    const formData = new FormData();

    formData.append("companyName",data.companyName)
      formData.append("establishmentDate", data.establishmentDate);
      formData.append("nature", data.nature);
      if (selectedImage) {
        formData.append("companyLogo", selectedImage);
      }

    if (company) {
      const response = await authApi.put(
        `/company/update/${company.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Update API: ", response.data);
      nextStep();
    } else {
      const response = await authApi.post(
        "/company/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Response from API: ", response.data);
      console.log(response.data.data.id);

      navigate(`/vendor-management/add-vendor/${response.data.data.id}`, {
        state: { currentStep: currentStep + 1 },
      });
      //nextStep();
    }
  } catch (error) {
    console.error("API call failed: ", error);
    toast.error(error.message || "Something went wrong");

  }
};

  useEffect(() => {
    reset({
      companyName: company?.companyName || "",
      establishmentDate: company?.establishmentDate?.split("T")?.[0] || "",
      nature: company?.nature || "",
    });
    if (company.companyLogo) {
      setPreview(
        `${import.meta.env.VITE_ASSEST_URL}/uploads/${
          company.companyLogo
        }`
      );
    }
  }, [company]);
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleRemoveImage = () => {
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">General Information</h3>
      <p className="font-normal text-[#46403E] py-2">
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
