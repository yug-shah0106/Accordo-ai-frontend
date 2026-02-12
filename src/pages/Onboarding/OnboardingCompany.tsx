import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { authApi } from "../../api";
import { useEffect, useState, useRef } from "react";
import SelectField from "../../components/SelectField";
import DateField from "../../components/DateField";
import toast from "react-hot-toast";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BsBuilding } from "react-icons/bs";
import Modal from "../../components/Modal";
import AddressSection from "../../components/settingForm/AddressSection";
import { AddressData } from "../../types/address";

interface OnboardingFormData {
  profileData?: any;
  companyData?: {
    companyName?: string;
    establishmentDate?: string;
    nature?: string;
    type?: string;
    numberOfEmployees?: string;
    annualTurnover?: string;
    industryType?: string;
    customIndustryType?: string;
    typeOfCurrency?: string;
  };
}

interface OnboardingCompanyProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  companyId?: string | null;
  userId?: string;
  formData?: OnboardingFormData;
  updateFormData?: (data: Partial<OnboardingFormData>) => void;
  clearSaved?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
  prefilledName?: string;
  prefilledEmail?: string;
}

const OnboardingCompany = ({
  currentStep: _currentStep,
  nextStep: _nextStep,
  prevStep,
  companyId,
  formData: _parentFormData,
  updateFormData,
  clearSaved: _clearSaved,
  onComplete,
  onSkip,
}: OnboardingCompanyProps) => {
  const id = companyId || localStorage.getItem("%companyId%");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "" as string | File,
    establishmentDate: "",
    nature: "",
    type: "",
    numberOfEmployees: "",
    annualTurnover: "",
    industryType: "",
    typeOfCurrency: "",
    customIndustryType: "",
  });
  const [imagePreviews, setImagePreviews] = useState<Record<string, string | null>>({
    companyLogo: null,
  });
  const [showDeleteLogoModal, setShowDeleteLogoModal] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [_selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [addresses, setAddresses] = useState<AddressData[]>([
    {
      label: "Head Office",
      address: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      isDefault: true,
    },
  ]);

  useEffect(() => {
    const getCompanyData = async () => {
      try {
        const response = await authApi(`company/get/${id}`);
        const companyData = response.data.data;

        const formattedEstablishmentDate = companyData.establishmentDate
          ? new Date(companyData.establishmentDate).toISOString().split("T")[0]
          : "";

        setFormData({
          companyName: companyData.companyName || "",
          companyLogo: companyData.companyLogo || "",
          establishmentDate: formattedEstablishmentDate,
          nature: companyData.nature || "",
          type: companyData.type || "",
          numberOfEmployees: companyData.numberOfEmployees || "",
          annualTurnover: companyData.annualTurnover || "",
          industryType: companyData.industryType || "",
          typeOfCurrency: companyData.typeOfCurrency || "",
          customIndustryType: companyData.customIndustryType || "",
        });

        setImagePreviews({
          companyLogo: companyData.companyLogo
            ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.companyLogo}`
            : null,
        });

        // Load addresses
        if (companyData.Addresses && Array.isArray(companyData.Addresses)) {
          setAddresses(
            companyData.Addresses.map((addr: any) => ({
              id: addr.id,
              label: addr.label || "Head Office",
              address: addr.address || "",
              city: addr.city || "",
              state: addr.state || "",
              country: addr.country || "India",
              postalCode: addr.postalCode || "",
              isDefault: addr.isDefault || false,
            }))
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (id) {
      getCompanyData();
    }
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields for onboarding
    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company name is required";
    }

    // Validate addresses
    const activeAddresses = addresses.filter((a) => !a._delete);
    if (activeAddresses.length === 0) {
      newErrors.addresses = "At least one address is required";
    } else {
      const invalidAddresses = activeAddresses.filter((addr) => !addr.address.trim());
      if (invalidAddresses.length > 0) {
        newErrors.addresses = "Street address is required for all addresses";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Ensure at least one primary address
    const activeAddresses = addresses.filter((a) => !a._delete);
    const hasPrimary = activeAddresses.some((addr) => addr.isDefault);
    if (!hasPrimary && activeAddresses.length > 0) {
      const updatedAddresses = addresses.map((addr, i) => {
        if (i === 0 && !addr._delete) {
          return { ...addr, isDefault: true };
        }
        return addr;
      });
      setAddresses(updatedAddresses);
    }

    setIsSubmitting(true);

    try {
      const dataToSend = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          dataToSend.append(key, value);
        } else if (value !== null && value !== undefined && value !== "") {
          dataToSend.append(key, value);
        }
      });

      dataToSend.append("companyId", id || "");
      dataToSend.append("userType", "vendor");

      // Include addresses
      if (addresses.length > 0) {
        const addressesToSend = addresses.map((addr) => ({
          id: addr.id,
          label: addr.label === "Custom" && addr.customLabel ? addr.customLabel : addr.label,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          country: addr.country,
          postalCode: addr.postalCode,
          isDefault: addr.isDefault,
          _delete: addr._delete,
        }));
        dataToSend.append("addresses", JSON.stringify(addressesToSend));
      }

      await authApi.put(`/company/update/${id}`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Call onComplete to mark onboarding as done
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("API call failed: ", error);
      toast.error("Failed to save company details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogoFile(file);
      setFormData({ ...formData, companyLogo: file as any });
      setImagePreviews((prev) => ({
        ...prev,
        companyLogo: URL.createObjectURL(file),
      }));
    }
  };

  const handleLogoChangeClick = () => {
    logoInputRef.current?.click();
  };

  const handleDeleteLogo = async () => {
    setIsDeletingLogo(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("removeCompanyLogo", "true");

      await authApi.put(`/company/update/${id}`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImagePreviews((prev) => ({ ...prev, companyLogo: null }));
      setFormData({ ...formData, companyLogo: "" });
      setSelectedLogoFile(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
      toast.success("Company logo removed");
    } catch (error) {
      console.error("Failed to remove company logo:", error);
      toast.error("Failed to remove company logo");
    } finally {
      setIsDeletingLogo(false);
      setShowDeleteLogoModal(false);
    }
  };

  // Sync form data with parent for auto-save
  useEffect(() => {
    if (updateFormData && formData.companyName) {
      updateFormData({
        companyData: {
          companyName: formData.companyName,
          establishmentDate: formData.establishmentDate,
          nature: formData.nature,
          type: formData.type,
          numberOfEmployees: formData.numberOfEmployees,
          annualTurnover: formData.annualTurnover,
          industryType: formData.industryType,
          customIndustryType: formData.customIndustryType,
          typeOfCurrency: formData.typeOfCurrency,
        },
      });
    }
  }, [
    formData.companyName,
    formData.establishmentDate,
    formData.nature,
    formData.type,
    formData.numberOfEmployees,
    formData.annualTurnover,
    formData.industryType,
    formData.customIndustryType,
    formData.typeOfCurrency,
    updateFormData,
  ]);

  return (
    <div className="p-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Company Details</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tell us about your business
        </p>
      </div>

      {/* Company Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <input
          ref={logoInputRef}
          type="file"
          name="companyLogo"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />

        <div className="mb-3">
          {imagePreviews.companyLogo ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
              <img
                src={imagePreviews.companyLogo}
                alt="Company Logo"
                className="w-full h-full object-contain bg-white"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center shadow-sm">
              <BsBuilding className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogoChangeClick}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <CiEdit className="w-4 h-4" />
            {imagePreviews.companyLogo ? "Change" : "Add Logo"}
          </button>
          {imagePreviews.companyLogo && (
            <button
              type="button"
              onClick={() => setShowDeleteLogoModal(true)}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <RiDeleteBin6Line className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit}>
        {/* General Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900">General Information</h3>
          <p className="text-sm text-gray-600 mt-1 mb-6">
            Basic company details
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Company Name"
              name="companyName"
              placeholder="Enter Company Name"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName ? { message: errors.companyName, type: 'manual' } : undefined}
              className="text-sm text-gray-900"
              required
            />

            <DateField
              label="Establishment Date"
              name="establishmentDate"
              value={formData.establishmentDate}
              onChange={handleChange}
              error={errors.establishmentDate ? { message: errors.establishmentDate, type: 'manual' } : undefined}
              className="text-sm text-gray-900"
            />

            <SelectField
              label="Nature of Business"
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              options={[
                { label: "Domestic", value: "Domestic" },
                { label: "International", value: "International" },
              ]}
              error={errors.nature ? { message: errors.nature, type: 'manual' } : undefined}
            />

            <InputField
              label="Type of Business"
              name="type"
              placeholder="Enter Type of Business"
              type="text"
              value={formData.type}
              onChange={handleChange}
              error={errors.type ? { message: errors.type, type: 'manual' } : undefined}
              className="text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Company Addresses Section */}
        <AddressSection
          addresses={addresses}
          onChange={setAddresses}
          errors={errors}
        />

        {/* Business Details Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
          <p className="text-sm text-gray-600 mt-1 mb-6">
            Employee count, turnover, and industry information
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Number of Employees"
              name="numberOfEmployees"
              value={formData.numberOfEmployees}
              onChange={handleChange}
              options={[
                { label: "0-10", value: "0-10" },
                { label: "10-100", value: "10-100" },
                { label: "100-1000", value: "100-1000" },
                { label: "1000+", value: "1000+" },
              ]}
              error={errors.numberOfEmployees ? { message: errors.numberOfEmployees, type: 'manual' } : undefined}
            />

            <InputField
              label="Annual Turnover"
              name="annualTurnover"
              placeholder="Enter Annual Turnover"
              type="text"
              value={formData.annualTurnover}
              onChange={handleChange}
              error={errors.annualTurnover ? { message: errors.annualTurnover, type: 'manual' } : undefined}
              className="text-sm text-gray-900"
            />

            <SelectField
              label="Industry Type"
              name="industryType"
              onChange={handleChange}
              value={formData.industryType}
              error={errors.industryType ? { message: errors.industryType, type: 'manual' } : undefined}
              options={[
                { label: "Construction", value: "Construction" },
                { label: "Healthcare", value: "Healthcare" },
                { label: "Transportation", value: "Transportation" },
                { label: "Information Technology", value: "Information Technology" },
                { label: "Oil and Gas", value: "Oil and Gas" },
                { label: "Defence", value: "Defence" },
                { label: "Renewable Energy", value: "Renewable Energy" },
                { label: "Telecommunication", value: "Telecommunication" },
                { label: "Agriculture", value: "Agriculture" },
                { label: "Other", value: "Other" },
              ]}
            />

            {formData.industryType === "Other" && (
              <InputField
                label="Specify Industry"
                name="customIndustryType"
                placeholder="Enter your industry type"
                type="text"
                value={formData.customIndustryType}
                onChange={handleChange}
                error={errors.customIndustryType ? { message: errors.customIndustryType, type: 'manual' } : undefined}
                className="text-sm text-gray-900"
              />
            )}

            <SelectField
              label="Type of Currency"
              name="typeOfCurrency"
              value={formData.typeOfCurrency}
              onChange={handleChange}
              options={[
                { label: "INR", value: "INR" },
                { label: "USD", value: "USD" },
                { label: "EUR", value: "EUR" },
              ]}
              error={errors.typeOfCurrency ? { message: errors.typeOfCurrency, type: 'manual' } : undefined}
            />
          </div>
        </div>

        {/* Info about optional fields */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can add compliance documents, bank details, and point of contact information later from the Settings page.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <Button
              type="button"
              className="!w-auto px-6 py-3 !bg-white border-2 border-gray-300 !text-gray-700 hover:!bg-gray-50 hover:border-gray-400 rounded-lg font-medium transition-all duration-200 min-w-[100px]"
              onClick={() => prevStep()}
              disabled={isSubmitting}
            >
              Previous
            </Button>
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip for now
            </button>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className={`!w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[160px]
              ${isSubmitting
                ? "!bg-gray-300 !text-gray-500 cursor-not-allowed"
                : "!bg-blue-600 !text-white hover:!bg-blue-700"
              }`}
          >
            Complete Setup
          </Button>
        </div>
      </form>

      {/* Delete Logo Confirmation Modal */}
      {showDeleteLogoModal && (
        <Modal
          heading="Delete Company Logo"
          body="Are you sure you want to delete the company logo?"
          onClose={() => setShowDeleteLogoModal(false)}
          onAction={handleDeleteLogo}
          actionText={isDeletingLogo ? "Deleting..." : "Delete"}
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default OnboardingCompany;
