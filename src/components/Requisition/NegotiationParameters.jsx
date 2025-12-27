import React, { useState, useEffect } from "react";
import { authApi } from "../../api";
import toast from "react-hot-toast";

const NegotiationParameters = ({ requisitionId, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        batna: "",
        maxDiscount: "",
        discountedValue: "",
    });
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        if (requisitionId) {
            fetchRequisitionData();
        }
    }, [requisitionId]);

    const fetchRequisitionData = async () => {
        try {
            setLoading(true);
            const response = await authApi.get(`/requisition/get/${requisitionId}`);
            const requisition = response.data.data;
            
            setFormData({
                batna: requisition.batna || "",
                maxDiscount: requisition.maxDiscount || "",
                discountedValue: requisition.discountedValue || "",
            });
            
            setOriginalData({
                batna: requisition.batna || "",
                maxDiscount: requisition.maxDiscount || "",
                discountedValue: requisition.discountedValue || "",
            });
        } catch (error) {
            console.error("Error fetching requisition:", error);
            toast.error("Failed to load negotiation parameters");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value === "" ? "" : parseFloat(value) || "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.batna && formData.batna <= 0) {
            toast.error("BATNA must be greater than 0");
            return;
        }
        
        if (formData.maxDiscount && (formData.maxDiscount < 0 || formData.maxDiscount > 100)) {
            toast.error("Maximum discount must be between 0 and 100");
            return;
        }
        
        if (formData.discountedValue && formData.discountedValue <= 0) {
            toast.error("Discounted value must be greater than 0");
            return;
        }

        try {
            setLoading(true);
            await authApi.put(`/requisition/update/${requisitionId}`, {
                batna: formData.batna || null,
                maxDiscount: formData.maxDiscount || null,
                discountedValue: formData.discountedValue || null,
            });
            
            setOriginalData({ ...formData });
            toast.success("Negotiation parameters updated successfully");
            
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating negotiation parameters:", error);
            toast.error(error.response?.data?.error || "Failed to update negotiation parameters");
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        return (
            formData.batna !== originalData.batna ||
            formData.maxDiscount !== originalData.maxDiscount ||
            formData.discountedValue !== originalData.discountedValue
        );
    };

    if (loading && !formData.batna && !formData.maxDiscount) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Negotiation Parameters
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        BATNA (Best Alternative To a Negotiated Agreement)
                    </label>
                    <input
                        type="number"
                        name="batna"
                        value={formData.batna}
                        onChange={handleChange}
                        placeholder="Enter BATNA value"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Target price for negotiation. This is the minimum acceptable price.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Discount (%)
                    </label>
                    <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleChange}
                        placeholder="Enter maximum discount percentage"
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Maximum discount percentage acceptable (0-100%).
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Discounted Value
                    </label>
                    <input
                        type="number"
                        name="discountedValue"
                        value={formData.discountedValue}
                        onChange={handleChange}
                        placeholder="Enter current discounted value"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Current discounted price achieved through negotiation.
                    </p>
                </div>

                {hasChanges() && (
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...originalData })}
                            disabled={loading}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>

            {formData.batna && formData.discountedValue && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Negotiation Status</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">BATNA Target:</span>
                            <span className="font-semibold">{formData.batna}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Current Value:</span>
                            <span className="font-semibold">{formData.discountedValue}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Difference:</span>
                            <span className={`font-semibold ${
                                formData.discountedValue <= formData.batna 
                                    ? "text-green-600" 
                                    : "text-red-600"
                            }`}>
                                {formData.discountedValue > formData.batna 
                                    ? `+${(formData.discountedValue - formData.batna).toFixed(2)}`
                                    : `${(formData.discountedValue - formData.batna).toFixed(2)}`
                                }
                            </span>
                        </div>
                        {formData.discountedValue <= formData.batna && (
                            <div className="mt-2 p-2 bg-green-100 rounded text-green-800 text-xs">
                                ✓ Target achieved! Current value is at or below BATNA.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NegotiationParameters;

