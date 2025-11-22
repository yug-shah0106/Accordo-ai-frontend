import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../../components/InputField";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import { forgotPasswordSchema } from "../../schema/auth";
import toast from "react-hot-toast";
import api from "../../api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/auth/forgot-password", data);

      navigate("/verifyOtp", {
        state: {
          email: data.email,
          reqUrl: "/auth/verify-otp",
          redirectUrl: "/reset-password",
          resendReq: "/auth/forgot-password",
        },
      });
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };
  return (
    <div className="w-full max-w-sm p-6 mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Forgot Password
      </h2>

      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label={"Email"}
          type="text"
          name="email"
          register={register}
          error={errors.email}
          placeholder="name@work.com"
        />

        <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
          Reset Password
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <div className="bg-[#D3DBFD33]/[20%] py-3 rounded-md text-[#18100E]">
          <p>
            or?{" "}
            <Link to="/sign-in" className="hover:underline font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
