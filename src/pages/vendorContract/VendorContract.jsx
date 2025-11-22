import InputField from "../../components/InputField";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "../../schema/auth";
import toast from "react-hot-toast";
import api, { authApi } from "../../api";
import { useEffect, useState } from "react";
import DateField from "../../components/DateField";
import SelectField from "../../components/SelectField";

const VendorContact = () => {
  const { id } = useParams();
  const [contracts, setContracts] = useState({});
  const navigate = useNavigate()

  const {
    register,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const fetchVendorContract = async (id) => {
    try {
      const {
        data: { data },
      } = await api.get(`/contract/get-contract-details?uniquetoken=${id}`);
      setContracts(data);
    } catch (error) {
      console.error("Error fetching vendor contract:", error);
      toast.error(error.message || "Something went wrong while fetching data");
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchVendorContract(id);
  }, [id]);

  const onSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date without time

    // Validate delivery dates
    const invalidDates = contracts?.Requisition?.RequisitionProduct?.some((product) => {
      const deliveryDate = formData.get(`deliveryDate_${product.id}`);
      if (!deliveryDate) return false;
      const selectedDate = new Date(deliveryDate);
      return selectedDate < today;
    });

    if (invalidDates) {
      toast.error("Delivery Date cannot be in the past. Please select a valid date.");
      return;
    }

    try {
      // Build product quotations
      const productQuotations = contracts?.Requisition?.RequisitionProduct?.map((product) => ({
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
        products: productQuotations.map((quotation) => ({
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

      const payload = {
        contractDetails: contractDetails,
        status: "InitialQuotation",
      };

      console.log("Payload to Send:", payload);

      const response = await authApi.put(`/contract/update/${contracts?.id}`, payload);

      console.log("API Response:", response.data);

      // Also update the requisition status if we have access to it
      if (contracts?.Requisition?.id) {
        try {
          await authApi.put(`/requisition/update/${contracts.Requisition.id}`, {
            status: "InitialQuotation"
          });
          console.log("Requisition status updated successfully");
        } catch (reqError) {
          console.error("Error updating requisition status:", reqError);
          // Don't fail the whole operation if requisition update fails
        }
      }

      // Update local state
      setContracts((prev) => ({
        ...prev,
        status: "InitialQuotation",
      }));

      toast.success("Quotation submitted successfully!");
      
      // Show success message and redirect to refresh the page
      toast.success("Redirecting to show updated status...");
      
      // Redirect to refresh the data and show updated status
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 2000);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error(error.message || "Something went wrong");
    }
  };


  console.log({ contracts })
  console.log(contracts);


  if (
    contracts?.Requisition?.status === "NegotiationStarted" ||
    contracts?.Requisition?.status === "Benchmarked"
    // contracts?.status === "InitialQuotation"
  ) {
    // window.location.href = `https://accordochat-nalzcdsp9smtzxwgzc6ebq.streamlit.app/?uniqueToken=${contracts.uniqueToken}`;
    navigate(`/chat`, { state: contracts })
  }

  return (
    <div className="w-max  mt-8">
      {contracts?.Requisition?.status === "Draft" || contracts?.status === "Created" ? (
        <>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Vendor Contract
          </h2>

          <form className="mt-6 w-full " onSubmit={onSubmit}>
            {/* Products Quotation Section */}
            {contracts?.Requisition?.RequisitionProduct && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Provide Your Quotation</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Product Name</th>
                      <th className="border border-gray-300 px-4 py-2">Required Quantity</th>
                      <th className="border border-gray-300 px-4 py-2">Your Quoted Price</th>
                      <th className="border border-gray-300 px-4 py-2">Your Delivery Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts?.Requisition?.RequisitionProduct?.map((product, idx) => (
                      <tr key={product.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          {product.Product.productName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {product.qty || 0}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
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
                        <td className="border border-gray-300 px-4 py-2">
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
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
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
                    onInput={(e) => {
                      // Allow empty values and prevent negative input while typing
                      if (e.target.value < 0) {
                        e.target.value = 0;
                      }
                    }}
                    onChange={(e) => {
                      const newValue = e.target.value === "" ? "" : parseInt(e.target.value);

                      // Allow empty values and prevent negative values
                      if (newValue < 0) {
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
                      onInput={(e) => {
                        // Prevent negative input while typing
                        if (e.target.value < 0) {
                          e.target.value = 0;
                        }
                      }}
                      onChange={(e) => {
                        const newValue = e.target.value === "" ? "" : parseFloat(e.target.value);

                        // Prevent exceeding 100%
                        if (newValue > 100) {
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
                      onInput={(e) => {
                        // Prevent negative input while typing
                        if (e.target.value < 0) {
                          e.target.value = 0;
                        }
                      }}
                      onChange={(e) => {
                        const newValue = e.target.value === "" ? "" : parseFloat(e.target.value);

                        // Prevent exceeding 100%
                        if (newValue > 100) {
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
              Save
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
        </div>
      )}
    </div>
  );
};

export default VendorContact;



