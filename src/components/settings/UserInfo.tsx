import { useEffect, useState } from "react";
import { GoCircle } from "react-icons/go";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../api";
import VendorBasicInformation from "../VendorForm/VendorBasicInformation";
import VendorGeneralInformation from "../VendorForm/VendorGeneralInformation";
import VendorDetail from "../VendorForm/VendorDetail";
import VendorContactDetails from "../VendorForm/VendorContactDetails";
import VendorBankDetails from "../VendorForm/VendorBankDetails";
import VendorCurrencyDetails from "../VendorForm/VendorCurrencyDetails";
import VendorReview from "../VendorForm/VendorReview";
import UpdateProfile from "../settingForm/UpdateProfile";
import CompanyProfile from "../settingForm/CompanyProfile";
import { get } from "react-hook-form";
import ChangePassword from "../settingForm/ChangePassword";
import { SlSettings } from "react-icons/sl";


const UserInfo = () => {
  const [company, setCompany] = useState("");
  const [userId,setUserId]=useState("")
  const navigate = useNavigate();
  const  {id}  = useParams();
  const { state } = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const companyId=localStorage.getItem("%companyId%")
  const user=localStorage.getItem("user")


  useEffect(() => {
    setCurrentStep(state?.currentStep || 1);
  }, [state]);

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const fetchRequisitionData = async (companyId) => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/company/get/${companyId}`);
      console.log({data});
      
      setCompany(data);
    } catch (error) {
      console.error(error.message || "Something went wrong");
    }
  };

  const fetchUserData = async () => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/user/profile`);
      setUserId(data.id)
    } catch (error) {
      console.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequisitionData(id);
    }
    fetchUserData()
  }, [id, currentStep]);

  return (
    <div className="w-full min-h-full mx-auto bg-white py-16 px-8 xl:px-16  rounded-md">
      <div className="mb-4 flex border-b-2 pb-4 space-x-12">
        <p style={{cursor:"pointer",color:'blue'}} onClick={()=>{console.log("clicked")}} className="text-xl  font-semibold text-gray-800 flex items-center gap-2">
          {/* <IoArrowBackOutline
            onClick={() => {
              navigate(-1);
            }}
            className="cursor-pointer"
          /> */}
          {/* <SlSettings className="text-xl" /> */}
          {/* {id ? "Edit" : "Add"} */}
           Permissions 
        </p>
        <p style={{cursor:"pointer",color:'blue'}} onClick={()=>{console.log("clicked")}} className="text-xl  font-semibold text-gray-800 flex items-center gap-2">
          {/* <IoArrowBackOutline
            onClick={() => {
              navigate(-1);
            }}
            className="cursor-pointer"
          /> */}
          {/* <SlSettings className="text-xl" /> */}
          {/* {id ? "Edit" : "Add"} */}
           Roles 
        </p>
      </div>

      <div className="flex flex-wrap xl:flex-nowrap">
        <div className="xl:w-[20%] h-[20%] mt-4 rounded p-6 border-2 sm:w-full ">
          <h2 className="text-lg font-semibold border-b-2">Details </h2>
          <ul className="sm:flex xl:block sm:justify-between text-sm">
            {/* Basic Information */}
            <li
            onClick={() => setCurrentStep(1)}
              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep > 1 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 1 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p className="xl:truncate">Update Profile</p>
            </li>

            {/* General Information */}
            <li
                        onClick={() => setCurrentStep(2)}

              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep > 2 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 2 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] font-normal w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p> Update Entity</p>
            </li>

           
            <li
                        onClick={() => setCurrentStep(3)}

              className={`py-2 cursor-pointer flex items-center gap-2 ${
                currentStep >= 3 ? "font-bold" : "text-gray-500"
              }`}
            >
              {currentStep > 3 ? (
                <IoIosCheckmarkCircle className="text-[#009A4F] w-6 h-6 flex-shrink-0" />
              ) : (
                <GoCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p>Change Password</p>
            </li>

          
          </ul>
        </div>

        <div className="w-full py-4 xl:p-4">
          {currentStep === 1 && (
            <UpdateProfile
              currentStep={currentStep}
              nextStep={nextStep}
              company={company}
              userId={userId}
            />
          )}
          {currentStep === 2 && (
            <CompanyProfile
              currentStep={currentStep}
              nextStep={nextStep}
              prevStep={prevStep}
              projectId={state}
              companyId={companyId}
              company={company}
            />
          )}

          {currentStep === 3 && (
            <ChangePassword
              currentStep={currentStep}
              prevStep={prevStep}
              nextStep={nextStep}
              companyId={id ?? company.id}
              company={company}
              
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
