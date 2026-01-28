import React from 'react';

interface VendorDocumentUploadProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  projectId: any;
  companyId: string;
  company: any;
}

const VendorDocumentUpload: React.FC<VendorDocumentUploadProps> = ({
  currentStep,
  nextStep,
  prevStep,
  projectId,
  companyId,
  company,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Document Upload
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Upload required documents for vendor registration.
      </p>

      {/* Document upload will be implemented here */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          Document upload functionality coming soon...
        </p>
      </div>
    </div>
  );
};

export default VendorDocumentUpload;
