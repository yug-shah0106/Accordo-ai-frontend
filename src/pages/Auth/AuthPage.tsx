import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import api from "../../api";
import { tokenStorage } from "../../utils/tokenStorage";
import { loginSchema, RegisterSchema } from "../../schema/auth";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Checkbox from "../../components/CheckBox";
import Modal from "../../components/Modal";

type TabType = "login" | "signup";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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

export default function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [terms, setTerms] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const openModal = (): void => {
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  const handleClose = (): void => {
    setIsModalOpen(false);
    setTerms(false);
  };

  const handleAction = (): void => {
    setTerms(true);
    setIsModalOpen(false);
  };

  const onLoginSubmit = async (data: LoginFormData): Promise<void> => {
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

        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Something went wrong");
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      if (!terms) {
        toast.error("Please accept the terms and conditions");
        return;
      }
      const { confirmPassword, ...registerData } = data;

      // Register the user
      await api.post("/auth/register", registerData);

      // Auto-login after registration
      const loginResponse = await api.post<LoginResponse>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (loginResponse?.status === 200 || loginResponse?.statusText === "OK") {
        const { accessToken, refreshToken, user } = loginResponse.data.data;

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

        toast.success("Welcome to Accordo! Let's set up your profile.");

        // Redirect to onboarding with pre-filled data
        navigate("/onboarding", {
          state: {
            name: data.name,
            email: data.email,
          },
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Reset forms when switching tabs
    if (tab === "login") {
      registerForm.reset();
      setTerms(false);
    } else {
      loginForm.reset();
    }
  };

  return (
    <div className="w-full max-w-sm px-6 py-4 mx-auto">
      {/* Pill/Button Tabs */}
      <div className="flex bg-gray-100 rounded-full p-1 mb-6">
        <button
          type="button"
          onClick={() => handleTabChange("login")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all duration-200 ${
            activeTab === "login"
              ? "bg-[#234BF3] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("signup")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all duration-200 ${
            activeTab === "signup"
              ? "bg-[#234BF3] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Login Form */}
      {activeTab === "login" && (
        <form className="mt-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
          <InputField
            label={"Email"}
            type="text"
            name="email"
            register={loginForm.register}
            error={loginForm.formState.errors.email}
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
            register={loginForm.register}
            error={loginForm.formState.errors.password}
            placeholder="Enter password"
          />

          <Button
            type="submit"
            disabled={loginForm.formState.isSubmitting}
            loading={loginForm.formState.isSubmitting}
          >
            Login
          </Button>
        </form>
      )}

      {/* Sign Up Form */}
      {activeTab === "signup" && (
        <form className="mt-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
          <InputField
            label={"Name"}
            type="text"
            name="name"
            register={registerForm.register}
            error={registerForm.formState.errors.name}
            placeholder="Full Name"
          />
          <InputField
            label={"Email"}
            type="text"
            name="email"
            register={registerForm.register}
            error={registerForm.formState.errors.email}
            placeholder="name@work.com"
          />
          <InputField
            label={"Password"}
            type="password"
            name="password"
            register={registerForm.register}
            error={registerForm.formState.errors.password}
            placeholder="Enter password"
          />
          <InputField
            label={"Confirm Password"}
            type="password"
            name="confirmPassword"
            register={registerForm.register}
            error={registerForm.formState.errors.confirmPassword}
            placeholder="Enter password"
          />
          <div className="flex items-center gap-4 my-2 w-full mt-2">
            <Checkbox
              name="terms"
              checked={
                registerForm.formState.isSubmitting || Object.keys(registerForm.formState.errors)?.length > 0
                  ? false
                  : terms
              }
              onChange={(evnt) => {
                setTerms(evnt.target.checked);
              }}
              disabled={registerForm.formState.isSubmitting || Object.keys(registerForm.formState.errors)?.length > 0}
            />
            <p
              onClick={() => openModal()}
              className="text-gray-700 cursor-pointer flex-1"
            >
              I agree to{" "}
              <span className="font-bold text-[#000] cursor-pointer">
                Terms of Use
              </span>{" "}
              and{" "}
              <span className="font-bold text-[#000] cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>

          <Button
            type="submit"
            disabled={registerForm.formState.isSubmitting}
            loading={registerForm.formState.isSubmitting}
          >
            Sign Up
          </Button>
        </form>
      )}

      {isModalOpen && (
        <Modal
          heading="Terms and Conditions"
          body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          onClose={closeModal}
          handleClose={handleClose}
          onAction={handleAction}
          actionText="Accept"
        />
      )}
    </div>
  );
}
