import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Button from "../Button";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import { useEffect, useRef, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";

const UpdateProfile = ({
  currentStep,
  nextStep,
  prevStep,
  companyId,
  company,
  userId,
}) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authApi.get(`/user/profile`);
        console.log({ response });

        const userData = response.data.data;

        if (userData) {
          reset({
            name: userData.name || "",
            phone: userData.phone || "",
            email: userData.email || "",
          });

          if (userData.profilePic) {
            setPreview(
              `${import.meta.env.VITE_ASSEST_URL}/uploads/${
                userData.profilePic
              }`
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [userId, reset]);

  const validationSchema = {
    name: {
      required: "Name is required",
    },
    phone: {
      required: "Phone number is required",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Phone number must be 10 digits",
      },
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        message: "Please enter a valid email address",
      },
    },
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      if (selectedImage) {
        formData.append("profilePicture", selectedImage);
      }

      const response = await authApi.post("/user/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response from API: ", response.data);
      nextStep();
    } catch (error) {
      console.error("API call failed: ", error);
    }
  };

  const fileInputRef = useRef(null);
  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">Basic Information {companyId}</h3>
      <p className="font-normal text-[#46403E] py-2">
        Your details will be used for Basic information
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField
            label="Name"
            name="name"
            placeholder="Enter Name"
            type="text"
            register={register}
            error={errors.name}
            validation={{ required: validationSchema.name.required }}
            wholeInputClassName="my-1"
          />

          <InputField
            label="Phone No"
            placeholder={"+91"}
            name="phone"
            type="number"
            register={register}
            error={errors.phone}
            validation={{
              required: validationSchema.phone.required,
              pattern: validationSchema.phone.pattern,
            }}
            className="text-gray-700"
          />

          <InputField
            label="Email"
            name="email"
            placeholder="Enter Email"
            type="email"
            register={register}
            error={errors.email}
            validation={{
              required: validationSchema.email.required,
              pattern: validationSchema.email.pattern,
            }}
            wholeInputClassName="my-1"
          />
          <div className="">
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo
              </label>
              <input
                name="profilePic"
                type="file"
                {...register("profilePic")}
                accept="image/*"
                onChange={handleImageUpload}
                className="block text-sm text-gray-700 border w-full border-gray-300 rounded shadow-sm file:border-0 file:px-3 file:py-2.5"
              />

              {errors.profilePic && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.profilePic.message}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col border rounded-3xl justify-center">
              {preview && (
                <div className="flex justify-center p-6">
                  <div className="relative w-32 h-32 rounded overflow-hidden">
                    <img
                      src={preview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-evenly rounded-b-3xl bg-gray-500 p-2">
                <label className="flex items-center gap-1 text-white cursor-pointer">
                  <CiEdit />
                  Edit
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1 text-white"
                >
                  <RiDeleteBin6Line />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-start gap-4">
          <Button
            className="px-4 py-2 !bg-[white] !text-[black] border rounded !w-fit"
            type="button"
            onClick={() => prevStep()}
            disabled={isSubmitting || currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || currentStep === 3}
            className="px-4 py-2 bg-blue-500 text-white rounded !w-fit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
