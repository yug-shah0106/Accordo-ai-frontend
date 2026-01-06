import { useState } from "react";
import { useNavigate } from "react-router-dom";
import chatbotService from "../../services/chatbot.service";
import type { DealMode } from "../../types";

interface FormData {
  title: string;
  counterparty: string;
  mode: DealMode;
}

/**
 * NewDealPage Component
 * Form for creating a new negotiation deal
 */
export default function NewDealPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    counterparty: "",
    mode: "CONVERSATION",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError(new Error("Title is required"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await chatbotService.createDeal({
        title: formData.title.trim(),
        counterparty: formData.counterparty.trim() || undefined,
        mode: formData.mode,
      });

      // Navigate to the new deal
      const dealId = response.data.id;
      navigate(`/chatbot/deals/${dealId}`);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to create deal:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/chatbot")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-3 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Deals
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
          <p className="text-gray-600 text-sm mt-1">Start a new procurement negotiation</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-6">
        <div className="max-w-2xl mx-auto">

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm pt-6 px-6 pb-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Deal Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Widget Procurement - Vendor A"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Counterparty */}
            <div>
              <label
                htmlFor="counterparty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Counterparty Name (optional)
              </label>
              <input
                type="text"
                id="counterparty"
                name="counterparty"
                value={formData.counterparty}
                onChange={handleChange}
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Mode */}
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
                Negotiation Mode
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CONVERSATION">Conversation Mode</option>
                <option value="INSIGHTS">Insights Mode</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {formData.mode === "CONVERSATION"
                  ? "Free-form negotiation with AI assistance"
                  : "Demo mode with automated negotiation"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg pt-4 px-4 pb-0">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error creating deal
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Deal"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/chatbot")}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
