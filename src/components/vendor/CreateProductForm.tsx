import { useState, useEffect, useMemo } from "react";
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
import { useAutoSave } from "../../hooks/useAutoSave";
import AutosaveIndicator from "../AutosaveIndicator";

const CreateProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = Number(localStorage.getItem("%companyId%"));
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  const autosaveKey = useMemo(() => (
    id ? `product_edit_draft_${id}` : `product_create_draft_${companyId || 'new'}`
  ), [id, companyId]);

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
    },
  });

  const gstTypeValue = watch("gstType");
  const formValues = watch();

  const autosaveData = useMemo(() => ({
    productName: formValues.productName,
    category: formValues.category,
    brandName: formValues.brandName,
    gstType: formValues.gstType,
    gstPercentage: formValues.gstPercentage,
    tds: formValues.tds,
    type: formValues.type,
    UOM: formValues.UOM,
  }), [
    formValues.productName,
    formValues.category,
    formValues.brandName,
    formValues.gstType,
    formValues.gstPercentage,
    formValues.tds,
    formValues.type,
    formValues.UOM,
  ]);

  const { lastSaved, isSaving, clearSaved, loadSaved } = useAutoSave({
    key: autosaveKey,
    data: autosaveData,
    interval: 2000,
    enabled: isDataLoaded && !id, // Only auto-save in create mode
  });

  const hasMeaningfulDraft = (savedDraft: string | null): boolean => {
    if (!savedDraft) return false;
    try {
      const parsed = JSON.parse(savedDraft);
      return !!(
        parsed?.productName?.trim() ||
        parsed?.category?.trim() ||
        parsed?.brandName?.trim() ||
        parsed?.gstType?.trim() ||
        parsed?.type?.trim() ||
        parsed?.UOM?.trim()
      );
    } catch { return false; }
  };

  const fetchProductData = async (productId: string) => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/product/get/${productId}`);
      reset({ ...data });
    } catch (error: any) {
      console.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (id) {
      // Edit mode: load from server, no draft dialog
      fetchProductData(id).then(() => setIsDataLoaded(true));
    } else {
      const savedDraft = localStorage.getItem(autosaveKey);
      if (hasMeaningfulDraft(savedDraft)) {
        setShowDraftDialog(true);
      } else {
        if (savedDraft) localStorage.removeItem(autosaveKey);
        setIsDataLoaded(true);
      }
    }
  }, [id, autosaveKey]);

  const restoreDraft = () => {
    const savedData = loadSaved();
    if (savedData) {
      reset({ ...savedData });
      toast.success("Draft restored successfully");
    }
    setShowDraftDialog(false);
    setIsDataLoaded(true);
  };

  const discardDraft = () => {
    clearSaved();
    setShowDraftDialog(false);
    setIsDataLoaded(true);
  };

  const onSubmit = async (data: any) => {
    try {
      if (!id) {
        await authApi.post("/product/create", data);
        clearSaved();
        toast.success("Created Successfully");
        navigate("/product-management");
      } else {
        delete data.id;
        await authApi.put(`/product/update/${id}`, data);
        clearSaved();
        toast.success("Edited Successfully");
        navigate("/product-management");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Draft Restore Dialog */}
      {showDraftDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Restore Draft?
            </h3>
            <p className="text-gray-600 mb-4">
              You have an unsaved product draft from a previous session. Would you like to restore it?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all"
                onClick={discardDraft}
              >
                Start Fresh
              </Button>
              <Button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all"
                onClick={restoreDraft}
              >
                Restore Draft
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-6 px-16 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-medium">
            <IoArrowBackOutline
              onClick={() => { clearSaved(); navigate(-1); }}
              className="cursor-pointer"
            />
            {id ? "Edit Product " : "Create Product "}
          </h2>
          {!id && <AutosaveIndicator lastSaved={lastSaved} isSaving={isSaving} />}
        </div>
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
              options={["GST", "Non-GST"]}
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
              label="HSN/SAC Code"
              name="tds"
              type="number"
              placeholder="Enter HSN/SAC Code"
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
              options={["units", "kgs", "liters", "boxes", "packs", "tons", "meters", "lots", "license"]}
              register={register}
              error={errors.UOM}
              wholeInputClassName={`!my-0`}
            />
          </div>
          <div className="flex justify-start mt-6 space-x-4 pt-6 pb-0">
            <Button
              className="px-4 py-2 border border-gray-300 rounded-md !text-gray-900 !bg-white hover:bg-gray-100 !w-fit"
              onClick={() => { clearSaved(); navigate(-1); }}
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
