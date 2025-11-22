import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import DateField from "../DateField";
import Button from "../Button";
import TextareaField from "../TextareaField";
import { authApi, authMultiFormApi } from "../../api";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1 } from "../../schema/requisition";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BasicInformation = ({
  currentStep,
  nextStep,
  requisitionId,
  projectId,
  requisition,
  setRequisition,
}) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tenureInDays, setTenureInDays] = useState(null);
  console.log({ requisition });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(step1(tenureInDays)),
  });
  console.log("Form validation schema - tenureInDays:", tenureInDays);
  console.log(watch("benchmarkingDate"));

  useEffect(() => {
    if (projectId) {
      setTenureInDays(projectId.tenureInDays)
    }
    const formData = {
      projectId: projectId?.id || requisition?.projectId || "",
      benchmarkingDate: requisition.benchmarkingDate
        ? requisition?.benchmarkingDate?.split("T")[0]
        : "",
      subject: requisition?.subject || "",
      category: requisition?.category || "",
      deliveryDate: requisition?.deliveryDate?.split("T")[0],
      maxDeliveryDate: requisition?.maximumDeliveryDate?.split("T")[0] || "",
      negotiationClosureDate:
        requisition?.negotiationClosureDate?.split("T")[0],
      typeOfCurrency: requisition?.typeOfCurrency || "",
      rfqId: requisition?.rfqId,
    };
    console.log("Setting form data:", formData);
    reset(formData);
  }, [requisition, projectId, reset]);

  const calculateISTBenchmarkingDate = (daysToAdd) => {
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    return now;
  };

  const onSubmit = async (data) => {
    console.log("Form data being submitted:", data);
    console.log("Form errors:", errors);
    console.log("Is form valid:", Object.keys(errors).length === 0);

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      console.error("Form validation errors:", errors);
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      if (!requisitionId) {
        const benchmarkingDate = calculateISTBenchmarkingDate(
          data.benchmarkingDate
        );
        console.log({ benchmarkingDate });
        const deliveryDate = new Date(data.deliveryDate);
        console.log({ deliveryDate });
        if (new Date(benchmarkingDate) >= deliveryDate) {
          toast.error("Benchmarking date should be less than the delivery date.")
          return;
        }

        const payload = {
          ...data,
          benchmarkingDate,
          maximum_delivery_date: data.maxDeliveryDate || null,
        };
        console.log("Create payload:", payload);

        const response = await authMultiFormApi.post("/requisition/create", payload);
        console.log("Create response:", response);
        navigate(
          `/requisition-management/edit-requisition/${response.data.data.id}`
        );
        toast.success("Created Successfully");
        nextStep();
      } else {
        const deliveryDate = new Date(data.deliveryDate || requisition?.deliveryDate);
        const parsedBenchmarkingDate = new Date(
          data.benchmarkingDate || requisition?.benchmarkingDate
        );

        // Extract only the date part for comparison
        const benchmarkingDateOnly = parsedBenchmarkingDate.toISOString().split("T")[0];
        const deliveryDateOnly = deliveryDate.toISOString().split("T")[0];

        console.log({ benchmarkingDateOnly });
        console.log({ deliveryDateOnly });

        if (benchmarkingDateOnly >= deliveryDateOnly) {
          toast.error("Benchmarking date should be less than the delivery date.");
          return; // Stop submission if condition fails
        }

        delete data.id;

        const payload = {
          ...data,
          maximum_delivery_date: data.maxDeliveryDate || null,
        };
        console.log("Update payload:", payload);

        const response = await authMultiFormApi.put(
          `/requisition/update/${requisitionId}`,
          payload
        );
        console.log("Update response:", response);
        toast.success("Edited Successfully");
        nextStep();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    }
  };

  const getProjectId = async () => {
    try {
      const data = await authApi.get(`/project/get-all`);
      const formattedOptions = data.data?.data?.map((project) => ({
        label: project.projectName,
        value: project.id,
        tenureInDays: project.tenureInDays,
      }));
      setProjects(formattedOptions);
    } catch (error) {
      console.log(error);
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
        (project) => project.value == selectedProjectId
      );


      if (selectedProject) {
        setTenureInDays(selectedProject.tenureInDays);
      }
    }
  }, [watch("projectId"), projects]);

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
            ]}
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