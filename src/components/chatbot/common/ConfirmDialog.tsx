import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-blue-500 hover:bg-blue-600 text-white",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 dark:bg-opacity-70"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      >
        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 pt-2 pb-0 border border-gray-300 dark:border-dark-border rounded-md text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 pt-2 pb-0 rounded-md transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
