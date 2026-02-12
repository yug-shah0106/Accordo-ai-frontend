import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import { authApi } from '../api';

interface ComplianceDocumentFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onFileChange?: (file: File | null, fileName: string | null) => void;
  documentType: 'GST' | 'PAN' | 'MSME' | 'CI';
  error?: string;
  existingFileName?: string | null;
  className?: string;
}

const ComplianceDocumentField: React.FC<ComplianceDocumentFieldProps> = ({
  label,
  name,
  placeholder = 'Enter number or upload document',
  value,
  onChange,
  onFileChange,
  documentType,
  error,
  existingFileName,
  className = '',
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; file: File } | null>(null);
  const [hasFile, setHasFile] = useState(!!existingFileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setUploadedFile({ name: file.name, file });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await authApi.post('/document/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { data } = response.data;

      // Update the field value with extracted number
      if (data.extractedNumber) {
        onChange(data.extractedNumber);
      }

      // Notify parent about file change
      if (onFileChange) {
        onFileChange(file, data.fileName);
      }

      setHasFile(true);
    } catch (error) {
      console.error('Document extraction failed:', error);
      // Even if extraction fails, we keep the file
      if (onFileChange) {
        onFileChange(file, file.name);
      }
      setHasFile(true);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setHasFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileChange) {
      onFileChange(null, null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const displayFileName = uploadedFile?.name || existingFileName;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Input field with upload icon */}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isExtracting}
          className={`
            w-full px-4 py-2.5 pr-12
            border rounded-lg
            text-sm text-gray-900
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${hasFile ? 'border-green-500' : ''}
          `}
        />

        {/* Upload button inside field */}
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isExtracting}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            p-2 rounded-md transition-colors
            ${isExtracting
              ? 'cursor-not-allowed'
              : 'hover:bg-gray-100 cursor-pointer'
            }
            ${hasFile ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}
          `}
          title={hasFile ? 'Document uploaded' : 'Upload document'}
        >
          {isExtracting ? (
            <ImSpinner8 className="w-5 h-5 animate-spin text-blue-600" />
          ) : hasFile ? (
            <FiCheck className="w-5 h-5" />
          ) : (
            <FiUpload className="w-5 h-5" />
          )}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* File badge */}
      {hasFile && displayFileName && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
            <FiCheck className="w-3 h-3" />
            {displayFileName.length > 25
              ? `${displayFileName.substring(0, 25)}...`
              : displayFileName
            }
            <button
              type="button"
              onClick={handleRemoveFile}
              className="ml-1 p-0.5 hover:bg-green-100 rounded-full transition-colors"
              title="Remove file"
            >
              <FiX className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ComplianceDocumentField;
