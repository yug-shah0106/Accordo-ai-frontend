import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import toast from "react-hot-toast";

const VendorCurrencyDetails = ({ currentStep, nextStep, companyId }) => {
  const [companyData, setCompanyData] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await authApi.get(`/company/get/${companyId}`);
        setCompanyData(response.data.data); 
      } catch (error) {
        console.error("Error fetching company details:", error);
      toast.error(error.message || "Something went wrong");

      }
    };

    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  if (!companyData) {

    return <div>Loading...</div>;
  }

  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">Review Details {companyId}</h3>
      <p className="font-normal text-[#46403E] py-2">
        Your details will be used for Review details
      </p>
      <div className="px-2">
       
        <div className="flex justify-between mt-4">
          <h3 className="text-lg font-medium ">Basic Information</h3>
        </div>

        <div className="grid grid-cols-3 text-sm gap-8">
          <div className="space-y-2">
            <p>Name</p>
            <p>{companyData.Vendor[0]?.name}</p>
          </div>
          <div className="space-y-2">
            <p>Email</p>
            <p>{companyData.Vendor[0]?.email}</p>
          </div>
          <div className="space-y-2">
            <p>Phone</p>
            <p>{companyData.Vendor[0]?.phone}</p>
          </div>
        </div>

     

        {/* General Information Section */}
        <div className="flex justify-between mt-4">
          <h3 className="text-lg font-medium ">General Information</h3>
        </div>
        <div className="grid grid-cols-3 text-sm gap-8">
          <div className="space-y-2">
            <p>Company Name</p>
            <p>{companyData.companyName}</p>
          </div>
          <div className="space-y-2">
            <p>Establishment Date</p>
            <p>{new Date(companyData.establishmentDate).toLocaleDateString()}</p>
          </div>
          {/* <div className="space-y-2">
            <p>Nature</p>
            <p>{companyData.nature}</p>
          </div> */}
          <div className="space-y-2">
            <p>Type</p>
            <p>{companyData.type}</p>
          </div>
        </div>

        {/* Vendor Details Section */}
        <div className="flex justify-between mt-4">
          <h3 className="text-lg font-medium ">Vendor Details</h3>
        </div>
        <div className="grid grid-cols-3 text-sm gap-8">
          <div className="space-y-2">
            <p>GST Number</p>
            <p>{companyData.gstNumber}</p>
          </div>
          <div className="space-y-2">
            <p>PAN Number</p>
            <p>{companyData.panNumber}</p>
          </div>
          <div className="space-y-2">
            <p>MSME Number</p>
            <p>{companyData.msmeNumber}</p>
          </div>

         
          <div className="space-y-2">
            <p>GST File</p>
            {companyData.gstFileUrl && (
              <img
                src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.gstFileUrl}`}
                alt="GST File"
                className="w-[70%] h-auto"
              />
            )}
          </div>

          
          <div className="space-y-2">
            <p>PAN File</p>
            {companyData.panFileUrl && (
              <img
                src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.panFileUrl}`}
                alt="PAN File"
                className="w-[70%] h-auto"
              />
            )}
          </div>

         
          <div className="space-y-2">
            <p>MSME File</p>
            {companyData.msmeFileUrl && (
              <img
                src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.msmeFileUrl}`}
                alt="MSME File"
                className="w-[70%] h-auto"
              />
            )}
          </div>

          {/* Display Certificate of Incorporation No */}
          <div className="space-y-2">
            <p>Certificate of Incorporation No</p>
            <p>{companyData.ciNumber}</p>
          </div>

          {/* Display Vendor Name */}
          <div className="space-y-2">
            <p>Vendor Name</p>
            <p>{companyData.Vendor[0]?.name}</p>
          </div>
        </div>


        {/* Point of Contact Details Section */}
        <div className="flex justify-between mt-4">
          <h3 className="text-lg font-medium ">Point of Contact Details</h3>
        </div>
        <div className="grid grid-cols-3 text-sm gap-8">
          <div className="space-y-2">
            <p>Person Name</p>
            <p>{companyData.pocName}</p>
          </div>
          <div className="space-y-2">
            <p>Designation</p>
            <p>{companyData.pocDesignation}</p>
          </div>
          <div className="space-y-2">
            <p>Email</p>
            <p>{companyData.pocEmail}</p>
          </div>
          <div className="space-y-2">
            <p>Phone No</p>
            <p>{companyData.pocPhone}</p>
          </div>
          <div className="space-y-2">
            <p>Website</p>
            <p>{companyData.pocWebsite}</p>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="flex justify-between mt-4">
          <h3 className="text-lg font-medium ">Bank Details</h3>
        </div>
        <div className="grid grid-cols-3 text-sm gap-8">
          <div className="space-y-2">
            <p>Bank Name</p>
            <p>{companyData.bankName}</p>
          </div>
          <div className="space-y-2">
            <p>Beneficiary Name</p>
            <p>{companyData.beneficiaryName}</p>
          </div>
          <div className="space-y-2">
            <p>Account Number</p>
            <p>{companyData.accountNumber}</p>
          </div>

          <div className="space-y-2">
            <p>Cancelled Cheque</p>
            {companyData.msmeFileUrl && (
              <img
                src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.cancelledChequeURL}`}
                alt="MSME File"
                className="w-[70%] h-auto"
              />
            )}
          </div>

          <div className="space-y-2">
            <p>IFSC Code</p>
            <p>{companyData.ifscCode}</p>
          </div>
          <div className="space-y-2">
            <p>Bank address</p>
            <p>{companyData.fullAddress}</p>
          </div>
        </div>

        {/* Currency Section */}
        <div className="flex justify-between mt-4">
          <h3 className="text-lg font-medium ">Currency Details</h3>
        </div>
        <div className="grid grid-cols-3 text-sm gap-8">
          <div className="space-y-2">
            <p>Type of Currency</p>
            <p>{companyData.typeOfCurrency}</p>
          </div>
        </div>
      </div>


      <div className="py-6">
        <Link 
          to="/vendor-management" 
          className="p-4 py-2 m-2 bg-blue-600 text-white rounded" >
          Okay
        </Link>
      </div>


    </div>
  );
};

export default VendorCurrencyDetails;

