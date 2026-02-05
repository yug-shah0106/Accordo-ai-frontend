import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import Button from "../Button";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import toast from "react-hot-toast";
import { z } from "zod";

const validationSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[@$!%*?&#]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

interface ChangePasswordProps {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  companyId?: string | null;
  company?: any;
  onSuccess?: () => void;
}

const ChangePassword = ({
  currentStep,
  nextStep,
  prevStep,
  companyId,
  onSuccess,
}: ChangePasswordProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await authApi.post("/auth/change-password", {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      // Clear auto-saved draft on success
      if (onSuccess) {
        onSuccess();
      }

      toast.success("Password changed successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("API call failed: ", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="p-6">
      {/* Section Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <p className="text-sm text-gray-600 mt-1">
          Update your password to keep your account secure
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Current Password"
            name="oldPassword"
            placeholder="Enter current password"
            type="password"
            register={register}
            error={errors.oldPassword?.message}
            className="text-sm text-gray-900"
          />

          <div className="hidden md:block" /> {/* Spacer for grid alignment */}

          <InputField
            label="New Password"
            name="newPassword"
            placeholder="Enter new password"
            type="password"
            register={register}
            error={errors.newPassword?.message}
            className="text-sm text-gray-900"
          />

          <InputField
            label="Confirm New Password"
            name="confirmPassword"
            placeholder="Confirm new password"
            type="password"
            register={register}
            error={errors.confirmPassword?.message}
            className="text-sm text-gray-900"
          />
        </div>

        {/* Password Requirements */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              One uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              One number
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              One special character (@$!%*?&#)
            </li>
          </ul>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <Button
            type="button"
            className="!w-auto px-6 py-3 !bg-white border-2 border-gray-300 !text-gray-700 hover:!bg-gray-50 hover:border-gray-400 rounded-lg font-medium transition-all duration-200 min-w-[100px]"
            onClick={() => prevStep()}
            disabled={isSubmitting}
          >
            Previous
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className={`!w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[140px]
              ${isSubmitting
                ? '!bg-gray-300 !text-gray-500 cursor-not-allowed'
                : '!bg-blue-600 !text-white hover:!bg-blue-700'
              }`}
          >
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
