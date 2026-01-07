import { useState, useEffect } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../InputField";
import SelectField from "../SelectField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { authApi } from "../../api";
import productSchema from "../../schema/product";
import Button from "../Button";

const CreateProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = localStorage.getItem("%companyId%")

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      category: "",
      brandName: "",
      gstType: "",
      tds: 0,
      type: "",
      UOM: "",
      gstPercentage: null,
      companyId: companyId,
    },
  });
  const gstTypeValue = watch("gstType");
  


  const fetchProductData = async (productId) => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/product/get/${productId}`);
      reset({ ...data });
      console.log(data);

    } catch (error) {
      console.error(error.message || "Something went wrong");
    }
  };

  const onSubmit = async (data) => {
   
    try {
      if (!id) {
        const response = await authApi.post("/product/create", data);
        toast.success("Created Successfully");
        navigate("/product-management");
      } else {
        delete data.id;
        const response = await authApi.put(`/product/update/${id}`, data);
        toast.success("Edited Successfully");
        navigate("/product-management");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };



  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-6 px-16 pb-4 flex-shrink-0">
        <h2 className="flex items-center gap-2 text-xl font-medium">
          <IoArrowBackOutline
            onClick={() => {
              navigate(-1);
            }}
            className="cursor-pointer"
          />
          {id ? "Edit Product " : "Create Product "}
        </h2>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto px-16 pb-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6 pt-6 pb-0">
            <InputField
              label="Name"
              name="productName"
              placeholder="Enter Name"
              type="text"
              register={register}
              error={errors.productName}
              wholeInputClassName={`!my-0`}
            />
            <InputField
              label="Brand"
              name="brandName"
              placeholder="Enter Brand"
              register={register}
              error={errors.brandName}
              wholeInputClassName={`!my-0`}
            />
            <InputField
              label="Category"
              name="category"
              placeholder="Enter Category"
              type="text"
              register={register}
              error={errors.category}
              wholeInputClassName={`!my-0`}
            />
            <SelectField
              label="GST Percentage"
              name="gstType"
              // options={["0%", "5%", "12%", "18%", "28%"]}
              options={["GST", "Non-Gst"]}
              register={register}
              error={errors.gstType}
              className="custom-class"
              wholeInputClassName={`!my-0`}
              placeholder="Select GST Percentage"
            />
            {gstTypeValue === "GST" && (
              <SelectField
                label="GST Percentage"
                name="gstPercentage"
                options={[0, 5, 12, 18, 28]}
                register={register}
                error={errors.gstPercentage}
                className="custom-class"
                wholeInputClassName="!my-0"
              />
            )}
            <InputField
              label="HSN Code"
              name="tds"
              type="number"
              placeholder="Enter HSN Code"
              max={10}
              register={register}
              error={errors.tds}
              wholeInputClassName={`!my-0`}
            />
            <SelectField
              label="Type"
              name="type"
              options={["Goods", "Services"]}
              register={register}
              error={errors.gstType}
              wholeInputClassName={`!my-0`}
            />
            <SelectField
              label="UOM"
              name="UOM"
              options={["kg", "liters", "pieces"]}
              register={register}
              error={errors.UOM}
              wholeInputClassName={`!my-0`}
            />
            {/* <InputField
              label="UOM"
              name="UOM"
              type="text"
              placeholder="Enter UOM"
              register={register}
              error={errors.UOM}
              wholeInputClassName={`!my-0`}
            /> */}
          </div>
          <div className="flex justify-start mt-6 space-x-4 pt-6 pb-0">
            <Button
              className="px-4 py-2 border border-gray-300 rounded-md !text-gray-900 !bg-white hover:bg-gray-100 !w-fit"
              onClick={() => navigate(-1)}
              type="button"
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 !w-fit"

            >
              {id ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductForm;
