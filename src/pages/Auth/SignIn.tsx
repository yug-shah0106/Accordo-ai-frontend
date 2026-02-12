import InputField from "../../components/InputField";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../schema/auth";
import toast from "react-hot-toast";
import api from "../../api";
import { tokenStorage } from "../../utils/tokenStorage";

interface LoginFormData {
  email: string;
  password: string;
}

interface RolePermission {
  project?: string;
  requisition?: string;
  contract?: string;
  product?: string;
  vendor?: string;
  po?: string;
  user?: string;
}

interface User {
  companyId: number;
  RolePermission?: RolePermission;
}

interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export default function SignIn() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    console.log(data)
    try {
      const response = await api.post<LoginResponse>("/auth/login", data);
      if (response?.status === 200 || response?.statusText === "OK") {
        const { accessToken, refreshToken, user } = response.data.data;

        // Store tokens using tokenStorage utility
        tokenStorage.setTokens(accessToken, refreshToken);

        // Store user data and permissions
        localStorage.setItem("%companyId%", String(user.companyId));
        localStorage.setItem("projectPermission", user?.RolePermission?.project || "");
        localStorage.setItem("requisitionPermission", user?.RolePermission?.requisition || "");
        localStorage.setItem("contractPermission", user?.RolePermission?.contract || "");
        localStorage.setItem("productPermission", user?.RolePermission?.product || "");
        localStorage.setItem("vendorPermission", user?.RolePermission?.vendor || "");
        localStorage.setItem("poPermission", user?.RolePermission?.po || "");
        localStorage.setItem("userPermission", user?.RolePermission?.user || "");

        console.log(response);

        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-sm px-6 py-4 mx-auto">
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
        {/* <div className="bg-[#D3DBFD33]/[20%] pt-3 pb-0 rounded-md text-[#18100E]">
          <p>
            Don't have an account?{" "}
            <Link to="/sign-up" className="hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}
