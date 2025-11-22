import React, { useState, useEffect } from "react";
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
import { BsPlusCircleFill } from "react-icons/bs";
import toast from "react-hot-toast";
import img from "../../assets/defaultImage.png";
import { FiX } from "react-icons/fi";

const CreateProjectForm = ({ onSave, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = Number(localStorage.getItem("%companyId%"));

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

  const { data, loading, error } = useFetchData("/customer/get-all");

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
    } catch (error) {
      console.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

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
        toast.success("Project created successfully");
        navigate("/project-management");
      } else {
        delete data.id;
        const response = await authApi.put(`/project/update/${id}`, data);
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
    <div className="w-full h-full mx-auto bg-white p-16 rounded-md">
      <h2 className="flex items-center gap-2 text-xl font-medium mb-3">
        <IoArrowBackOutline
          onClick={() => {
            navigate(-1);
          }}
          className="cursor-pointer"
        />
        {id ? "Edit Project" : "Create Project"}
      </h2>

      <div className="rounded-md mt-5">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6 p-6">
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

          <div className="flex items-center gap-2 px-6 mb-4">
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
                className="px-4 py-2.5 bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[90px] justify-center shadow-sm hover:shadow-md active:shadow-inner" 
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
            <div className="px-6 text-red-500 text-sm mb-4">
              {errors.pointOfContact.message}
            </div>
          )}

          {Array.isArray(watch("pointOfContact")) &&
            watch("pointOfContact")?.length > 0 && (
              <div className="flex flex-wrap gap-4 px-6">
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

          <div className="flex justify-end gap-4 px-6 mt-8">
            <Button
              type="button"
              className="px-6 py-3 bg-white border-2 border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6] hover:border-[#d1d5db] rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center shadow-sm hover:shadow-md active:shadow-inner"
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

