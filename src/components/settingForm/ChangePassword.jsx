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

const ChangePassword = ({ currentStep, nextStep, prevStep, companyId }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema), // Connect zod validation
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await authApi.post("/auth/change-password", {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      toast.success("Password changed successfully!");
      navigate("/user-management");
    } catch (error) {
      console.error("API call failed: ", error);
      toast.error("Failed to change password");
    }
  };

  return (
    <div className="border-2 rounded p-4">
      <h3 className="text-lg font-semibold">Change Password</h3>
      <p className="font-normal text-[#46403E] py-2">
        Your details will be used for Basic information
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField
            label="Old Password"
            name="oldPassword"
            placeholder="Enter Old Password"
            type="password"
            register={register}
            error={errors.oldPassword?.message}
            wholeInputClassName="my-1"
          />

          <InputField
            label="New Password"
            name="newPassword"
            placeholder="Enter New Password"
            type="password"
            register={register}
            error={errors.newPassword}
            wholeInputClassName="my-1"
          />

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Enter Confirm Password"
            type="password"
            register={register}
            error={errors.confirmPassword}
            wholeInputClassName="my-1"
          />
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
            disabled={isSubmitting || currentStep === 4}
            className="px-4 py-2 bg-blue-500 text-white rounded !w-fit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
