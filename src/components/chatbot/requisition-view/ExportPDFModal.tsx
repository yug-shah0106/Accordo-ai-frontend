/**
 * ExportPDFModal Component
 *
 * Modal for exporting deal summary as PDF with options:
 * - Direct download
 * - Email to recipient
 *
 * Shows progress indicator during generation.
 *
 * Created: January 2026
 */

import { useState } from "react";
import { FiX, FiDownload, FiMail, FiLoader, FiCheck, FiAlertCircle } from "react-icons/fi";
import type { DealContext } from "../../../types/chatbot";
import chatbotService from "../../../services/chatbot.service";

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: DealContext;
  vendorName: string;
  dealTitle: string;
}

type ExportStatus = "idle" | "generating" | "success" | "error";

export default function ExportPDFModal({
  isOpen,
  onClose,
  context,
  vendorName,
  dealTitle,
}: ExportPDFModalProps) {
  const [activeTab, setActiveTab] = useState<"download" | "email">("download");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    setStatus("generating");
    setProgress(10);
    setErrorMessage("");

    try {
      setProgress(30);

      // Call the API to get the PDF
      const response = await chatbotService.exportDealPDF(context);

      setProgress(70);

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers?.["content-disposition"];
      let filename = `Deal-Summary-${vendorName.replace(/[^a-zA-Z0-9]/g, "-")}-RFQ${context.rfqId}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setProgress(100);
      setStatus("success");

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setProgress(0);
      }, 1500);
    } catch (error: any) {
      console.error("PDF download failed:", error);
      setStatus("error");
      setErrorMessage(error.response?.data?.message || "Failed to generate PDF. Please try again.");
    }
  };

  const handleEmail = async () => {
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setStatus("generating");
    setProgress(10);
    setErrorMessage("");

    try {
      setProgress(50);

      await chatbotService.emailDealPDF(context, email);

      setProgress(100);
      setStatus("success");

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setProgress(0);
        setEmail("");
      }, 2000);
    } catch (error: any) {
      console.error("PDF email failed:", error);
      setStatus("error");
      setErrorMessage(error.response?.data?.message || "Failed to send email. Please try again.");
    }
  };

  const handleCancel = () => {
    if (status === "generating") {
      // Can't really cancel, but reset UI
      setStatus("idle");
      setProgress(0);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={status !== "generating" ? handleCancel : undefined}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Export PDF</h2>
              <p className="text-sm text-blue-100 truncate max-w-[280px]">{dealTitle}</p>
            </div>
            <button
              onClick={handleCancel}
              disabled={status === "generating"}
              className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {status === "idle" && (
              <>
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-dark-border mb-6">
                  <button
                    onClick={() => setActiveTab("download")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "download"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FiDownload className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => setActiveTab("email")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "email"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FiMail className="w-4 h-4" />
                    Email
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "download" ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiDownload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
                      Download PDF
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-6">
                      Generate and download the deal summary report as a PDF file.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMail className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2 text-center">
                      Email PDF
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4 text-center">
                      Send the deal summary report to an email address.
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMessage("");
                        }}
                        placeholder="recipient@example.com"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                      />
                      {errorMessage && (
                        <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
                      )}
                    </div>
                    <button
                      onClick={handleEmail}
                      className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Send Email
                    </button>
                  </div>
                )}
              </>
            )}

            {status === "generating" && (
              <div className="text-center py-8">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <FiLoader className="w-20 h-20 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
                  {activeTab === "download" ? "Generating PDF..." : "Sending Email..."}
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
                  This may take a few seconds
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">{progress}%</p>

                <button
                  onClick={handleCancel}
                  className="mt-6 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {status === "success" && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
                  {activeTab === "download" ? "Download Started!" : "Email Sent!"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  {activeTab === "download"
                    ? "Your PDF is being downloaded."
                    : `The PDF has been sent to ${email}`}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
                  Export Failed
                </h3>
                <p className="text-sm text-red-500 mb-6">{errorMessage}</p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setProgress(0);
                    setErrorMessage("");
                  }}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
