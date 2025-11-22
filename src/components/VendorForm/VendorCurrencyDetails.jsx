import { useForm } from "react-hook-form";
import Button from "../Button";
import { authApi } from "../../api";  
import { useNavigate } from "react-router-dom";
import SelectField from "../SelectField";
import { useEffect } from "react";
import toast from "react-hot-toast";

const VendorCurrencyDetails = ({
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
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      typeOfCurrency: "",  
    },
  });


  const onSubmit = async (data) => {
    try {
   
      const response = await authApi.put(`/company/update/${companyId}`, data);

        console.log("Currency details updated successfully:", response.data);
        nextStep(); 
      
    } catch (error) {
      console.error("Error during API request:", error);
      toast.error(error.message || "Something went wrong");

      // alert("An error occurred while updating. Please try again.");
    }
  };

    useEffect(() => {
      reset({
        typeOfCurrency: company?.typeOfCurrency || "",
      });
    }, [company]);

  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">Currency Details</h3>
      <p className="font-normal text-[#46403E] py-2">
        Your details will be used for Currency details
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4 p-3">
          <SelectField
            label="Type of Currency"
            name="typeOfCurrency"
            register={register}
            options={[
              { label: "INR", value: "INR" },
              { label: "USD", value: "USD" },
              { label: "EURO", value: "EURO" },
            ]}
            validation={{ required: "Please select a currency type" }}
            error={errors.typeOfCurrency}
          />
        </div>

        <div className="mt-4 flex justify-start px-3 gap-4">
          <Button
            className="px-4 py-2 !bg-[white] !text-[black] border rounded !w-fit"
            type="button"
            disabled={isSubmitting || currentStep === 1}
            onClick={prevStep}
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

export default VendorCurrencyDetails;
