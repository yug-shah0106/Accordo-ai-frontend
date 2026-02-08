import InputField from "../InputField";
import Button from "../Button";
import { authApi } from "../../api";
import { useEffect, useState, useRef } from "react";
import SelectField from "../SelectField";
import DateField from "../DateField";
import toast from "react-hot-toast";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BsBuilding } from "react-icons/bs";
import Modal from "../Modal";
import ComplianceDocumentField from "../ComplianceDocumentField";
import AddressSection from "./AddressSection";
import { AddressData } from "../../types/address";
import { FieldError } from "react-hook-form";

// Helper to convert string error to FieldError format
const toFieldError = (error: string | undefined): FieldError | undefined => {
  if (!error) return undefined;
  return { type: "manual", message: error };
};

interface SettingsFormData {
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
  };
}

interface CompanyProfileProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  companyId?: string | null;
  company?: any;
  formData?: SettingsFormData;
  updateFormData?: (data: Partial<SettingsFormData>) => void;
  clearSaved?: () => void;
}

const CompanyProfile = ({
  nextStep,
  prevStep,
  companyId,
  updateFormData,
}: CompanyProfileProps) => {
  const id = localStorage.getItem("%companyId%");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "",
    establishmentDate: "",
    nature: "",
    type: "",
    numberOfEmployees: "",
    annualTurnover: "",
    industryType: "",
    gstNumber: "",
    gstFile: null as File | null,
    panNumber: "",
    panFile: null as File | null,
    msmeNumber: "",
    msmeFile: null as File | null,
    ciNumber: "",
    ciFile: null as File | null,
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
    cancelledChequeURL: null as File | null,
    ifscCode: "",
    fullAddress: "",
    escalationName: "",
    escalationDesignation: "",
    escalationEmail: "",
    escalationPhone: "",
    typeOfCurrency: "",
    customIndustryType: "",
  });
  const [imagePreviews, setImagePreviews] = useState<Record<string, string | null>>({
    gstFile: null,
    panFile: null,
    msmeFile: null,
    ciFile: null,
    cancelledChequeURL: null,
    companyLogo: null,
  });
  const [showDeleteLogoModal, setShowDeleteLogoModal] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [addresses, setAddresses] = useState<AddressData[]>([]);

  useEffect(() => {
    const getCompanyData = async () => {
      try {
        const response = await authApi(`company/get/${id}`);
        const companyData = response.data.data;

        const formattedEstablishmentDate = companyData.establishmentDate
          ? new Date(companyData.establishmentDate).toISOString().split("T")[0]
          : "";

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
          companyLogo: companyData.companyLogo
            ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${companyData.companyLogo}`
            : null,
        });

        // Load addresses from API response
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate addresses
    const activeAddresses = addresses.filter((a) => !a._delete);
    if (activeAddresses.length === 0) {
      setErrors({ ...errors, addresses: "At least one address is required" });
      toast.error("Please add at least one company address");
      return;
    }

    // Validate required fields in addresses
    const invalidAddresses = activeAddresses.filter((addr) => !addr.address.trim());
    if (invalidAddresses.length > 0) {
      setErrors({ ...errors, addresses: "Street address is required for all addresses" });
      toast.error("Please fill in the street address for all addresses");
      return;
    }

    // Validate at least one primary address
    const hasPrimary = activeAddresses.some((addr) => addr.isDefault);
    if (!hasPrimary && activeAddresses.length > 0) {
      // Auto-set first address as primary
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

      for (const key in formData) {
        const value = (formData as any)[key];
        if (value instanceof File) {
          dataToSend.append(key, value);
        } else if (value !== null && value !== undefined) {
          dataToSend.append(key, value);
        }
      }

      dataToSend.append("companyId", companyId || "");
      dataToSend.append("userType", "vendor");

      // Include addresses as JSON string
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

      toast.success("Company details updated successfully");
      nextStep();
    } catch (error) {
      console.error("API call failed: ", error);
      toast.error("Failed to update company details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const files = (e.target as HTMLInputElement).files;

    if (type === "file" && files) {
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

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, companyLogo: file as any });
      setImagePreviews((prev) => ({
        ...prev,
        companyLogo: URL.createObjectURL(file),
      }));
    }
  };

  // Handle logo change button click
  const handleLogoChangeClick = () => {
    logoInputRef.current?.click();
  };

  // Handle logo delete
  const handleDeleteLogo = async () => {
    setIsDeletingLogo(true);
    try {
      // Call API to remove company logo
      const dataToSend = new FormData();
      dataToSend.append("removeCompanyLogo", "true");

      await authApi.put(`/company/update/${id}`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImagePreviews((prev) => ({ ...prev, companyLogo: null }));
      setFormData({ ...formData, companyLogo: "" });
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
    updateFormData,
  ]);

  return (
    <div className="p-6">
      {/* Centered Company Logo Section */}
      <div className="flex flex-col items-center mb-8">
        {/* Hidden file input */}
        <input
          ref={logoInputRef}
          type="file"
          name="companyLogo"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />

        {/* Company Logo Preview */}
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

        {/* Change / Delete Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogoChangeClick}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <CiEdit className="w-4 h-4" />
            Change
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
            Basic company details and registration information
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Company Name"
              name="companyName"
              placeholder="Enter Company Name"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              error={toFieldError(errors.companyName)}
              className="text-sm text-gray-900"
            />

            <DateField
              label="Establishment Date"
              name="establishmentDate"
              value={formData.establishmentDate}
              onChange={handleChange}
              error={toFieldError(errors.establishmentDate)}
              className="text-sm text-gray-900"
            />

            <SelectField
              label="Nature of Business"
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              options={[
                { label: "Domestic", value: "Domestic" },
                { label: "International", value: "Interational" },
              ]}
              error={toFieldError(errors.nature)}
            />

            <InputField
              label="Type of Business"
              name="type"
              placeholder="Enter Type of Business"
              type="text"
              value={formData.type}
              onChange={handleChange}
              error={toFieldError(errors.type)}
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
            Employee count, turnover, and compliance documents
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
              error={toFieldError(errors.numberOfEmployees)}
            />

            <InputField
              label="Annual Turnover"
              name="annualTurnover"
              placeholder="Enter Annual Turnover"
              type="text"
              value={formData.annualTurnover}
              onChange={handleChange}
              error={toFieldError(errors.annualTurnover)}
              className="text-sm text-gray-900"
            />

            <SelectField
              label="Industry Type"
              name="industryType"
              onChange={handleChange}
              value={formData.industryType}
              error={toFieldError(errors.industryType)}
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
                error={toFieldError(errors.customIndustryType)}
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
              error={toFieldError(errors.typeOfCurrency)}
            />
          </div>

          {/* Compliance Documents */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Compliance Documents</h4>
            <p className="text-xs text-gray-500">
              Enter the number manually or upload a document to auto-extract
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComplianceDocumentField
                label="GST Number"
                name="gstNumber"
                placeholder="Enter GST No or upload document"
                value={formData.gstNumber}
                onChange={(value) => setFormData({ ...formData, gstNumber: value })}
                onFileChange={(file) => {
                  if (file) {
                    setFormData({ ...formData, gstFile: file });
                  }
                }}
                documentType="GST"
                error={errors.gstNumber}
                existingFileName={imagePreviews.gstFile ? "GST Document" : null}
              />

              <ComplianceDocumentField
                label="PAN Number"
                name="panNumber"
                placeholder="Enter PAN No or upload document"
                value={formData.panNumber}
                onChange={(value) => setFormData({ ...formData, panNumber: value })}
                onFileChange={(file) => {
                  if (file) {
                    setFormData({ ...formData, panFile: file });
                  }
                }}
                documentType="PAN"
                error={errors.panNumber}
                existingFileName={imagePreviews.panFile ? "PAN Document" : null}
              />

              <ComplianceDocumentField
                label="MSME Number"
                name="msmeNumber"
                placeholder="Enter MSME/Udyam No or upload document"
                value={formData.msmeNumber}
                onChange={(value) => setFormData({ ...formData, msmeNumber: value })}
                onFileChange={(file) => {
                  if (file) {
                    setFormData({ ...formData, msmeFile: file });
                  }
                }}
                documentType="MSME"
                error={errors.msmeNumber}
                existingFileName={imagePreviews.msmeFile ? "MSME Document" : null}
              />

              <ComplianceDocumentField
                label="Certificate of Incorporation"
                name="ciNumber"
                placeholder="Enter CIN/LLPIN or upload document"
                value={formData.ciNumber}
                onChange={(value) => setFormData({ ...formData, ciNumber: value })}
                onFileChange={(file) => {
                  if (file) {
                    setFormData({ ...formData, ciFile: file });
                  }
                }}
                documentType="CI"
                error={errors.ciNumber}
                existingFileName={imagePreviews.ciFile ? "CI Document" : null}
              />
            </div>
          </div>
        </div>

        {/* Point of Contact Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Point of Contact</h3>
          <p className="text-sm text-gray-600 mt-1 mb-6">
            Primary contact person details
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Name"
              name="pocName"
              placeholder="Enter Name"
              type="text"
              value={formData.pocName}
              onChange={handleChange}
              error={toFieldError(errors.pocName)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Designation"
              name="pocDesignation"
              placeholder="Enter Designation"
              type="text"
              value={formData.pocDesignation}
              onChange={handleChange}
              error={toFieldError(errors.pocDesignation)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Email"
              name="pocEmail"
              placeholder="Enter Email"
              type="email"
              value={formData.pocEmail}
              onChange={handleChange}
              error={toFieldError(errors.pocEmail)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Phone Number"
              placeholder="Enter Phone Number"
              name="pocPhone"
              type="tel"
              value={formData.pocPhone}
              onChange={handleChange}
              error={toFieldError(errors.pocPhone)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Website"
              name="pocWebsite"
              placeholder="Enter Website URL"
              type="text"
              value={formData.pocWebsite}
              onChange={handleChange}
              error={toFieldError(errors.pocWebsite)}
              className="text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          <p className="text-sm text-gray-600 mt-1 mb-6">
            Banking and payment information
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter Bank Name"
              type="text"
              error={toFieldError(errors.bankName)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Beneficiary Name"
              name="beneficiaryName"
              value={formData.beneficiaryName}
              onChange={handleChange}
              placeholder="Enter Beneficiary Name"
              type="text"
              error={toFieldError(errors.beneficiaryName)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter Account No"
              type="text"
              error={toFieldError(errors.accountNumber)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="IBAN"
              placeholder="Enter IBAN"
              value={formData.iBanNumber}
              onChange={handleChange}
              name="iBanNumber"
              error={toFieldError(errors.iBanNumber)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Swift/BIC Code"
              name="swiftCode"
              placeholder="Enter Swift/BIC Code"
              value={formData.swiftCode}
              onChange={handleChange}
              type="text"
              error={toFieldError(errors.swiftCode)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Bank Account Type"
              name="bankAccountType"
              value={formData.bankAccountType}
              onChange={handleChange}
              placeholder="Enter Bank Account Type"
              type="text"
              error={toFieldError(errors.bankAccountType)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="IFSC Code"
              name="ifscCode"
              placeholder="Enter IFSC Code"
              type="text"
              value={formData.ifscCode}
              onChange={handleChange}
              error={toFieldError(errors.ifscCode)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Bank Address"
              name="fullAddress"
              placeholder="Enter Bank Address"
              type="text"
              value={formData.fullAddress}
              onChange={handleChange}
              error={toFieldError(errors.fullAddress)}
              className="text-sm text-gray-900"
            />

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancelled Cheque
              </label>
              <input
                type="file"
                name="cancelledChequeURL"
                accept="image/*,.pdf"
                onChange={handleChange}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium hover:file:bg-blue-100"
              />
              {imagePreviews.cancelledChequeURL && (
                <img
                  src={imagePreviews.cancelledChequeURL}
                  alt="Cancelled Cheque"
                  className="mt-2 w-48 h-auto border rounded"
                />
              )}
            </div>
          </div>
        </div>

        {/* Escalation Matrix Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Escalation Matrix</h3>
          <p className="text-sm text-gray-600 mt-1 mb-6">
            Secondary contact for escalations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Name"
              name="escalationName"
              value={formData.escalationName}
              onChange={handleChange}
              placeholder="Enter Name"
              type="text"
              error={toFieldError(errors.escalationName)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Phone Number"
              placeholder="Enter Phone Number"
              value={formData.escalationPhone}
              onChange={handleChange}
              name="escalationPhone"
              type="tel"
              error={toFieldError(errors.escalationPhone)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Designation"
              value={formData.escalationDesignation}
              onChange={handleChange}
              name="escalationDesignation"
              placeholder="Enter Designation"
              type="text"
              error={toFieldError(errors.escalationDesignation)}
              className="text-sm text-gray-900"
            />

            <InputField
              label="Email"
              name="escalationEmail"
              value={formData.escalationEmail}
              onChange={handleChange}
              placeholder="Enter Email"
              type="email"
              error={toFieldError(errors.escalationEmail)}
              className="text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            className="!w-auto px-6 py-3 !bg-white border-2 border-gray-300 !text-gray-700 hover:!bg-gray-50 hover:border-gray-400 rounded-lg font-medium transition-all duration-200 min-w-[100px]"
            onClick={() => prevStep()}
            disabled={isSubmitting}
          >
            Previous
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className={`!w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[100px]
              ${isSubmitting
                ? '!bg-gray-300 !text-gray-500 cursor-not-allowed'
                : '!bg-blue-600 !text-white hover:!bg-blue-700'
              }`}
          >
            Save & Continue
          </Button>
        </div>
      </form>

      {/* Delete Logo Confirmation Modal */}
      {showDeleteLogoModal && (
        <Modal
          heading="Delete Company Logo"
          body="Are you sure you want to delete the company logo? This action cannot be undone."
          onClose={() => setShowDeleteLogoModal(false)}
          onAction={handleDeleteLogo}
          actionText={isDeletingLogo ? "Deleting..." : "Delete"}
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default CompanyProfile;
