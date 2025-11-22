import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Button from "../Button";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import { useEffect } from "react";
import toast from "react-hot-toast";

const VendorBasicInformation = ({
  currentStep,
  nextStep,
  prevStep,
  projectId,
  companyId,
  company
}) => {
  const navigate = useNavigate();
  console.log({projectId});
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });
  const location = useLocation()
  const apicall = location.pathname.split("/")[2]
  

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
  
  
  const onSubmit = async (data) => {
    try {
      
      if (apicall != "add-vendor") {
        const userdata = await authApi.put(
          `/vendor/update/${company?.Vendor[0]?.id}`,
            data
        );
        console.log("Update vendor API: ", {userdata});
      } else {
        const response = await authApi.post("/vendor/create", {
          ...data,
          companyId: companyId,
          userType: "vendor",
        });
        console.log("Response from API: ", response.data);
      }
      nextStep();
    } catch (error) {
      console.error("API call failed: ", error);
      toast.error(error.message || "Something went wrong");

    }
  };

    useEffect(() => {
      if(company){
        
      reset({
        name: company?.Vendor?.[0]?.name || "",
        phone: company?.Vendor?.[0]?.phone || "",
        email: company?.Vendor?.[0]?.email || "",
      });
    }

    }, [company]);


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
