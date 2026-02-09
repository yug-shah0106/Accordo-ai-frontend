import { useForm } from "react-hook-form";
import { FormInput, FormSelect, SelectOption } from "../shared";
import Button from "../Button";
import { authApi, authMultiFormApi } from "../../api";
import toast from "react-hot-toast";
// zodResolver available if needed for form validation
// import { zodResolver } from "@hookform/resolvers/zod";
import { step1 } from "../../schema/requisition";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAutoSave } from "../../hooks/useAutoSave";
import AutosaveIndicator from "../AutosaveIndicator";

interface Project {
  id: string;
  projectName: string;
  tenureInDays: number;
  label?: string;
  value?: string;
}

interface Requisition {
  id?: string;
  benchmarkingDate?: string;
  subject?: string;
  category?: string;
  deliveryDate?: string;
  maxDeliveryDate?: string; // Backend uses this name
  maximumDeliveryDate?: string; // Keep for backward compatibility
  negotiationClosureDate?: string;
  typeOfCurrency?: string;
  rfqId?: string;
  projectId?: string;
}

interface ProjectState {
  id?: string;
  tenureInDays?: number;
}

interface BasicInformationProps {
  currentStep: number;
  nextStep: () => void;
  requisitionId: string;
  projectId: ProjectState | null;
  requisition: Requisition | null;
  setRequisition: (value: React.SetStateAction<Requisition | null>) => void;
}

