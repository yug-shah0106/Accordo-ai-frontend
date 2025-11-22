import { useForm } from "react-hook-form";
import SelectField from "../SelectField";
import Button from "../Button";
import { FaSquarePlus } from "react-icons/fa6";
import useFetchData from "../../hooks/useFetchData";
import { RiDeleteBinLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { authApi } from "../../api";
import { FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import axios from "axios";

const VendorDetails = ({
  currentStep,
  nextStep,
  prevStep,
  requisitionId,
  requisition,
}) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      selectedVendor: "",
    },
  });
  console.log({ requisition });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    reset({
      contractData: requisition?.Contract,
    });
  }, [requisition, reset]);

  const onSubmit = (data) => {
    if (!watch("contractData")?.length) {
      toast.error("Add Vendor First");
      return;
    }
    try {
      toast.success("Edited Successfully");
      submitRequisition();
      navigate(-1);
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };
  const { data, loading, error } = useFetchData("/vendor/get-all");
  const contractData = watch("contractData") || [];

  const handleAddContract = async () => {
    try {
      if (!watch("selectedVendor")) {
        toast.error("Select Vendor First");
        return;
      }
      const {
        data: { data },
      } = await authApi.post("/contract/create", {
        requisitionId: requisitionId,
        vendorId: watch("selectedVendor"),
      });

      setValue("contractData", [...(watch("contractData") || []), data]);

      setValue("selectedVendor", "");
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const handleDeleteContract = async (id) => {
    try {
      const {
        data: { data },
      } = await authApi.delete(`/contract/delete/${id}`);

      setValue(
        "contractData",
        watch("contractData")?.filter(
          (i) => i?.id?.toString() !== id?.toString()
        )
      );
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const handleCopy = (contract) => {
    const link = `${import.meta.env.VITE_FRONTEND_URL}/vendor-contract/${contract?.uniqueToken
      }`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy the link:", error);
      });
  };
  const handleModalConfirm = () => {
    setIsConfirmed(true); // Set the confirmed state to true
    setIsModalOpen(false); // Close the modal
    try {
      // toast.success("Edited Successfully");
      navigate(-1); // Proceed with navigation
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal without submitting
  };

  const submitRequisition = async (data) => {
    try {
      const requestData = {
        id: requisition.id,
        payment_terms: requisition.paymentTerms,
        delivery_date: requisition.deliveryDate.split("T")[0],
        negotiation_closure_date:
          requisition.negotiationClosureDate.split("T")[0],
        status: requisition.status,
        type_of_currency: requisition.typeOfCurrency,
        total_price: requisition.totalPrice,
        products: requisition.RequisitionProduct.map((product) => {
          return {
            product_name: product.Product
              ? product.Product.productName
              : "Unknown",
            quantity: product.qty,
            target_price: product.targetPrice,
          };
        }),
      };

      console.log("✅ Final requestData:", requestData);

      // const response = await axios.post(
      //   "https://model.accordo.ai/rfq/requisitions/",
      //   requestData
      // );

      console.log("Data sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="border-2  rounded p-4">
      <h3 className="text-lg font-semibold">Vendor Details</h3>
      <p className="font-normal text-[#46403E] py-2">
        Your details will be used for Vendor Details
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-2 justify-between">
          <div className="grow">
            {/* <SelectField
              name="selectedVendor"a
              // options={data || []}
              options={data?.filter(
                (i) =>
                  Array.isArray(watch("contractData")) && !watch("contractData")?.find(
                    (product) =>
                      product?.vendorId?.toString() === i?.id?.toString()
                  )
              ) || []}
              register={register}
              error={errors.categoryId}
              wholeInputClassName={`my-1`}
              optionKey={"name"}
              optionValue={"id"}
            /> */}
            <SelectField
              name="selectedVendor"
              placeholder="Select Vendor"
              // options={(data || [])?.filter(
              //   (i) =>
              //     Array.isArray(watch("contractData")) && !watch("contractData")?.find(
              //       (product) =>
              //         product?.vendorId?.toString() === i?.id?.toString()
              //     )
              // ) || []}
              options={(data || []).filter(
                (i) =>
                  Array.isArray(contractData) &&
                  !contractData.find(
                    (product) =>
                      product?.vendorId &&
                      i?.id &&
                      product.vendorId.toString() === i.vendorId.toString()
                  )
              )}
              register={register}
              error={errors.selectedVendor}
              wholeInputClassName={`my-1`}
              optionKey="Vendor.name"
              optionValue="vendorId"
            />
          </div>
          <div className="">
            {/* <FaSquarePlus
              className="cursor-pointer"
              onClick={() => {
                handleAddContract();
              }}
            /> */}
            <Button
              className={"px-2 cursor-pointer"}
              onClick={() => {
                handleAddContract();
              }}
            >
              Add
            </Button>
          </div>
        </div>
        {/* <div>selected dropdown value here</div> */}

        <ul>
          {Array.isArray(watch("contractData")) &&
            watch("contractData")?.map((contract, index) => {
              const matchedProduct = data?.find(
                (i) =>
                  i?.vendorId?.toString() === contract?.vendorId?.toString()
              );
              return (
                <li
                  key={index}
                  className="bg-[#F3F3F3] px-[10px]  mb-2 py-[10px] flex items-center justify-between gap-3 border-1 border-[#DDDDDD] select-none"
                >
                  <div className="d-flex flex-md-row flex-column">
                    <span className="md:text-base flex-grow text-[13px] font-[590]">
                      {matchedProduct?.Vendor?.name}
                    </span>
                  </div>
                  <span className="flex items-center gap-3 flex-grow">
                    <div className="flex items-center justify-between px-[10px] py-[5px] bg-white w-full">
                      <div className="cursor-pointer break-all">{`${import.meta.env.VITE_FRONTEND_URL
                        }/vendor-contract/${contract?.uniqueToken}`}</div>
                    </div>
                    <FiCopy
                      className="w-6 h-6 cursor-pointer"
                      onClick={() => handleCopy(contract)}
                    />
                    <RiDeleteBinLine
                      onClick={() => handleDeleteContract(contract?.id)}
                      className="cursor-pointer text-[#EF2D2E] w-6 h-6"
                    />
                  </span>
                </li>
              );
            })}
        </ul>

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
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded  !w-fit"
          >
            Next
          </Button>
        </div>
      </form>

      {isModalOpen && (
        <Modal
          wholeModalStyle="text-center"
          heading="Are you sure you want to proceed without adding any vendor?"
          cancelText="No"
          actionText="Yes"
          isDeleteIcon={true}
          btnsStyle="justify-center"
          onAction={handleModalConfirm}
          handleClose={handleModalClose}
        ></Modal>
      )}
    </div>
  );
};

export default VendorDetails;
