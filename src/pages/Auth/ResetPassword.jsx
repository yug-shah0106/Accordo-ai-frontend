import InputField from "../../components/InputField";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../../schema/auth";
import toast from "react-hot-toast";
import api from "../../api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      delete data.confirmPassword;
      const response = await api.put(`/auth/reset-password/${id}`, data);
      toast.success("Password reset successfully")
      navigate("/sign-in");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };
  return (
    <div className="w-full max-w-sm p-6 mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Reset Password
      </h2>

      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label={"Password"}
          type="password"
          name="password"
          register={register}
          error={errors.password}
          placeholder="Enter password"
        />
        <InputField
          label={"Confirm Password"}
          type="password"
          name="confirmPassword"
          register={register}
          error={errors.password}
          placeholder="Enter password"
        />

        <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
          Submit
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
