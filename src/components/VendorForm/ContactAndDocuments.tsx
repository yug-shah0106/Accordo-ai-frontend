import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Button from "../Button";
import { authApi } from "../../api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Company {
  id?: string;
  pocName?: string;
  pocDesignation?: string;
  pocEmail?: string;
  pocPhone?: string;
  pocWebsite?: string;
}

interface VendorFormData {
  pocName?: string;
  pocDesignation?: string;
  pocEmail?: string;
  pocPhone?: string;
  pocWebsite?: string;
  [key: string]: any;
}

interface ContactAndDocumentsProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  companyId: string;
  company: Company | null;
  // New props for create mode
  isCreateMode?: boolean;
  formData?: VendorFormData;
  updateFormData?: (data: Partial<VendorFormData>) => void;
  // Step submission handler for progressive save
  onStepSubmit?: (data: VendorFormData) => Promise<void>;
  isSubmitting?: boolean;
  projectId?: any;
}

interface FormData {
  pocName: string;
  pocDesignation: string;
  pocEmail: string;
  pocPhone: string;
  pocWebsite: string;
}

const ContactAndDocuments: React.FC<ContactAndDocumentsProps> = ({
  currentStep,
  nextStep,
  prevStep,
  companyId,
  company,
  isCreateMode = false,
  formData: parentFormData,
  updateFormData,
  onStepSubmit,
  isSubmitting: parentIsSubmitting = false,
  projectId,
}) => {
  const [documents, setDocuments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      pocName: "",
      pocDesignation: "",
      pocEmail: "",
      pocPhone: "",
      pocWebsite: "",
    },
  });

  const validationSchema = {
    pocName: {
      required: false,
    },
    pocEmail: {
      pattern: {
        value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        message: "Please enter a valid email address",
      },
    },
    pocPhone: {
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Phone number must be 10 digits",
      },
    },
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      const stepData = {
        pocName: data.pocName,
        pocDesignation: data.pocDesignation,
        pocEmail: data.pocEmail,
        pocPhone: data.pocPhone,
        pocWebsite: data.pocWebsite,
      };

      // If we have a step submit handler (progressive save mode), use it
      if (onStepSubmit) {
        await onStepSubmit(stepData);
        return;
      }

      // CREATE MODE (legacy): Accumulate data and move to next step
      if (isCreateMode && updateFormData) {
        updateFormData(stepData);

        // Move to next step without making API calls
        nextStep();
        return;
      }

      // EDIT MODE: Save data immediately via API
      await authApi.put(`/company/update/${companyId}`, data);

      // TODO: Handle document upload in Task 6
      // For now, just proceed to next step
      nextStep();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // In create mode, populate from parent form data if available
    if (isCreateMode && parentFormData) {
      reset({
        pocName: parentFormData.pocName || "",
        pocDesignation: parentFormData.pocDesignation || "",
        pocEmail: parentFormData.pocEmail || "",
        pocPhone: parentFormData.pocPhone || "",
        pocWebsite: parentFormData.pocWebsite || "",
      });
      return;
    }

    // In edit mode, populate from company data
    if (company) {
      reset({
        pocName: company?.pocName || "",
        pocDesignation: company?.pocDesignation || "",
        pocEmail: company?.pocEmail || "",
        pocPhone: company?.pocPhone || "",
        pocWebsite: company?.pocWebsite || "",
      });
    }
  }, [company, reset, isCreateMode, parentFormData]);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      return `${file.name}: Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed.`;
    }

    if (file.size > maxSize) {
      return `${file.name}: File size exceeds 10MB limit.`;
    }

    return null;
  };

  // Handle file selection from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Add files with validation
  const addFiles = (files: File[]) => {
    setUploadError(null);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        // Check for duplicates
        const isDuplicate = documents.some(doc =>
          doc.name === file.name && doc.size === file.size
        );
        if (isDuplicate) {
          errors.push(`${file.name}: File already added.`);
        } else {
          validFiles.push(file);
        }
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join('\n'));
      toast.error(`${errors.length} file(s) could not be added`);
    }

    if (validFiles.length > 0) {
      setDocuments(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };

  // Remove document
  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
        </svg>
      );
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2h8l4 4v12H4V2zm2 2v12h8V6h-3V4H6z"/>
        </svg>
      );
    } else if (file.type.includes('image')) {
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1zm1 2v10h10V5H5z"/>
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Contact & Documents</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter point of contact details and upload supporting documents
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Point of Contact Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Point of Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Contact Person Name"
              name="pocName"
              placeholder="Enter Name"
              type="text"
              register={register}
              error={errors.pocName}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Designation"
              name="pocDesignation"
              placeholder="Enter Designation"
              type="text"
              register={register}
              error={errors.pocDesignation}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Email"
              name="pocEmail"
              placeholder="Enter Email"
              type="email"
              register={register}
              error={errors.pocEmail}
              validation={{
                pattern: validationSchema.pocEmail.pattern,
              }}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Phone Number"
              placeholder="+91"
              name="pocPhone"
              type="tel"
              register={register}
              error={errors.pocPhone}
              validation={{
                pattern: validationSchema.pocPhone.pattern,
              }}
              wholeInputClassName="my-1"
            />

            <InputField
              label="Website (Optional)"
              name="pocWebsite"
              placeholder="Enter Website URL"
              type="url"
              register={register}
              error={errors.pocWebsite}
              wholeInputClassName="my-1"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Document Upload Section - Enhanced with Drag-and-Drop */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Supporting Documents (Optional)</h4>
          <p className="text-sm text-gray-600 mb-4">
            Upload any supporting documents such as certificates, licenses, or registration proofs
          </p>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="document-upload"
            />

            <div className="pointer-events-none">
              <svg
                className={`mx-auto h-12 w-12 transition-colors ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className={`mt-2 text-sm font-medium ${isDragging ? 'text-blue-600' : 'text-gray-700'}`}>
                {isDragging ? 'Drop files here' : 'Drag and drop files here, or click to browse'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
              </p>
            </div>
          </div>

          {/* Upload Error Display */}
          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-700 whitespace-pre-line">{uploadError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="ml-3 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Document List */}
          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Uploaded Documents ({documents.length})
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDocuments([]);
                    toast.success('All files removed');
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {documents.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="ml-3 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="Remove file"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-start gap-4 mt-6">
          <Button
            className="px-4 py-2 !bg-[white] !text-[black] border rounded !w-fit"
            type="button"
            onClick={prevStep}
            disabled={isSubmitting || parentIsSubmitting || currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || parentIsSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded !w-fit"
          >
            {(isSubmitting || parentIsSubmitting) ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactAndDocuments;
