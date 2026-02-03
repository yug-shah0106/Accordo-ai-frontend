import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import toast from "react-hot-toast";
import { Check } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AddressData {
  label: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

interface AddressInfo {
  id?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

interface CompanyData {
  id: string;
  companyName?: string;
  establishmentDate?: string;
  nature?: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  typeOfCurrency?: string;
  gstNumber?: string;
  panNumber?: string;
  msmeNumber?: string;
  ciNumber?: string;
  gstFileUrl?: string;
  panFileUrl?: string;
  msmeFileUrl?: string;
  cancelledChequeURL?: string;
  pocName?: string;
  pocDesignation?: string;
  pocEmail?: string;
  pocPhone?: string;
  pocWebsite?: string;
  bankName?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  ifscCode?: string;
  fullAddress?: string;
  swiftCode?: string;
  iBanNumber?: string;
  Vendor?: Vendor[];
  // For step=5 review endpoint, User and Addresses arrays
  User?: Vendor[];
  Addresses?: AddressInfo[];
}

interface VendorFormData {
  // Step 1: Basic Information
  name?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  establishmentDate?: string;
  nature?: string;
  // Step 2: Location Details
  addresses?: AddressData[];
  // Step 3: Financial & Banking
  typeOfCurrency?: string;
  bankName?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  iBanNumber?: string;
  swiftCode?: string;
  bankAccountType?: string;
  ifscCode?: string;
  // Step 4: Contact
  pocName?: string;
  pocDesignation?: string;
  pocEmail?: string;
  pocPhone?: string;
  pocWebsite?: string;
  [key: string]: any;
}

interface VendorReviewProps {
  currentStep: number;
  nextStep?: () => void;
  prevStep?: () => void;
  companyId: string;
  company?: CompanyData | null;
  // New props for create mode
  isCreateMode?: boolean;
  formData?: VendorFormData;
  updateFormData?: (data: Partial<VendorFormData>) => void;
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
}

const VendorReview: React.FC<VendorReviewProps> = ({
  currentStep,
  nextStep,
  prevStep,
  companyId,
  company: propCompany,
  isCreateMode = false,
  formData,
  updateFormData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyDetails = async (): Promise<void> => {
      setIsLoading(true);
      try {
        // For progressive save mode (create), use the review endpoint
        // For edit mode, use the company get endpoint
        const endpoint = isCreateMode && companyId
          ? `/vendor-management/create-vendor/${companyId}?step=5`
          : `/company/get/${companyId}`;

        const response = await authApi.get<{ data: CompanyData }>(endpoint);
        setCompanyData(response.data.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch company data if we have a companyId
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId, isCreateMode]);

  // Handle final submission
  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
    } else {
      // Fallback for edit mode - just navigate back
      navigate('/vendor-management');
    }
  };

  // Show loading state only in edit mode while fetching
  if (!isCreateMode && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading vendor details...</span>
      </div>
    );
  }

  // For create mode, use formData; for edit mode, use companyData
  const displayData = isCreateMode ? formData : companyData;

  // Get address info - handles both legacy format and step=5 endpoint format
  const getAddressInfo = () => {
    // Check step=5 endpoint format (Addresses array from backend)
    if (companyData?.Addresses?.[0]) {
      const addr = companyData.Addresses[0];
      return {
        address: addr.address,
        city: addr.city,
        state: addr.state,
        zipCode: addr.postalCode,
        country: addr.country,
      };
    }

    // Check form data (from accumulated form state)
    if (formData?.addresses?.[0]) {
      const addr = formData.addresses[0];
      return {
        address: addr.address,
        city: addr.city,
        state: addr.state,
        zipCode: addr.postalCode,
        country: addr.country,
      };
    }

    // Fallback to legacy company data format
    return {
      address: companyData?.address,
      city: companyData?.city,
      state: companyData?.state,
      zipCode: companyData?.zipCode,
      country: companyData?.country,
    };
  };

  // Get vendor info - handles both legacy format and step=5 endpoint format
  const getVendorInfo = () => {
    // Check step=5 endpoint format (User array from backend)
    if (companyData?.User?.[0]) {
      const vendor = companyData.User[0];
      return {
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
      };
    }

    // Check legacy Vendor array
    if (companyData?.Vendor?.[0]) {
      const vendor = companyData.Vendor[0];
      return {
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
      };
    }

    // Fallback to form data
    return {
      name: formData?.name,
      email: formData?.email,
      phone: formData?.phone,
    };
  };

  const vendorInfo = getVendorInfo();
  const addressInfo = getAddressInfo();

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>
        <p className="text-sm text-gray-600 mt-1">
          {isCreateMode
            ? "Please review all information before creating the vendor"
            : "Please review all information before submitting"
          }
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Basic & Company Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Step 1: Basic & Company Information</h4>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Contact Details</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">{vendorInfo.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{vendorInfo.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{vendorInfo.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Company Details</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Company Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.companyName : companyData?.companyName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Establishment Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {(isCreateMode ? formData?.establishmentDate : companyData?.establishmentDate)
                      ? new Date(isCreateMode ? formData?.establishmentDate! : companyData?.establishmentDate!).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nature of Business</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.nature : (companyData?.nature || companyData?.type) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Location Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Step 2: Location Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="text-sm font-medium text-gray-900">{addressInfo.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">City</p>
              <p className="text-sm font-medium text-gray-900">{addressInfo.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">State</p>
              <p className="text-sm font-medium text-gray-900">{addressInfo.state || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Zip Code</p>
              <p className="text-sm font-medium text-gray-900">{addressInfo.zipCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Country</p>
              <p className="text-sm font-medium text-gray-900">{addressInfo.country || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Step 3: Financial & Banking */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Step 3: Financial & Banking</h4>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Currency</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Type of Currency</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.typeOfCurrency : companyData?.typeOfCurrency || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Banking Information</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Bank Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.bankName : companyData?.bankName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Beneficiary Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.beneficiaryName : companyData?.beneficiaryName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.accountNumber : companyData?.accountNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IFSC Code</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.ifscCode : companyData?.ifscCode || 'N/A'}
                  </p>
                </div>
                {(formData?.swiftCode || companyData?.swiftCode) && (
                  <div>
                    <p className="text-xs text-gray-500">Swift Code</p>
                    <p className="text-sm font-medium text-gray-900">{formData?.swiftCode || companyData?.swiftCode}</p>
                  </div>
                )}
                {(formData?.iBanNumber || companyData?.iBanNumber) && (
                  <div>
                    <p className="text-xs text-gray-500">IBAN</p>
                    <p className="text-sm font-medium text-gray-900">{formData?.iBanNumber || companyData?.iBanNumber}</p>
                  </div>
                )}
                {!isCreateMode && companyData?.fullAddress && (
                  <div>
                    <p className="text-xs text-gray-500">Bank Address</p>
                    <p className="text-sm font-medium text-gray-900">{companyData.fullAddress}</p>
                  </div>
                )}
                {!isCreateMode && companyData?.cancelledChequeURL && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cancelled Cheque</p>
                    <img
                      src={`${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.cancelledChequeURL}`}
                      alt="Cancelled Cheque"
                      className="w-32 h-auto border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Contact & Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Step 4: Contact & Documents</h4>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Point of Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Contact Person</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.pocName : companyData?.pocName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.pocDesignation : companyData?.pocDesignation || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.pocEmail : companyData?.pocEmail || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.pocPhone : companyData?.pocPhone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Website</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isCreateMode ? formData?.pocWebsite : companyData?.pocWebsite || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Documents</p>
              <div className="text-sm text-gray-600">
                <p>Supporting documents will be displayed here once uploaded.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-4 mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        {isCreateMode ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Vendor...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Vendor
              </>
            )}
          </button>
        ) : (
          <Link
            to="/vendor-management"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Complete
          </Link>
        )}
      </div>
    </div>
  );
};

export default VendorReview;
