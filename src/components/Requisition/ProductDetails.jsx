import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Button from "../Button";
import TextareaField from "../TextareaField";
import { FaSquarePlus } from "react-icons/fa6";
import { useEffect, useMemo, useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { authMultiFormApi } from "../../api";
import toast from "react-hot-toast";
import { BsPlusCircleFill } from "react-icons/bs";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2 } from "../../schema/requisition";
import axios from "axios";

const ProductDetails = ({
  currentStep,
  nextStep,
  prevStep,
  requisitionId,
  projectId,
  requisition,
  setRequisition,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(step2),
    defaultValues: {
      files: [],
      netPaymentDay: null,
      discountTerms: '',
      pricePriority: 1,
      deliveryPriority: 1,
      paymentTermsPriority: 1,
      prePaymentPercentage: '',
      postPaymentPercentage: '',
    },
  });
  const { data, loading, error } = useFetchData("/product/getall");
  const [requisitionData, setRequisitionData] = useState({
    id: requisition.id,
    delivery_date: requisition.deliveryDate?.split("T")[0],
    negotiation_closure_date: requisition.negotiationClosureDate?.split("T")[0],
    payment_terms: "",
    status: requisition.status,
    type_of_currency: requisition.typeOfCurrency,
    created_at: "",
    total_price: "",
    products: [],
  });

  useEffect(() => {
    console.log("====")
    console.log({ requisition })
    console.log("=====")
    
    // Only reset if we have requisition data and it's different from current form values
    if (requisition && Object.keys(requisition).length > 0) {
      reset({
        selectedProduct: "",
        totalPrice: requisition?.totalPrice || '',
        productData: requisition?.productData ?? requisition?.RequisitionProduct ?? [],
        paymentTerms: requisition?.paymentTerms || '',
        files: requisition?.RequisitionAttachment || [],
        netPaymentDay: requisition?.netPaymentDay || '',
        prePaymentPercentage: requisition?.prePaymentPercentage || '',
        postPaymentPercentage: requisition?.postPaymentPercentage || '',
        discountTerms: requisition?.discountTerms || '',
        pricePriority: requisition?.pricePriority || '',
        deliveryPriority: requisition?.deliveryPriority || '',
        paymentTermsPriority: requisition?.paymentTermsPriority || '',
      });
    }
  }, [requisition?.id, reset]); // Only depend on requisition ID, not the entire requisition object

  const handleAddProduct = () => {
    if (!watch("selectedProduct")) {
      toast.error("Select Product First");
      return;
    }
    setValue("productData", [
      ...(watch("productData") || []),
      {
        productId: watch("selectedProduct"),
        qty: 1,
        targetPrice: '',
        maximum_price: '',
      },
    ]);

    setValue("selectedProduct", "");
  };

  const handleDeleteProduct = (productId) => {
    setValue(
      "productData",
      watch("productData").filter((i) => i.productId !== productId)
    );
  };

  const handleQtyProduct = (productId, method) => {
    setValue(
      "productData",
      watch("productData")
        .map((i) => {
          if (i.productId === productId) {
            if (method === "increment") {
              return { ...i, qty: i.qty + 1 };
            } else if (method === "decrement") {
              return { ...i, qty: i.qty - 1 };
            }
          }
          return i;
        })
        .filter((i) => i.qty > 0)
    );
  };

  // Modify the handleDirectInput function for 1-5 scale
  const handleDirectInput = (field, value) => {
    // Allow empty string for better UX while typing
    if (value === '') {
      setValue(field, '');
      return;
    }

    // Remove preceding zeros
    const cleanValue = value.replace(/^0+/, '') || '0';
    const newValue = parseInt(cleanValue);
    if (isNaN(newValue)) return;
    
    // Ensure value is between 1 and 5
    const clampedValue = Math.max(1, Math.min(5, newValue));
    
    // Get current values
    const currentValues = {
      pricePriority: watch("pricePriority") || 0,
      deliveryPriority: watch("deliveryPriority") || 0,
      paymentTermsPriority: watch("paymentTermsPriority") || 0
    };

    // Calculate what the new total would be
    const newTotal = Object.entries(currentValues).reduce((sum, [key, val]) => {
      return sum + (key === field ? clampedValue : (val || 0));
    }, 0);

    // If new total would exceed 15 (max 5 for each of 3 priorities), show error and don't update
    if (newTotal > 15) {
      toast.error("Total priority cannot exceed 15 (max 5 for each priority)");
      return;
    }

    // Update the value
    setValue(field, clampedValue);
  };

  // Modify the handlePriorityAdjust function for 1-5 scale
  const handlePriorityAdjust = (field, action) => {
    const currentValue = watch(field);
    // Handle empty string case
    if (currentValue === '') {
      setValue(field, action === 'increment' ? 1 : 1);
      return;
    }
    const newValue = action === 'increment' ? (currentValue || 0) + 1 : (currentValue || 0) - 1;
    handleDirectInput(field, newValue);
  };

  const onSubmit = async (data) => {
    console.log('🎯 FORM SUBMIT TRIGGERED!');
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('📋 ALL FORM DATA:', data);
    console.log('🔍 FORM FIELDS PRESENT:', Object.keys(data));
    console.log('📊 DETAILED FIELD VALUES:');
    console.log('  - selectedProduct:', data.selectedProduct);
    console.log('  - totalPrice:', data.totalPrice);
    console.log('  - productData:', data.productData);
    console.log('  - paymentTerms:', data.paymentTerms);
    console.log('  - files:', data.files);
    console.log('  - netPaymentDay:', data.netPaymentDay);
    console.log('  - prePaymentPercentage:', data.prePaymentPercentage);
    console.log('  - postPaymentPercentage:', data.postPaymentPercentage);
    console.log('  - discountTerms:', data.discountTerms);
    console.log('  - pricePriority:', data.pricePriority);
    console.log('  - deliveryPriority:', data.deliveryPriority);
    console.log('  - paymentTermsPriority:', data.paymentTermsPriority);
    console.log('=== END FORM DEBUG ===');
    
    // Check for validation errors
    console.log('🔍 FORM ERRORS:', errors);
    if (Object.keys(errors).length > 0) {
      console.error('❌ FORM VALIDATION FAILED:', errors);
      toast.error('Please fix form validation errors before submitting');
      return;
    }
    
    setRequisitionData((prevData) => ({
      ...prevData,
      payment_terms: data.paymentTerms,
      total_price: data.totalPrice,
      products: data.productData.map((product) => {
        const matchedProduct = productData.find(
          (item) => item.id === product.productId
        );
        return {
          product_name: matchedProduct ? matchedProduct.product_name : "Unknown",
          quantity: product.qty,
          target_price: product.targetPrice,
        };
      }),
    }));

    try {
      console.log('🚀 STARTING API CALL...');
      
      // Clean the data to ensure no undefined values
      const cleanData = {
        selectedProduct: data.selectedProduct || null,
        productData: data.productData || [],
        files: data.files || [],
        discountTerms: data.discountTerms || '',
        pricePriority: data.pricePriority || 0,
        deliveryPriority: data.deliveryPriority || 0,
        paymentTermsPriority: data.paymentTermsPriority || 0,
        totalPrice: data.totalPrice || 0,
        paymentTerms: data.paymentTerms || '',
        netPaymentDay: data.netPaymentDay || '',
        prePaymentPercentage: data.prePaymentPercentage || '',
        postPaymentPercentage: data.postPaymentPercentage || '',
      };
      
      if (!requisitionId) {
        // Create clean API data for new requisition
        const apiData = {
          selectedProduct: cleanData.selectedProduct,
          productData: cleanData.productData,
          files: cleanData.files,
          discountTerms: cleanData.discountTerms,
          pricePriority: cleanData.pricePriority,
          deliveryPriority: cleanData.deliveryPriority,
          paymentTermsPriority: cleanData.paymentTermsPriority,
          // Snake case versions for API
          total_price: cleanData.totalPrice,
          payment_terms: cleanData.paymentTerms,
          net_payment_day: cleanData.netPaymentDay,
          pre_payment_percentage: cleanData.prePaymentPercentage,
          post_payment_percentage: cleanData.postPaymentPercentage,
        };
        
        console.log('🚀 CREATING NEW REQUISITION - API DATA:', apiData);
        const response = await authMultiFormApi.post("/requisition/create", apiData);
        console.log('✅ API RESPONSE:', response);
        setRequisition(response.data.data);
        toast.success("Created Successfully");
        nextStep();
      } else {
        // Create clean API data for updating requisition
        const apiData = {
          selectedProduct: cleanData.selectedProduct,
          productData: cleanData.productData,
          files: cleanData.files,
          discountTerms: cleanData.discountTerms,
          pricePriority: cleanData.pricePriority,
          deliveryPriority: cleanData.deliveryPriority,
          paymentTermsPriority: cleanData.paymentTermsPriority,
          // Snake case versions for API
          total_price: cleanData.totalPrice,
          payment_terms: cleanData.paymentTerms,
          net_payment_day: cleanData.netPaymentDay,
          pre_payment_percentage: cleanData.prePaymentPercentage,
          post_payment_percentage: cleanData.postPaymentPercentage,
        };
        
        console.log('🔄 UPDATING REQUISITION - API DATA:', apiData);
        const response = await authMultiFormApi.put(
          `/requisition/update/${requisitionId}`,
          apiData
        );
        console.log('✅ API RESPONSE:', response);
        toast.success("Edited Successfully");
        nextStep();
      }
    } catch (error) {
      console.error('❌ API ERROR:', error);
      toast.error(error.message || "Something went wrong");
    }
  };

  const productData = watch("productData");
  const totalPrice = useMemo(() => {
    if (productData) {
      return productData.reduce(
        (acc, curr) => acc + curr.qty * (curr.targetPrice || 0),
        0
      );
    }
    return 0;
  }, [productData]);

  useEffect(() => {
    setValue("totalPrice", totalPrice);
  }, [totalPrice, setValue]);

  // Debug form state
  useEffect(() => {
    console.log('🔍 FORM STATE DEBUG:');
    console.log('  - Errors:', errors);
    console.log('  - Is Submitting:', isSubmitting);
    console.log('  - Current Step:', currentStep);
    console.log('  - Form Values:', watch());
  }, [errors, isSubmitting, currentStep, watch]);

  console.log({ requisitionData });
  console.log(productData);

  return (
    <div className="space-y-6">
      <div className="border-2 rounded p-4">
        <h3 className="text-lg font-semibold">Product Details</h3>
        <p className="font-normal text-[#46403E] py-2">
          Your details will be used for Product Details
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-2 justify-between">
            <div className="grow">
              <SelectField
                name="selectedProduct"
                placeholder="Select Product"
                options={data?.filter(
                  (i) =>
                    !watch("productData")?.find(
                      (product) =>
                        product?.productId?.toString() === i?.id?.toString()
                    )
                )}
                register={register}
                optionKey={"productName"}
                optionValue={"id"}
                error={errors.categoryId}
                wholeInputClassName={`my-1`}
              />
            </div>
            <div className="">
              <Button className={"px-2 cursor-pointer"} onClick={() => handleAddProduct()} >Add</Button>
            </div>
          </div>

          <ul>
            {Array.isArray(watch("productData")) &&
              watch("productData")?.map((product, index) => {
                const matchedProduct = data?.find(
                  (i) => i.id.toString() === product?.productId.toString()
                );
                return (
                  <li
                    key={index}
                    className="bg-[#F3F3F3] px-[10px] mb-4 py-[10px] border-1 border-[#DDDDDD] select-none"
                  >
                    <div className="d-flex flex-md-row flex-column flex-grow mb-3">
                      <span className="md:text-base flex-grow text-[13px] font-[590]">
                        {matchedProduct?.productName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Quantity Field */}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1 font-medium">Quantity</span>
                        <InputField
                          placeholder="Enter quantity"
                          type="number"
                          name="qty"
                          value={watch(`productData.${index}.qty`) || ''}
                          onChange={(e) => {
                            setValue(
                              "productData",
                              watch("productData").map((i) => {
                                if (i.productId === product?.productId) {
                                  return { ...i, qty: e.target.value };
                                }
                                return i;
                              })
                            );
                          }}
                          wholeInputClassName={`my-1`}
                        />
                      </div>

                      {/* Target Price Field */}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1 font-medium">Target Price</span>
                        <InputField
                          placeholder="Enter target Price"
                          type="number"
                          min={0}
                          name="targetPrice"
                          value={watch(`productData.${index}.targetPrice`) || ''}
                          onChange={(e) => {
                            const newValue = e.target.value === "" ? "" : parseFloat(e.target.value);

                            // Allow null/empty but prevent negative values
                            if (newValue < 0) {
                              toast.error("Target price cannot be negative!");
                              return;
                            }

                            setValue(
                              "productData",
                              watch("productData").map((i) => {
                                if (i.productId === product?.productId) {
                                  return { ...i, targetPrice: e.target.value };
                                }
                                return i;
                              })
                            );
                          }}
                          wholeInputClassName={`my-1`}
                          error={errors.productData}
                        />
                      </div>

                      {/* Maximum Price Field */}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1 font-medium">Max Price</span>
                        <InputField
                          placeholder="Max Price"
                          type="number"
                          min={0}
                          name="maximum_price"
                          value={watch(`productData.${index}.maximum_price`) || ''}
                          onChange={(e) => {
                            const newValue = e.target.value === "" ? "" : parseFloat(e.target.value);

                            // Allow null/empty but prevent negative values
                            if (newValue < 0) {
                              toast.error("Maximum price cannot be negative!");
                              return;
                            }

                            setValue(
                              "productData",
                              watch("productData").map((i) => {
                                if (i.productId === product?.productId) {
                                  return { ...i, maximum_price: e.target.value };
                                }
                                return i;
                              })
                            );
                          }}
                          wholeInputClassName={`my-1`}
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-600 mb-1 font-medium">Delete</span>
                        <RiDeleteBinLine
                          onClick={() => handleDeleteProduct(product?.productId)}
                          className="cursor-pointer text-red-500 hover:text-red-700"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <InputField
              label="Total Price"
              name="totalPrice"
              disabled={true}
              value={watch("totalPrice") || ''}
              placeholder="Enter Price"
              type="text"
              wholeInputClassName={`my-1`}
            />
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Settings</h3>
            <div className="space-y-6">
              {/* Price Priority Input */}
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Price Priority</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePriorityAdjust("pricePriority", "decrement")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={watch("pricePriority") || 1}
                    onChange={(e) => handleDirectInput("pricePriority", e.target.value)}
                    className="w-20 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handlePriorityAdjust("pricePriority", "increment")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MdKeyboardArrowUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500">(1-5)</span>
                </div>
              </div>

              {/* Delivery Priority Input */}
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Delivery Priority</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePriorityAdjust("deliveryPriority", "decrement")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={watch("deliveryPriority") || 1}
                    onChange={(e) => handleDirectInput("deliveryPriority", e.target.value)}
                    className="w-20 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handlePriorityAdjust("deliveryPriority", "increment")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MdKeyboardArrowUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500">(1-5)</span>
                </div>
              </div>

              {/* Payment Terms Priority Input */}
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Payment Terms Priority</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePriorityAdjust("paymentTermsPriority", "decrement")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MdKeyboardArrowDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={watch("paymentTermsPriority") || 1}
                    onChange={(e) => handleDirectInput("paymentTermsPriority", e.target.value)}
                    className="w-20 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handlePriorityAdjust("paymentTermsPriority", "increment")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MdKeyboardArrowUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500">(1-5)</span>
                </div>
              </div>

              {/* Total Priority Display */}
              
            </div>
          </div>

          {/* Payment Terms Field */}
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
            wholeInputClassName={`my-1`}
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
              wholeInputClassName={`my-1`}
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
                wholeInputClassName={`my-1`}
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
                wholeInputClassName={`my-1`}
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

          <div className="flex flex-col justify-center w-full ">
            <label
              htmlFor={"files"}
              className={`block text-white-600 font-medium mb-2`}
            >
              Attachments
            </label>
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-100 rounded-lg cursor-pointer  hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Click to Upload file
                </p>
              </div>
              <input
                {...register("files")}
                id="dropzone-file"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-6 my-3">
            {watch("files") &&
              Object.keys(watch("files")).map((file, index) => {
                return (
                  <div key={`${file.name}-${index}`} className="relative w-fit">
                    <img
                      src={
                        watch("files")?.[file]?.attachmentUrl
                          ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${watch("files")?.[file]?.attachmentUrl
                          }`
                          : URL.createObjectURL(watch("files")?.[file])
                      }
                      className="w-12 h-12"
                    />
                    <BsPlusCircleFill
                      className="rotate-45 cursor-pointer ml-2 text-red-500 hover:text-red-700 absolute -right-1 top-0"
                      onClick={() => {
                        setValue(
                          "files",
                          watch("files").filter((_, idx) => idx !== index)
                        );
                      }}
                    />
                  </div>
                );
              })}
          </div>

          <div className="mt-4 flex justify-start gap-4">
            <Button
              className="px-4 py-2 bg-[white] text-[black] border rounded !w-fit"
              onClick={() => {
                prevStep();
              }}
              type="button"
              disabled={isSubmitting || currentStep === 1}
            >
              Previous
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || currentStep === 3}
              className="px-4 py-2 bg-blue-500 text-white rounded  !w-fit"
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductDetails;