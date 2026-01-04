import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import DateField from "../DateField";
import Button from "../Button";
import { authApi, authMultiFormApi } from "../../api";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1 } from "../../schema/requisition";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  maximumDeliveryDate?: string;
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
  setRequisition: React.Dispatch<React.SetStateAction<Requisition | null>>;
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(step1(tenureInDays)),
  });

  useEffect(() => {
    if (projectId) {
      setTenureInDays(projectId.tenureInDays ?? undefined);
    }
    const formData: FormData = {
      projectId: projectId?.id || requisition?.projectId || "",
      benchmarkingDate: requisition?.benchmarkingDate
        ? requisition?.benchmarkingDate?.split("T")[0]
        : "",
      subject: requisition?.subject || "",
      category: requisition?.category || "",
      deliveryDate: requisition?.deliveryDate?.split("T")[0] || "",
      maxDeliveryDate: requisition?.maximumDeliveryDate?.split("T")[0] || "",
      negotiationClosureDate:
        requisition?.negotiationClosureDate?.split("T")[0] || "",
      typeOfCurrency: requisition?.typeOfCurrency || "",
      rfqId: requisition?.rfqId,
    };
    reset(formData);
  }, [requisition, projectId, reset]);

  const calculateISTBenchmarkingDate = (daysToAdd: number): Date => {
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    return now;
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
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

        const payload = {
          ...data,
          benchmarkingDate,
          maximum_delivery_date: data.maxDeliveryDate || null,
        };

        const response = await authMultiFormApi.post<{ data: { id: string } }>(
          "/requisition/create",
          payload
        );
        navigate(
          `/requisition-management/edit-requisition/${response.data.data.id}`
        );
        toast.success("Created Successfully");
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

        const payload = {
          ...data,
          maximum_delivery_date: data.maxDeliveryDate || null,
        };

        await authMultiFormApi.put(
          `/requisition/update/${requisitionId}`,
          payload
        );
        toast.success("Edited Successfully");
        nextStep();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
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

  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <p className="font-normal text-[#46403E] py-2">
        Your details will be used for Basic information
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {requisitionId &&
            <InputField
              label="RFQ Id"
              name="rfqId"
              placeholder="Enter RFQ Id"
              error={errors.rfqId}
              register={register}
              value={watch("rfqId")?.slice(-12)}
              disabled={true}
            />
          }

          <InputField
            label="Requisition Name"
            name="subject"
            placeholder="Enter Requisition Name"
            type="text"
            register={register}
            error={errors.subject}
            wholeInputClassName={`my-1`}
          />
          {projectId === null && (
            <SelectField
              label="Project"
              name="projectId"
              placeholder="Select Project"
              options={projects}
              optionKey="label"
              optionValue="value"
              register={register}
              error={errors.projectId}
              wholeInputClassName={`my-1`}
            />
          )}
          {/* <SelectField
            label="Category"
            name="category"
            placeholder="Select Category"
            options={[
              {
                label: "Electronics",
                value: 1,
              },
              {
                label: "Fashion",
                value: 2,
              },
              {
                label: "Grocery",
                value: 3,
              },
            ]}
            register={register}
            error={errors.category}
            wholeInputClassName={`my-1`}
          /> */}
          <InputField
            label="Requisition Category"
            name="category"
            placeholder="Enter Requisition Category"
            type="text"
            register={register}
            error={errors.category}
            wholeInputClassName={`my-1`}
          />

          <DateField
            label="Delivery Date"
            name="deliveryDate"
            register={register}
            value={watch("deliveryDate")}
            error={errors.deliveryDate}
            className="text-gray-700"
          />

          <DateField
            label="Maximum Delivery Date (Optional)"
            name="maxDeliveryDate"
            register={register}
            value={watch("maxDeliveryDate")}
            error={errors.maxDeliveryDate}
            className="text-gray-700"
          />

          {requisitionId ? (
            <DateField
              label="Benchmarking days"
              name="benchmarkingDate"
              register={register}
              value={watch(`benchmarkingDate`)}
              error={errors.benchmarkingDate}
              className="text-gray-700"
            />
          ) : (
            <InputField
              label="Benchmarking days"
              placeholder={"Enter Benchmarking days"}
              name="benchmarkingDate"
              register={register}
              error={errors.benchmarkingDate}
              className="text-gray-700"
            />
          )}

          <DateField
            label="Negotiation Closure Date"
            name="negotiationClosureDate"
            register={register}
            value={watch("negotiationClosureDate")}
            error={errors.negotiationClosureDate}
            className="text-gray-700"
          />

          <SelectField
            label="Currency"
            name="typeOfCurrency"
            register={register}
            value={watch("typeOfCurrency")}
            options={[
              {
                label: "INR",
                value: "INR",
              },
            ] as { label: string; value: string }[]}
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
  );
};

export default BasicInformation;