import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Button from "../Button";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import { useEffect, useState } from "react";
import SelectField from "../SelectField";
import DateField from "../DateField";

const CompanyProfile = ({
  currentStep,
  nextStep,
  prevStep,
  companyId,
  company,
}) => {
  const id = localStorage.getItem("%companyId%");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo:"",
    establishmentDate: "",
    nature: "",
    type: "",
    numberOfEmployees: "",
    annualTurnover: "",
    industryType: " ",
    gstNumber: "",
    gstFile: null,
    panNumber: "",
    panFile: null,
    msmeNumber: "",
    msmeFile: null,
    ciNumber: "",
    ciFile: null,
    pocName: "",
    pocDesignation: "",
    pocEmail: "",
    pocPhone: "",
    pocWebsite: "",
    bankName: "",
    beneficiaryName: "",
    accountNumber: "",
    iBanNumber: "",
    swiftCode: "",
    bankAccountType: "",
    cancelledCheque: "",
    cancelledChequeURL: null,
    ifscCode: "",
    fullAddress: "",
  });
  const [imagePreviews, setImagePreviews] = useState({
    gstFile: null,
    panFile: null,
    msmeFile: null,
    ciFile: null,
    cancelledChequeURL: null,
    companyLogo:null
  });

  useEffect(() => {
    const getCompanyData = async () => {
      try {
        const response = await authApi(`company/get/${id}`);
        console.log(response.data.data);
  
        const companyData = response.data.data;
        console.log({companyData});
        
  
        const formattedEstablishmentDate = new Date(companyData.establishmentDate).toISOString().split("T")[0];
  
        setFormData({
          ...companyData,
          establishmentDate: formattedEstablishmentDate,
        });
  
        setImagePreviews({
          gstFile: companyData.gstFileUrl
            ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.gstFileUrl}`
            : null,
          panFile: companyData.panFileUrl
            ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.panFileUrl}`
            : null,
          msmeFile: companyData.msmeFileUrl
            ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.msmeFileUrl}`
            : null,
          ciFile: companyData.ciFileUrl
            ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.ciFileUrl}`
            : null,
          cancelledChequeURL: companyData.cancelledChequeURL
            ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.cancelledChequeURL}`
            : null,
            companyLogo: companyData.cancelledChequeURL
            ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.companyLogo}`
            : null,
        });
      } catch (error) {
        console.error(error);
      }
    };
  
    if (id) {
      getCompanyData();
    }
  }, [id]);
  ;

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    try {
      const dataToSend = new FormData();

      for (const key in formData) {
        if (formData[key] instanceof File) {
          dataToSend.append(key, formData[key]);
        } else {
          dataToSend.append(key, formData[key]);
        }
      }

      dataToSend.append("companyId", companyId);
      dataToSend.append("userType", "vendor");

      const response = await authApi.put(`/company/update/${id}`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response from API: ", response.data);
      nextStep();
    } catch (error) {
      console.error("API call failed: ", error);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      const previewURL = file ? URL.createObjectURL(file) : null;

      setFormData({
        ...formData,
        [name]: file,
      });

      setImagePreviews((prev) => ({
        ...prev,
        [name]: previewURL,
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="border-2 rounded pt-6 px-6 pb-0">
      <div className="my-4 mx-2">
        <h3 className="text-lg font-semibold ">General Information</h3>
        <p className="font-normal text-[#46403E] pt-2 pb-0">
          Your details will be used for general information
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField
            label="Company Name"
            name="companyName"
            placeholder="Enter Company Name"
            type="text"
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            wholeInputClassName="my-1"
          />

          <DateField
            label="Establishment Date"
            name="establishmentDate"
            value={formData.establishmentDate}
            error={errors.establishmentDate}
            className="text-gray-700"
          />

          
          <SelectField
              label="Nature of operation of business"
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              options={[
                { label: "Domestic", value: "Domestic" },
                { label: "Interational", value: "Interational" },
              ]}
              error={errors.nature}
            />
              <InputField
              label="Type /Nature of Business"
              name="type"
                placeholder="Enter Type /Nature of Business"
                type="text"
              value={formData.type}
              onChange={handleChange}
              error={errors.type}
                wholeInputClassName="my-1"
            />
             <div className="mt-8">
              <label htmlFor="" className="block text-gray-600 font-medium mb-2">Company Logo</label>
              <input
                id="file-upload-gst"
                type="file"
                name="companyLogo"
                className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
                onChange={handleChange}
              />
            </div>
            {imagePreviews.companyLogo && (
              <img
                src={imagePreviews.companyLogo}
                alt="GST Preview"
                className="w-[40%] h-auto"
              />
            )}
       
        </div>

        <div>
          <div className="my-4 mx-2">
            <h3 className="text-lg font-semibold">Buyer Details</h3>
            <p className="font-normal text-[#46403E] pt-2 pb-0">
              Your details will be used for Buyer Details
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
          <SelectField
              label="Number of employees"
              name="numberOfEmployees"
              value={formData.numberOfEmployees}
              onChange={handleChange}
              options={[
                { label: "0-10", value: "0-10" },
                { label: "10-100", value: "10-100" },
                { label: "100-1000", value: "100-1000" },
                { label: "1000+", value: "1000+" },
              ]}
              error={errors.type}
            />

            <InputField
              label="Annual Turnover"
              name="annualTurnover"
              placeholder="EnterAnnual Turnover"
              type="text"
              value={formData.annualTurnover}
              onChange={handleChange}
              error={errors.annualTurnover}
              wholeInputClassName="my-1"
            />

            <div>
              <SelectField
                label="Industry Type"
                name="industryType"
                onChange={handleChange}
                value={formData.industryType}
                error={errors.industryType}
                options={[
                  { label: "Industry1", value: "Industry1" },
                  { label: "Industry2", value: "Industry2" },
                 
                ]}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 justify-start">
            <InputField
              label="GST No"
              name="gstNumber"
              placeholder="Enter GST No"
              type="text"
              value={formData.gstNumber}
              onChange={handleChange}
              error={errors.gstNumber}
              wholeInputClassName="my-1"
            />
            <div className="mt-8">
              <input
                id="file-upload-gst"
                type="file"
                name="gstFile"
                className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
                onChange={handleChange}
              />
            </div>
            {imagePreviews.gstFile && (
              <img
                src={imagePreviews.gstFile}
                alt="GST Preview"
                className="w-[10%] h-auto"
              />
            )}
          </div>

          <div className="flex items-center gap-4 justify-start">
            <InputField
              label="PAN No"
              name="panNumber"
              placeholder="Enter PAN No"
              type="text"
              value={formData.panNumber}
              onChange={handleChange}
              error={errors.panNumber}
              wholeInputClassName={`my-1`}
            />
            <div className="mt-8">
              <input
                id="file-upload-pan"
                type="file"
                name="panFile"
                className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
                onChange={handleChange}
              />
            </div>
            {imagePreviews.panFile && (
              <img
                src={imagePreviews.panFile}
                alt="PAN Preview"
                className="w-[10%] h-auto"
              />
            )}
          </div>

          <div className="flex items-center gap-4 justify-start">
            <InputField
              label="MSME No"
              name="msmeNumber"
              placeholder="Enter MSME No"
              type="text"
              value={formData.msmeNumber}
              onChange={handleChange}
              error={errors.msmeNumber}
              wholeInputClassName={`my-1`}
            />
            <div className="mt-8">
              <input
                id="file-upload-msme"
                type="file"
                name="msmeFile"
                className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
                onChange={handleChange}
              />
            </div>
            {imagePreviews.msmeFile && (
              <img
                src={imagePreviews.msmeFile}
                alt="MSME Preview"
                className="w-[10%] h-auto"
              />
            )}
          </div>

          <div className="flex items-center gap-4 justify-start">
            <InputField
              label="Certificate of Incorporation"
              name="ciNumber"
              placeholder="Enter Certificate No"
              type="text"
              value={formData.ciNumber}
              onChange={handleChange}
              error={errors.ciNumber}
              wholeInputClassName={`my-1`}
            />
            <div className="mt-8">
              <input
                id="file-upload-ci"
                type="file"
                name="ciFile"
                className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
                onChange={handleChange}
              />
            </div>
            {imagePreviews.ciFile && (
              <img
                src={imagePreviews.ciFile}
                alt="CI Preview"
                className="w-[10%] h-auto"
              />
            )}
          </div>
        </div>
        <div>
          <div className="mt-10 mb-4 mx-2">
            <h3 className="text-lg font-semibold">Point of Contact details</h3>
            <p className="font-normal text-[#46403E] pt-2 pb-0">
              Your details will be used for Contact Details
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 ">
            <InputField
              label="Name"
              name="pocName"
              placeholder="Enter Name"
              type="text"
              value={formData.pocName}
              onChange={handleChange}
              // register={register}
              error={errors.pocName}
              // validation={{ required: validationSchema.name.required }}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Designation"
              name="pocDesignation"
              placeholder="Enter Designation"
              type="text"
              value={formData.pocDesignation}
              onChange={handleChange}
              // register={register}
              error={errors.pocDesignation}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Email"
              name="pocEmail"
              placeholder="Enter Email"
              type="email"
              value={formData.pocEmail}
              onChange={handleChange}
              // register={register}
              error={errors.pocEmail}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Phone No"
              placeholder={"+91"}
              name="pocPhone"
              type="number"
              value={formData.pocPhone}
              onChange={handleChange}
              // register={register}
              error={errors.pocPhone}
              className="text-gray-700"
            />
          </div>

          <InputField
            label="Website"
            name="pocWebsite"
            placeholder="Enter Website"
            type="text"
            value={formData.pocWebsite}
            onChange={handleChange}
            // register={register}
            error={errors.pocWebsite}
            wholeInputClassName="my-1"
          />
        </div>

        <div className="">
          <div className="mt-10 mx-4">
            <h3 className="text-lg font-semibold">Bank Details</h3>
            <p className="font-normal text-[#46403E] pt-2 pb-0">
              Your details will be used for Bank details
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 px-3 pb-0">
            <InputField
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter Bank Name"
              type="text"
              // register={register}
              error={errors.bankName}
              wholeInputClassName={`my-1`}
            />

            <InputField
              label="Beneficiary Name"
              name="beneficiaryName"
              value={formData.beneficiaryName}
              onChange={handleChange}
              placeholder="Enter Beneficiary Name"
              type="text"
              // register={register}
              error={errors.beneficiaryName}
              wholeInputClassName={`my-1`}
            />

            <InputField
              label="Account No"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter Account No"
              type="number"
              // register={register}
              error={errors.accountNumber}
              wholeInputClassName={`my-1`}
            />

            <InputField
              label="IBAN"
              placeholder="Enter IBAN"
              value={formData.iBanNumber}
              onChange={handleChange}
              name="iBanNumber"
              // register={register}
              error={errors.iBanNumber}
              className="text-gray-700"
            />

            <InputField
              label="Swift/ BIC Code"
              name="swiftCode"
              placeholder="Enter Swift/ BIC Code"
              value={formData.swiftCode}
              onChange={handleChange}
              type="text"
              // register={register}
              error={errors.swiftCode}
              wholeInputClassName={`my-1`}
            />

            <InputField
              label="Bank Account Type"
              name="bankAccountType"
              value={formData.bankAccountType}
              onChange={handleChange}
              placeholder="Enter Bank Account Type"
              type="text"
              // register={register}
              error={errors.bankAccountType}
              wholeInputClassName={`my-1`}
            />

            {/* <InputField
              label="Copy of cancelled cheque"
              name="cancelledCheque"
              value={formData.cancelledCheque}
              onChange={handleChange}
              placeholder="Enter Code"
              type="number"
              // register={register}
              error={errors.cancelledChequeURL}
              wholeInputClassName={`my-1`}
            /> */}
<div className="grid col-span-2 gap-3">

            <div className="flex gap-10 mt-12">
              <div className="">
                <label className="block text-gray-600 font-medium mb-2 ">Upload cancelled cheque</label>
                <input
                  id="file-upload"
                  type="file"
                  name="cancelledChequeURL"
                  onChange={handleChange}
                  className="block text-sm text-gray-700 border border-gray-300 rounded shadow-sm
                    file:border-0  file:px-3 file:py-2.5"
                />
              </div>
              {imagePreviews.cancelledChequeURL && (
              <img
                src={imagePreviews.cancelledChequeURL}
                alt="CI Preview"
                className="w-[20%] h-auto"
              />
            )}
            </div>
</div>


            <InputField
              label="IFSC Code"
              name="ifscCode"
              placeholder="Enter Code"
              type="text"
              value={formData.ifscCode}
              onChange={handleChange}
              // register={register}
              error={errors.ifscCode}
              wholeInputClassName={`my-1`}
            />

            <InputField
              label="Bank Address"
              name="fullAddress"
              placeholder="Enter Bank Address"
              type="text"
              // register={register}
              value={formData.fullAddress}
              onChange={handleChange}
              error={errors.fullAddress}
              wholeInputClassName={`my-1`}
            />
          </div>
        </div>
        <div>
          <div className="mt-10 mb-4 mx-2">
            <h3 className="text-lg font-semibold">
              Escalation matrix
            </h3>
            <p className="font-normal text-[#46403E] pt-2 pb-0">
              Your details will be used for Escalation matrix
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Name Input */}
            <InputField
              label="Name"
              name="escalationName"
              value={formData.escalationName}
              onChange={handleChange}
              placeholder="Enter Name"
              type="text"
              // register={register}
              error={errors.escalationName}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Phone No"
              placeholder={"+91"}
              value={formData.escalationPhone}
              onChange={handleChange}
              name="escalationPhone"
              type="number"
              error={errors.escalationPhone}
            
              className="text-gray-700"
            />
            <InputField
              label="Designation"
              value={formData.escalationDesignation}
              onChange={handleChange}
              name="escalationDesignation"
              placeholder="Enter Designation"
              type="text"
              error={errors.escalationDesignation}
             
              wholeInputClassName="my-1"
            />

            <InputField
              label="Email"
              name="escalationEmail"
              value={formData.escalationEmail}
              onChange={handleChange}
              placeholder="Enter Email"
              type="email"
              error={errors.escalationEmail}
            
              wholeInputClassName="my-1"
            />
          </div>
        </div>
        <div>
          <div className="mt-10 mb-4 mx-2">
            <h3 className="text-lg font-semibold">Currency Details</h3>
            <p className="font-normal text-[#46403E] pt-2 pb-0">
              Your details will be used for Escalation matrix
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4  mt-2">
            <SelectField
              label="Type of Currency"
              name="typeOfCurrency"
              // register={register}
              value={formData.typeOfCurrency}
              onChange={handleChange}
              options={[
                { label: "INR", value: "INR" },
                { label: "USD", value: "USD" },
                { label: "EURO", value: "EURO" },
              ]}
              error={errors.typeOfCurrency}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-start gap-4">
          <Button
            className="px-4 py-2 !bg-[white] !text-[black] border rounded !w-fit"
            type="button"
            onClick={() => prevStep()}
            // disabled={isSubmitting || currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="submit"
            // disabled={isSubmitting || currentStep === 7}
            className="px-4 py-2 bg-blue-500 text-white rounded !w-fit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
