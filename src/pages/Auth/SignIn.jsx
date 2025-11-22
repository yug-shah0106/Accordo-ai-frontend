import InputField from "../../components/InputField";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../schema/auth";
import toast from "react-hot-toast";
import api from "../../api";
import { tokenStorage } from "../../utils/tokenStorage";

const SignIn = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    console.log(data)
    try {
      const response = await api.post("/auth/login", data);
      if (response?.status === 200 || response?.statusText === "OK") {
        const { accessToken, refreshToken, user } = response.data.data;

        // Store tokens using tokenStorage utility
        tokenStorage.setTokens(accessToken, refreshToken);

        // Store user data and permissions
        localStorage.setItem("%companyId%", user.companyId);
        localStorage.setItem("projectPermission", user?.RolePermission?.project);
        localStorage.setItem("requisitionPermission", user?.RolePermission?.requisition);
        localStorage.setItem("contractPermission", user?.RolePermission?.contract);
        localStorage.setItem("productPermission", user?.RolePermission?.product);
        localStorage.setItem("vendorPermission", user?.RolePermission?.vendor);
        localStorage.setItem("poPermission", user?.RolePermission?.po);
        localStorage.setItem("userPermission", user?.RolePermission?.user);

        console.log(response);

        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="w-full max-w-sm p-6 mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center text-gray-800">Log in</h2>

      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label={"Email"}
          type="text"
          name="email"
          register={register}
          error={errors.email}
          placeholder="name@work.com"
        />
        <InputField
          label={"Password"}
          type="password"
          name="password"
          labelSideComponent={
            <Link
              to="/forgot-password"
              className="text-[.75rem] text-blue-500 hover:underline mt-1 inline-block my-3 ml-auto cursor-pointer"
            >
              Forgot password?
            </Link>
          }
          register={register}
          error={errors.password}
          placeholder="Enter password"
        />

        <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
          Login
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        {/* <div className="flex items-center my-3">
          <div className="flex-1 border-[#000000]/[50%] border"></div>
          <p className="mx-2">Other login options</p>
          <div className="flex-1 border-[#000000]/[50%] border"></div>
        </div> */}
        {/* <div className="bg-[#D3DBFD33]/[20%] py-3 rounded-md text-[#18100E]">
          <p>
            Don’t have an account?{" "}
            <Link to="/sign-up" className="hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default SignIn;
