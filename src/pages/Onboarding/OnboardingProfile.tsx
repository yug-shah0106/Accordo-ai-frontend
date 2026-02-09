import { useForm } from "react-hook-form";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { authApi } from "../../api";
import { useEffect, useRef, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

interface OnboardingFormData {
  profileData?: {
    name?: string;
    phone?: string;
    email?: string;
    profilePic?: string | null;
  };
  companyData?: any;
}

interface OnboardingProfileProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  companyId?: string | null;
  userId?: string;
  formData?: OnboardingFormData;
  updateFormData?: (data: Partial<OnboardingFormData>) => void;
  clearSaved?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
  prefilledName?: string;
  prefilledEmail?: string;
}

const OnboardingProfile = ({
  currentStep: _currentStep,
  nextStep,
  prevStep: _prevStep,
  companyId: _companyId,
  userId,
  formData: _parentFormData,
  updateFormData,
  clearSaved: _clearSaved,
  onSkip,
  prefilledName,
  prefilledEmail,
}: OnboardingProfileProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: prefilledName || "",
      phone: "",
      email: prefilledEmail || "",
      profilePic: null,
    },
  });

  const watchedValues = watch();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const response = await authApi.get("/user/profile");
        const userData = response.data.data;

        if (userData && isMounted) {
          reset({
            name: userData.name || prefilledName || "",
            phone: userData.phone || "",
            email: userData.email || prefilledEmail || "",
          });

          if (userData.profilePic) {
            setPreview(
              `${import.meta.env.VITE_ASSEST_URL}/uploads/${userData.profilePic}`
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // If no user data, use prefilled values
        if (isMounted && (prefilledName || prefilledEmail)) {
          reset({
            name: prefilledName || "",
            phone: "",
            email: prefilledEmail || "",
          });
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [reset, prefilledName, prefilledEmail]);

  // Sync form data with parent for auto-save
  useEffect(() => {
    if (updateFormData && watchedValues.name) {
      updateFormData({
        profileData: {
          name: watchedValues.name,
          phone: watchedValues.phone,
          email: watchedValues.email,
        },
      });
    }
  }, [watchedValues.name, watchedValues.phone, watchedValues.email, updateFormData]);

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

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("userId", userId || "");
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      if (selectedImage) {
        formData.append("profilePicture", selectedImage);
      }

      await authApi.post("/user/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully");
      nextStep();
    } catch (error) {
      console.error("API call failed: ", error);
      toast.error("Failed to update profile");
    }
  };

  const handleRemoveImage = async () => {
    setIsDeleting(true);
    try {
      await authApi.post("/user/update-profile", {
        userId: userId || "",
        profilePicture: null,
        removeProfilePic: true,
      });

      setPreview(null);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Profile photo removed");
    } catch (error) {
      console.error("Failed to remove profile photo:", error);
      toast.error("Failed to remove profile photo");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome{prefilledName ? `, ${prefilledName.split(" ")[0]}` : ""}!
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Let's start by setting up your profile
        </p>
      </div>

      {/* Profile Photo Section */}
      <div className="flex flex-col items-center mb-8">
        <input
          ref={fileInputRef}
          type="file"
          name="profilePic"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="mb-3">
          {preview ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-gray-200 shadow-sm">
              <img
                src={preview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center shadow-sm">
              <FiUser className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleChangeClick}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <CiEdit className="w-4 h-4" />
            {preview ? "Change" : "Add Photo"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <RiDeleteBin6Line className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Section Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        <p className="text-sm text-gray-600 mt-1">
          Your personal details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Full Name"
            name="name"
            placeholder="Enter your name"
            type="text"
            register={register}
            error={errors.name}
            validation={{ required: validationSchema.name.required }}
            className="text-sm text-gray-900"
          />

          <InputField
            label="Phone Number"
            placeholder="Enter phone number"
            name="phone"
            type="tel"
            register={register}
            error={errors.phone}
            validation={{
              required: validationSchema.phone.required,
              pattern: validationSchema.phone.pattern,
            }}
            className="text-sm text-gray-900"
          />

          <InputField
            label="Email Address"
            name="email"
            placeholder="Enter email address"
            type="email"
            register={register}
            error={errors.email}
            validation={{
              required: validationSchema.email.required,
              pattern: validationSchema.email.pattern,
            }}
            className="text-sm text-gray-900"
            disabled={!!prefilledEmail}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Skip for now
          </button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="!w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[140px] !bg-blue-600 !text-white hover:!bg-blue-700"
          >
            Continue
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          heading="Delete Profile Photo"
          body="Are you sure you want to delete your profile photo?"
          onClose={() => setShowDeleteModal(false)}
          onAction={handleRemoveImage}
          actionText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default OnboardingProfile;
