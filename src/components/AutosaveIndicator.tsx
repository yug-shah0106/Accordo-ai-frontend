import React from "react";
import { IoCloudDoneOutline, IoCloudUploadOutline } from "react-icons/io5";

interface AutosaveIndicatorProps {
  lastSaved: Date | null;
  isSaving: boolean;
  className?: string;
}

const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  lastSaved,
  isSaving,
  className = "",
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isSaving) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <IoCloudUploadOutline className="w-4 h-4 animate-pulse" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <IoCloudDoneOutline className="w-4 h-4 text-green-500" />
        <span>Draft saved at {formatTime(lastSaved)}</span>
      </div>
    );
  }

  return null;
};

export default AutosaveIndicator;
