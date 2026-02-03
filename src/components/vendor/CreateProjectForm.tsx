import { useState, useEffect, useMemo } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../InputField";
import SelectField from "../SelectField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "../Button";
import { authApi } from "../../api";
import useFetchData from "../../hooks/useFetchData";
import projectSchema from "../../schema/project";
import { FaSquarePlus } from "react-icons/fa6";
import toast from "react-hot-toast";
import img from "../../assets/defaultImage.png";
import { FiX } from "react-icons/fi";
import { useAutoSave } from "../../hooks/useAutoSave";
import AutosaveIndicator from "../AutosaveIndicator";

interface CreateProjectFormProps {
  onSave?: () => void;
  onClose?: () => void;
}

const CreateProjectForm = ({ onSave, onClose }: CreateProjectFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = Number(localStorage.getItem("%companyId%"));
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Generate autosave key based on whether we're editing or creating
  const autosaveKey = useMemo(() => {
    return id
      ? `project_edit_draft_${id}`
      : `project_create_draft_${companyId || 'new'}`;
  }, [id, companyId]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid },
    trigger,
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectId: "",
      projectName: "",
      projectAddress: "",
      typeOfProject: "",
      tenureInDays: "",
      pointOfContact: [],
      selectedPoc: "",
      companyId: Number(companyId),
    },
    mode: "onChange",
  });

  // Watch form values for autosave (exclude selectedPoc as it's just for UI)
  const formValues = watch();
  const autosaveData = useMemo(() => ({
    projectName: formValues.projectName,
    projectAddress: formValues.projectAddress,
    typeOfProject: formValues.typeOfProject,
    tenureInDays: formValues.tenureInDays,
    pointOfContact: formValues.pointOfContact,
  }), [
    formValues.projectName,
    formValues.projectAddress,
    formValues.typeOfProject,
    formValues.tenureInDays,
    formValues.pointOfContact,
  ]);

  // Autosave hook - saves 2 seconds after last change
  const { lastSaved, isSaving, hasDraft, clearSaved, loadSaved } = useAutoSave({
    key: autosaveKey,
    data: autosaveData,
    interval: 2000, // 2 seconds debounce
    enabled: isDataLoaded, // Only enable after initial data is loaded
  });

  const { data, loading, error } = useFetchData("/customer/get-all");

  // Check for existing draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(autosaveKey);
    if (savedDraft && !id) {
      // For new projects, show dialog to restore draft
      setShowDraftDialog(true);
    } else if (savedDraft && id) {
      // For edit mode, show dialog to restore draft
      setShowDraftDialog(true);
    }
  }, [autosaveKey, id]);

  // Function to restore draft
  const restoreDraft = () => {
    const savedData = loadSaved();
    if (savedData) {
      setValue("projectName", savedData.projectName || "");
      setValue("projectAddress", savedData.projectAddress || "");
      setValue("typeOfProject", savedData.typeOfProject || "");
      setValue("tenureInDays", savedData.tenureInDays || "");
      setValue("pointOfContact", savedData.pointOfContact || []);
      toast.success("Draft restored successfully");
    }
    setShowDraftDialog(false);
    setIsDataLoaded(true);
  };

  // Function to discard draft
  const discardDraft = () => {
    clearSaved();
    setShowDraftDialog(false);
    setIsDataLoaded(true);
  };

  const fetchProductData = async (productId) => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/project/get/${productId}`);
      reset({
        ...data,
        selectedPoc: "",
        pointOfContact: data?.ProjectPoc?.map((i) => i.userId),
      });
      // Check for draft after loading project data
      const savedDraft = localStorage.getItem(autosaveKey);
      if (savedDraft) {
        setShowDraftDialog(true);
      } else {
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error(error.message || "Something went wrong");
      setIsDataLoaded(true);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    } else {
      // For new projects, check draft immediately
      const savedDraft = localStorage.getItem(autosaveKey);
      if (!savedDraft) {
        setIsDataLoaded(true);
      }
    }
  }, [id, autosaveKey]);

  const onSubmit = async (data) => {
    try {
      const isValid = await trigger();
      if (!isValid) {
        toast.error("Please fix the validation errors before submitting");
        return;
      }

      delete data.selectedPoc;
      if (!id) {
        const response = await authApi.post("/project/create", data);
        clearSaved(); // Clear draft on successful creation
        toast.success("Project created successfully");
        navigate("/project-management");
      } else {
        delete data.id;
        const response = await authApi.put(`/project/update/${id}`, data);
        clearSaved(); // Clear draft on successful update
        toast.success("Project updated successfully");
        navigate("/project-management");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleTenureChange = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) {
      return;
    }
    setValue("tenureInDays", value);
    trigger("tenureInDays");
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
              You have an unsaved draft from a previous session. Would you like to restore it?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all"
                onClick={discardDraft}
              >
                Discard
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
              onClick={() => {
                navigate(-1);
              }}
              className="cursor-pointer"
            />
            {id ? "Edit Project" : "Create Project"}
          </h2>
          <AutosaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto px-16 pb-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6 pt-6 pb-0">
            {id && <InputField
              label="Project Id"
              name="projectId"
              placeholder="Enter Project ID"
              type="text"
              value={watch("projectId")?.slice(-12)}
              register={register}
              disabled={true}
              wholeInputClassName={`!my-0`}
            />}

            <InputField
              label="Project Name"
              name="projectName"
              placeholder="Enter Project Name"
              type="text"
              register={register}
              error={errors.projectName}
              wholeInputClassName={`!my-0`}
              readOnly
            />
            <InputField
              label="Address"
              name="projectAddress"
              placeholder="Enter address"
              type="text"
              register={register}
              error={errors.projectAddress}
              wholeInputClassName={`!my-0`}
            />
            <InputField
              label="Business Category"
              name="typeOfProject"
              placeholder="Enter Business Category"
              type="text"
              register={register}
              error={errors.typeOfProject}
              wholeInputClassName={`!my-0`}
            />
            <InputField
              label="Tenure"
              name="tenureInDays"
              placeholder="Enter Tenure (In Days)"
              type="text"
              register={register}
              error={errors.tenureInDays}
              wholeInputClassName={`!my-0`}
              onChange={handleTenureChange}
            />
          </div>

          <div className="flex items-center gap-2 mb-4 mt-4">
            <div className="grow">
              <SelectField
                label="POC"
                name="selectedPoc"
                options={data?.filter(
                  (i) =>
                    !watch("pointOfContact")?.map(String).includes(String(i.id))
                )}
                register={register}
                optionKey={"name"}
                optionValue={"id"}
                wholeInputClassName={`!my-0`}
                error={errors.pointOfContact}
              />
            </div>
            <div className="self-end cursor-pointer">
              <Button
                className="px-4 py-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[90px] justify-center shadow-sm hover:shadow-md active:shadow-inner" 
                onClick={async () => {
                  const selectedPoc = watch("selectedPoc");
                  if (!selectedPoc) {
                    toast.error("Please select a valid POC");
                    return;
                  }
                  
                  const newPointOfContact = [
                    ...(watch("pointOfContact") || []),
                    selectedPoc,
                  ];
                  
                  setValue("pointOfContact", newPointOfContact);
                  setValue("selectedPoc", "");
                  
                  await trigger("pointOfContact");
                }}
              >
                <FaSquarePlus className="w-4 h-4" />
                Add POC
              </Button>
            </div>
          </div>

          {errors.pointOfContact && (
            <div className="text-red-500 text-sm mb-4">
              {errors.pointOfContact.message}
            </div>
          )}

          {Array.isArray(watch("pointOfContact")) &&
            watch("pointOfContact")?.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {watch("pointOfContact")?.map((i) => {
                  const matchPoc = data?.find((poc) => poc?.id == i);
                  const profilePic = matchPoc?.profilePic
                    ? `${import.meta.env.VITE_ASSEST_URL}/uploads/${matchPoc?.profilePic}`
                    : img;

                  return (
                    <div
                      key={i}
                      className="relative flex flex-col items-center w-16 text-center"
                    >
                      <img
                        src={profilePic}
                        alt="icon"
                        className="w-12 h-12 object-cover rounded-full"
                      />
                      <p className="text-[0.7rem] break-words truncate max-w-full mt-1">
                        {matchPoc?.name ?? matchPoc?.id ?? i}
                      </p>
                      <button
                        type="button"
                        className="absolute -right-1 -top-1"
                        onClick={async () => {
                          const newPointOfContact = getValues("pointOfContact").filter((p) => p !== i);
                          setValue("pointOfContact", newPointOfContact);
                          await trigger("pointOfContact");
                        }}
                      >
                        <FiX className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              className="px-6 py-3 !bg-white border-2 border-gray-400 !text-gray-800 hover:bg-gray-100 hover:border-gray-500 hover:!text-gray-900 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center shadow-sm hover:shadow-md active:shadow-inner
                ${isSubmitting || !isValid
                  ? 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed shadow-none'
                  : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af]'
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{id ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <span>{id ? "Update Project" : "Create Project"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;

