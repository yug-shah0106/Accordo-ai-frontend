import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Button from "../Button";
import { authApi } from "../../api";  
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";

const VendorBankDetails = ({ currentStep, nextStep, prevStep, companyId, company }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      bankName: "",
      beneficiaryName: "",
      accountNumber: "",
      iBanNumber: "",
      swiftCode: "",
      bankAccountType: "",
      cancelledChequeURL: "",
      ifscCode: "",
      fullAddress: "",
    },
  });


  const onSubmit = async (data) => {
    try {
     
      const formData = new FormData();
      
      console.log({data});
      Object.keys(data).forEach(key => {
        if (data[key]) {
          formData.append(key, data[key]);
        }
      });

      // if (data.cancelledChequeURL && data.cancelledChequeURL[0]) {
      //   formData.append("cancelledChequeURL", data.cancelledChequeURL[0]);
      // }
      if (data.cancelledChequeURL && data.cancelledChequeURL[0]) {
        data.cancelledChequeURL = data.cancelledChequeURL[0];
    }
    
      console.log({data});
      
      
      const response = await authApi.put(`/company/update/${companyId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',  
        }
      });

      console.log("Response from API:", response);
      nextStep();  
     
    } catch (error) {
      console.error("Error during API request:", error);
      toast.error(error.message || "Something went wrong");

      // alert("An error occurred while updating. Please try again.");
    }
  };


    useEffect(() => {
      reset({
        bankName: company?.bankName || "",
        beneficiaryName: company?.beneficiaryName|| "",
        accountNumber: company?.accountNumber || "",
        iBanNumber: company?.iBanNumber || "",
        swiftCode: company?.swiftCode || "",
        bankAccountType: company?.bankAccountType || "",
        cancelledChequeURL: company?.cancelledChequeURL || "",
        ifscCode: company?.ifscCode || "",
        fullAddress: company?.fullAddress || "",
      });
    }, [company]);

  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">Bank Details </h3>
      <p className="font-normal text-[#46403E] py-2">
        Your details will be used for Bank details
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4 p-3">
          <InputField
            label="Bank Name"
            name="bankName"
            placeholder="Enter Bank Name"
            type="text"
            register={register}
            error={errors.bankName}
            wholeInputClassName={`my-1`}
          />
         
          <InputField
            label="Beneficiary Name"
            name="beneficiaryName"
            placeholder="Enter Beneficiary Name"
            type="text"
            register={register}
            error={errors.beneficiaryName}
            wholeInputClassName={`my-1`}
          />

          <InputField
            label="Account No"
            name="accountNumber"
            placeholder="Enter Account No"
            type="number"
            register={register}
            error={errors.accountNumber}
            wholeInputClassName={`my-1`}
          />

          <InputField
            label="IBAN"
            placeholder="Enter IBAN"
            name="iBanNumber"
            register={register}
            error={errors.iBanNumber}
            className="text-gray-700"
          />

          <InputField
            label="Swift/ BIC Code"
            name="swiftCode"
            placeholder="Enter Swift/ BIC Code"
            type="text"
            register={register}
            error={errors.swiftCode}
            wholeInputClassName={`my-1`}
          />

          <InputField
            label="Bank Account Type"
            name="bankAccountType"
            placeholder="Enter Bank Account Type"
            type="text"
            register={register}
            error={errors.bankAccountType}
            wholeInputClassName={`my-1`}
          />

         

          <div className="flex mt-4">
            <div className="">
              <label className="block text-gray-600 font-medium mb-2"> Upload cancelled cheque</label>
              <input
                  id="file-upload"
                  type="file"
                  name="cancelledChequeURL"
                  {...register("cancelledChequeURL")}
                  className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm
                    file:border-0  file:px-3 file:py-2.5"
                />
            </div>
            <div>
            <img src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${company.cancelledChequeURL}`} 
                alt=""
                className="w-[50%] h-auto" />
            </div>
          </div>

          <InputField
            label="IFSC Code"
            name="ifscCode"
            placeholder="Enter Code"
            type="text"
            register={register}
            error={errors.ifscCode}
            wholeInputClassName={`my-1`}
          />

          <InputField
            label="Bank Address"
            name="fullAddress"
            placeholder="Enter Bank Address"
            type="text"
            register={register}
            error={errors.fullAddress}
            wholeInputClassName={`my-1`}
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

export default VendorBankDetails;