interface FormData {
  projectId: string;
  benchmarkingDate: string | number;
  subject: string;
  category: string;
  deliveryDate: string;
  maxDeliveryDate?: string;
  negotiationClosureDate: string;
  typeOfCurrency: string;
  rfqId?: string;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  currentStep,
  nextStep,
  requisitionId,
  projectId,
  requisition,
}) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tenureInDays, setTenureInDays] = useState<number | undefined>(undefined);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  // Check if we're creating a new requisition (no requisitionId means new)
  const isNewRequisition = !requisitionId;

  // Create the schema - will be used for manual validation in onSubmit
  const getSchema = () => step1(tenureInDays);

  const {
    register: _register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // Don't use zodResolver here since tenureInDays can change
    // We'll validate manually in onSubmit
  });

  // Watch all form values for autosave
  const formValues = watch();

  // Autosave hook - enabled for both new and edit requisitions
  // For new requisitions, include projectId in key to separate drafts per project
  const autosaveKey = useMemo(() => {
    if (requisitionId) {
      return `requisition_step1_${requisitionId}`;
    }
    // For new requisitions, use project-specific key if projectId is provided
    const projectKey = projectId?.id || 'new';
    return `requisition_step1_new_project_${projectKey}`;
  }, [requisitionId, projectId?.id]);

  const { lastSaved, isSaving, hasDraft: _hasDraft, clearSaved, loadSaved } = useAutoSave({
    key: autosaveKey,
    data: formValues,
    interval: 2000, // Save 2 seconds after last change
    enabled: isFormReady, // Only enable after form is ready (draft decision made)
  });

  // Check for existing draft on mount and show dialog for new requisitions
  useEffect(() => {
    if (isNewRequisition) {
      const savedDraft = localStorage.getItem(autosaveKey);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          // Only show dialog if draft has meaningful data
          if (parsedDraft && parsedDraft.subject) {
            setShowDraftDialog(true);
            return;
          }
        } catch (e) {
          // Invalid draft, clear it
          localStorage.removeItem(autosaveKey);
        }
      }
      // No valid draft, form is ready
      setIsFormReady(true);
    } else {
      // Edit mode - form is ready immediately
      setIsFormReady(true);
    }
  }, [isNewRequisition, autosaveKey]);

  // Function to restore draft
  const restoreDraft = () => {
    const savedData = loadSaved();
    if (savedData) {
      reset(savedData);
      toast.success("Draft restored successfully");
    }
    setShowDraftDialog(false);
    setIsFormReady(true);
  };

  // Function to discard draft and start fresh
  const discardDraft = () => {
    clearSaved();
    // Reset form to clean state with only projectId pre-filled
    reset({
      projectId: projectId?.id || "",
      benchmarkingDate: "",
      subject: "",
      category: "",
      deliveryDate: "",
      maxDeliveryDate: "",
      negotiationClosureDate: "",
      typeOfCurrency: "",
    });
    setShowDraftDialog(false);
    setIsFormReady(true);
  };

  // Backend autosave - periodically save to server for edit mode
  const backendAutosaveRef = useRef<NodeJS.Timeout | null>(null);
  const lastBackendSaveRef = useRef<string>("");

  const saveToBackend = useCallback(async (data: FormData) => {
    if (!requisitionId) return; // Only save to backend when editing

    try {
      const cleanData = {
        subject: data.subject,
        category: data.category,
        deliveryDate: data.deliveryDate,
        maxDeliveryDate: data.maxDeliveryDate || null,
        negotiationClosureDate: data.negotiationClosureDate,
        typeOfCurrency: data.typeOfCurrency,
        benchmarkingDate: data.benchmarkingDate,
      };

      await authMultiFormApi.put(`/requisition/update/${requisitionId}`, cleanData);
    } catch (error) {
      // Silent fail for autosave - don't interrupt user
      console.error("Backend autosave failed:", error);
    }
  }, [requisitionId]);

  // Debounced backend autosave effect
  useEffect(() => {
    if (!requisitionId) return; // Only for edit mode

    const currentDataString = JSON.stringify(formValues);
    if (currentDataString === lastBackendSaveRef.current) return;

    // Clear existing timeout
    if (backendAutosaveRef.current) {
      clearTimeout(backendAutosaveRef.current);
    }

    // Set new timeout for backend save (5 seconds after last change)
    backendAutosaveRef.current = setTimeout(() => {
      lastBackendSaveRef.current = currentDataString;
      saveToBackend(formValues);
    }, 5000);

    return () => {
      if (backendAutosaveRef.current) {
        clearTimeout(backendAutosaveRef.current);
      }
    };
  }, [formValues, requisitionId, saveToBackend]);

  useEffect(() => {
    if (projectId) {
      setTenureInDays(projectId.tenureInDays ?? undefined);
    }
    // Only reset form from requisition data if we're editing (not creating new)
    if (requisition || requisitionId) {
      const formData: FormData = {
        projectId: projectId?.id || requisition?.projectId || "",
        benchmarkingDate: requisition?.benchmarkingDate
          ? requisition?.benchmarkingDate?.split("T")[0]
          : "",
        subject: requisition?.subject || "",
        category: requisition?.category || "",
        deliveryDate: requisition?.deliveryDate?.split("T")[0] || "",
        maxDeliveryDate: (requisition?.maxDeliveryDate || requisition?.maximumDeliveryDate)?.split("T")[0] || "",
        negotiationClosureDate:
          requisition?.negotiationClosureDate?.split("T")[0] || "",
        typeOfCurrency: requisition?.typeOfCurrency || "",
        rfqId: requisition?.rfqId,
      };
      reset(formData);
    }
  }, [requisition, projectId, reset, requisitionId]);

  const calculateISTBenchmarkingDate = (daysToAdd: number): Date => {
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    return now;
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    // Clear previous errors
    clearErrors();

    // Validate with the current schema (includes current tenureInDays)
    const schema = getSchema();
    const validationResult = schema.safeParse(data);

    if (!validationResult.success) {
      // Set errors from Zod validation
      validationResult.error.errors.forEach((err) => {
        const path = err.path[0] as keyof FormData;
        if (path) {
          setError(path, { type: "manual", message: err.message });
        }
      });
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      if (!requisitionId) {
        const benchmarkingDate = calculateISTBenchmarkingDate(
          Number(data.benchmarkingDate)
        );
        const deliveryDate = new Date(data.deliveryDate);
        if (new Date(benchmarkingDate) >= deliveryDate) {
          toast.error("Benchmarking date should be less than the delivery date.");
          return;
        }

        // Ensure all values are properly serialized for multipart form data
        // projectId comes either from form selection or from passed projectId prop
        const effectiveProjectId = data.projectId || projectId?.id;

        const payload = {
          subject: data.subject,
          category: data.category,
          projectId: effectiveProjectId,
          deliveryDate: data.deliveryDate, // Already a string in YYYY-MM-DD format
          negotiationClosureDate: data.negotiationClosureDate,
          typeOfCurrency: data.typeOfCurrency,
          benchmarkingDate: benchmarkingDate.toISOString(), // Convert Date to ISO string
          maxDeliveryDate: data.maxDeliveryDate || null,
        };

        console.log("Creating requisition with payload:", payload);

        const response = await authMultiFormApi.post<{ data: { id: string } }>(
          "/requisition/create",
          payload
        );
        navigate(
          `/requisition-management/edit-requisition/${response.data.data.id}`
        );
        toast.success("Created Successfully");
        clearSaved(); // Clear autosaved draft on successful creation
        nextStep();
      } else {
        const deliveryDate = new Date(data.deliveryDate || requisition?.deliveryDate || "");
        const parsedBenchmarkingDate = new Date(
          String(data.benchmarkingDate || requisition?.benchmarkingDate)
        );

        // Extract only the date part for comparison
        const benchmarkingDateOnly = parsedBenchmarkingDate.toISOString().split("T")[0];
        const deliveryDateOnly = deliveryDate.toISOString().split("T")[0];

        if (benchmarkingDateOnly >= deliveryDateOnly) {
          toast.error("Benchmarking date should be less than the delivery date.");
          return; // Stop submission if condition fails
        }

        // Ensure all values are properly serialized for multipart form data
        const payload = {
          subject: data.subject,
          category: data.category,
          deliveryDate: data.deliveryDate,
          negotiationClosureDate: data.negotiationClosureDate,
          typeOfCurrency: data.typeOfCurrency,
          benchmarkingDate: data.benchmarkingDate,
          maxDeliveryDate: data.maxDeliveryDate || null,
        };

        await authMultiFormApi.put(
          `/requisition/update/${requisitionId}`,
          payload
        );
        toast.success("Edited Successfully");
        clearSaved(); // Clear autosaved draft on successful edit
        nextStep();
      }
    } catch (error: any) {
      console.error("Requisition error:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(errorMessage);
    }
  };

  const getProjectId = async (): Promise<void> => {
    try {
      const { data } = await authApi.get<{ data: Project[] }>(`/project/get-all`);
      const formattedOptions = data.data?.map((project) => ({
        ...project,
        label: project.projectName,
        value: String(project.id),
      }));
      setProjects(formattedOptions as Project[] || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch projects";
      console.error(errorMessage);
    }
  };

  useEffect(() => {
    if (projectId === null) {
      getProjectId();
    }
  }, [projectId]);

  useEffect(() => {
    const selectedProjectId = watch("projectId");
    if (selectedProjectId) {
      const selectedProject = projects.find(
        (project) => project.value === selectedProjectId
      );

      if (selectedProject) {
        setTenureInDays(selectedProject.tenureInDays);
      }
    }
  }, [watch("projectId"), projects, watch]);

  // Format projects for FormSelect
  const projectOptions: SelectOption[] = projects.map((project) => ({
    value: project.value || String(project.id),
    label: project.label || project.projectName,
  }));

  // Currency options
  const currencyOptions: SelectOption[] = [
    { value: "INR", label: "INR" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "AUD", label: "AUD" },
  ];

  return (
    <>
      {/* Draft Restore Dialog */}
      {showDraftDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Restore Draft?
            </h3>
            <p className="text-gray-600 mb-4">
              You have an unsaved requisition draft from a previous session. Would you like to restore it or start fresh?
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

      <div className="border-2 rounded p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <p className="font-normal text-[#46403E] py-2">
            Your details will be used for Basic information
          </p>
        </div>
        <AutosaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {requisitionId && (
            <FormInput
              label="RFQ Id"
              name="rfqId"
              placeholder="Enter RFQ Id"
              error={errors.rfqId?.message}
              value={watch("rfqId")?.slice(-12) || ""}
              onChange={(e) => setValue("rfqId", e.target.value)}
              disabled={true}
              className="my-1"
            />
          )}

          <FormInput
            label="Requisition Name"
            name="subject"
            placeholder="Enter Requisition Name"
            type="text"
            value={watch("subject") || ""}
            onChange={(e) => setValue("subject", e.target.value)}
            error={errors.subject?.message}
            required
            className="my-1"
          />

          {projectId === null && (
            <FormSelect
              label="Project"
              name="projectId"
              placeholder="Select Project"
              options={projectOptions}
              value={watch("projectId") || ""}
              onChange={(e) => setValue("projectId", e.target.value)}
              error={errors.projectId?.message}
              required
              className="my-1"
            />
          )}

          <FormInput
            label="Requisition Category"
            name="category"
            placeholder="Enter Requisition Category"
            type="text"
            value={watch("category") || ""}
            onChange={(e) => setValue("category", e.target.value)}
            error={errors.category?.message}
            required
            className="my-1"
          />

          <FormInput
            label="Delivery Date"
            name="deliveryDate"
            type="date"
            value={watch("deliveryDate") || ""}
            onChange={(e) => setValue("deliveryDate", e.target.value)}
            error={errors.deliveryDate?.message}
            required
            className="text-gray-700"
          />

          <FormInput
            label="Maximum Delivery Date"
            name="maxDeliveryDate"
            type="date"
            value={watch("maxDeliveryDate") || ""}
            onChange={(e) => setValue("maxDeliveryDate", e.target.value)}
            error={errors.maxDeliveryDate?.message}
            required
            className="text-gray-700"
          />

          {requisitionId ? (
            <FormInput
              label="Benchmarking days"
              name="benchmarkingDate"
              type="date"
              value={watch("benchmarkingDate") || ""}
              onChange={(e) => setValue("benchmarkingDate", e.target.value)}
              error={errors.benchmarkingDate?.message}
              required
              className="text-gray-700"
            />
          ) : (
            <FormInput
              label="Benchmarking days"
              name="benchmarkingDate"
              type="number"
              placeholder="Enter Benchmarking days"
              value={watch("benchmarkingDate") || ""}
              onChange={(e) => setValue("benchmarkingDate", e.target.value)}
              error={errors.benchmarkingDate?.message}
              required
              className="text-gray-700"
            />
          )}

          <FormInput
            label="Negotiation Closure Date"
            name="negotiationClosureDate"
            type="date"
            value={watch("negotiationClosureDate") || ""}
            onChange={(e) => setValue("negotiationClosureDate", e.target.value)}
            error={errors.negotiationClosureDate?.message}
            required
            className="text-gray-700"
          />

          <FormSelect
            label="Currency"
            name="typeOfCurrency"
            options={currencyOptions}
            value={watch("typeOfCurrency") || ""}
            onChange={(e) => setValue("typeOfCurrency", e.target.value)}
            error={errors.typeOfCurrency?.message}
            required
          />
        </div>
        <div className="mt-4 flex justify-start gap-4">
          <Button
            className="px-4 py-2 !bg-[white] !text-[black] border rounded !w-fit"
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
    </>
  );
};

export default BasicInformation;
