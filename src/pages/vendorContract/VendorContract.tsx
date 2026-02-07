import InputField from "../../components/InputField";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "../../schema/auth";
import toast from "react-hot-toast";
import api from "../../api";
import { useEffect, useState, useCallback } from "react";
import DateField from "../../components/DateField";
import SelectField from "../../components/SelectField";

const VendorContact = () => {
  const { id } = useParams();
  const [contracts, setContracts] = useState<any>({});
  const navigate = useNavigate();
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const {
    register,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const fetchVendorContract = async (uniqueToken: string) => {
    try {
      const {
        data: { data },
      } = await api.get(`/contract/get-contract-details?uniquetoken=${uniqueToken}`);
      setContracts(data);
    } catch (error: any) {
      console.error("Error fetching vendor contract:", error);
      toast.error(error.message || "Something went wrong while fetching data");
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchVendorContract(id);
  }, [id]);

  // Countdown effect
  useEffect(() => {
    if (!showCountdown) return;

    if (countdown <= 0) {
      // Navigate to vendor chat
      navigate(`/vendor-chat/${id}`);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showCountdown, countdown, navigate, id]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const today = new Date().setHours(0, 0, 0, 0);

    // Validate delivery dates
    const invalidDates = contracts?.Requisition?.RequisitionProduct?.some((product: any) => {
      const deliveryDate = formData.get(`deliveryDate_${product.id}`);
      if (!deliveryDate) return false;
      const selectedDate = new Date(deliveryDate as string);
      return selectedDate.getTime() < today;
    });

    if (invalidDates) {
      toast.error("Delivery Date cannot be in the past. Please select a valid date.");
      return;
    }

    try {
      // Build product quotations
      const productQuotations = contracts?.Requisition?.RequisitionProduct?.map((product: any) => ({
        productId: product.id,
        productName: product.Product.productName,
        quantity: product.qty || 0,
        quotedPrice: formData.get(`quotedPrice_${product.id}`) || 0,
        deliveryDate: formData.get(`deliveryDate_${product.id}`) || "",
      })) || [];

      // Get additional terms
      const paymentTerms = formData.get('paymentTerms') || "";
      const netPaymentDay = formData.get('netPaymentDay') || "";
      const prePaymentPercentage = formData.get('prePaymentPercentage') || "";
      const postPaymentPercentage = formData.get('postPaymentPercentage') || "";
      const additionalNotes = formData.get('additionalNotes') || "";

      const contractDetails = {
        products: productQuotations.map((quotation: any) => ({
          productId: quotation.productId,
          productName: quotation.productName,
          quantity: quotation.quantity,
          quotedPrice: quotation.quotedPrice,
          deliveryDate: quotation.deliveryDate,
        })),
        additionalTerms: {
          paymentTerms: paymentTerms,
          netPaymentDay: netPaymentDay,
          prePaymentPercentage: prePaymentPercentage,
          postPaymentPercentage: postPaymentPercentage,
          additionalNotes: additionalNotes,
        }
      };

      // Use public vendor-chat API endpoint (no auth required)
      const response = await api.post('/vendor-chat/quote', {
        uniqueToken: id,
        contractDetails: contractDetails,
      });

      console.log("API Response:", response.data);

      // Update local state
      setContracts((prev: any) => ({
        ...prev,
        status: "InitialQuotation",
      }));

      toast.success("Quotation submitted successfully!");

      // Show countdown and redirect to vendor chat
      setShowCountdown(true);
    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    }
  };

  // Redirect if negotiation has already started
  if (
    contracts?.Requisition?.status === "NegotiationStarted" ||
    contracts?.Requisition?.status === "Benchmarked"
  ) {
    navigate(`/vendor-chat/${id}`);
  }

  // Show countdown overlay
  if (showCountdown) {
    return (
      <div className="w-full max-w-md mt-8">
        <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quote Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your quotation has been submitted successfully. You will be redirected to the negotiation chat.
          </p>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">{countdown}</div>
            <p className="text-sm text-gray-500">Redirecting to chat...</p>
          </div>
          <button
            onClick={() => navigate(`/vendor-chat/${id}`)}
            className="mt-6 text-blue-600 hover:text-blue-800 underline"
          >
            Go to chat now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-max mt-8">
      {contracts?.Requisition?.status === "Draft" || contracts?.status === "Created" ? (
        <>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Vendor Contract
          </h2>

          <form className="mt-6 w-full" onSubmit={onSubmit}>
            {/* Products Quotation Section */}
            {contracts?.Requisition?.RequisitionProduct && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Provide Your Quotation</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 pt-2 pb-0">Product Name</th>
                      <th className="border border-gray-300 px-4 pt-2 pb-0">Required Quantity</th>
                      <th className="border border-gray-300 px-4 pt-2 pb-0">Your Quoted Price</th>
                      <th className="border border-gray-300 px-4 pt-2 pb-0">Your Delivery Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts?.Requisition?.RequisitionProduct?.map((product: any) => (
                      <tr key={product.id}>
                        <td className="border border-gray-300 px-4 pt-2 pb-0">
                          {product.Product.productName}
                        </td>
                        <td className="border border-gray-300 px-4 pt-2 pb-0">
                          {product.qty || 0}
                        </td>
                        <td className="border border-gray-300 px-4 pt-2 pb-0">
                          <InputField
                            type="number"
                            min={0}
                            step="0.01"
                            name={`quotedPrice_${product.id}`}
                            placeholder="Enter your price"
                            register={register}
                            error={errors[`quotedPrice_${product.id}`]}
                            wholeInputClassName="w-full"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 pt-2 pb-0">
                          <DateField
                            name={`deliveryDate_${product.id}`}
                            register={register}
                            value={watch(`deliveryDate_${product.id}`)}
                            error={errors[`deliveryDate_${product.id}`]}
                            className="w-full"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Additional Terms Section */}
            <div className="bg-white rounded-lg pt-6 px-6 pb-0 shadow-sm mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Terms</h3>
              <div className="space-y-4">
                <SelectField
                  label="Payment Terms"
                  name="paymentTerms"
                  placeholder="Select Payment Terms"
                  options={[
                    { id: "net_payment", paymentName: "Net Payment" },
                    { id: "pre_post_payment", paymentName: "Pre and Post Payment" }
                  ]}
                  register={register}
                  optionKey="paymentName"
                  optionValue="id"
                  error={errors.paymentTerms}
                  wholeInputClassName="my-1"
                />

                {/* Conditional Net Payment Day Field */}
                {watch("paymentTerms") === "net_payment" && (
                  <InputField
                    label="Net Payment Day (Optional)"
                    name="netPaymentDay"
                    placeholder="Enter number of days (optional)"
                    type="number"
                    value={watch("netPaymentDay") || ''}
                    min={0}
                    wholeInputClassName="my-1"
                    register={register}
                    onInput={(e: any) => {
                      if (e.target.value < 0) {
                        e.target.value = 0;
                      }
                    }}
                    onChange={(e: any) => {
                      const newValue = e.target.value === "" ? "" : parseInt(e.target.value);
                      if (typeof newValue === 'number' && newValue < 0) {
                        toast.error("Net payment day cannot be negative!");
                        return;
                      }
                      setValue("netPaymentDay", newValue);
                    }}
                  />
                )}

                {/* Conditional Pre and Post Payment Fields */}
                {watch("paymentTerms") === "pre_post_payment" && (
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Pre Payment Percentage (Optional)"
                      name="prePaymentPercentage"
                      placeholder="Enter percentage (optional)"
                      type="number"
                      value={watch("prePaymentPercentage") || ''}
                      min={0}
                      max={100}
                      wholeInputClassName="my-1"
                      register={register}
                      onInput={(e: any) => {
                        if (e.target.value < 0) {
                          e.target.value = 0;
                        }
                      }}
                      onChange={(e: any) => {
                        const newValue = e.target.value === "" ? "" : parseFloat(e.target.value);
                        if (typeof newValue === 'number' && newValue > 100) {
                          toast.error("Pre payment percentage cannot exceed 100%!");
                          return;
                        }
                        setValue("prePaymentPercentage", newValue);
                      }}
                    />

                    <InputField
                      label="Post Payment Percentage (Optional)"
                      name="postPaymentPercentage"
                      placeholder="Enter percentage (optional)"
                      type="number"
                      value={watch("postPaymentPercentage") || ''}
                      min={0}
                      max={100}
                      wholeInputClassName="my-1"
                      register={register}
                      onInput={(e: any) => {
                        if (e.target.value < 0) {
                          e.target.value = 0;
                        }
                      }}
                      onChange={(e: any) => {
                        const newValue = e.target.value === "" ? "" : parseFloat(e.target.value);
                        if (typeof newValue === 'number' && newValue > 100) {
                          toast.error("Post payment percentage cannot exceed 100%!");
                          return;
                        }
                        setValue("postPaymentPercentage", newValue);
                      }}
                    />
                  </div>
                )}

                <InputField
                  label="Additional Notes"
                  name="additionalNotes"
                  placeholder="Any additional terms or conditions"
                  type="text"
                  register={register}
                  error={errors.additionalNotes}
                  wholeInputClassName="my-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="mt-4"
            >
              Submit Quote
            </Button>
          </form>
        </>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Thank You!</h2>
          <p className="mt-4 text-gray-600">
            Your contract is under review. We appreciate your patience and
            will notify you as soon as the review process is completed.
          </p>
          {contracts?.status === "InitialQuotation" && (
            <button
              onClick={() => navigate(`/vendor-chat/${id}`)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Negotiation Chat
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorContact;
