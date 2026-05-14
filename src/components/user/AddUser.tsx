import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../api";
import InputField from "../InputField";
import Button from "../Button";
import toast from "react-hot-toast";
import { BiUserCheck } from "react-icons/bi";
import { env } from "@/utils/env";
import { normalizeViteEnvUrl } from "@/utils/normalizeViteBackendUrl";
import logger from "../../utils/logger";

interface Role {
  id: number;
  name: string;
}

interface CreateUserFormProps {
  onClose?: () => void;
}

const CreateUserForm = ({ onClose: _onClose }: CreateUserFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [_preview, setPreview] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("admin");
  const [selectedApprovalLevel, setSelectedApprovalLevel] = useState("NONE");
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch: _watch,
    formState: { errors, isSubmitting, isValid: _isValid },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      profilePic: null,
    },
    mode: "onChange",
  });

  const fetchUserData = async (userId: string) => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/user/${userId}`);
      reset({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.UserPassword,
        profilePic: data.profilePic,
      });
      // Set the user's current role, userType, and approvalLevel
      if (data.roleId) {
        setSelectedRole(String(data.roleId));
      }
      if (data.userType) {
        setSelectedUserType(data.userType);
      }
      if (data.approvalLevel) {
        setSelectedApprovalLevel(data.approvalLevel);
      }
      if (data.profilePic) {
        const url = `${normalizeViteEnvUrl(env("VITE_ASSEST_URL") || "")}/uploads/${data.profilePic}`;
        setPreview(url);
      }
    } catch (error: any) {
      logger.error(error.response?.data?.error || "Something went wrong");
      toast.error("Failed to load user data");
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await authApi.get(`/role/`);
      const roles = response.data.data || [];
      const filtered = roles.filter((role: Role) => {
        const name = (role.name || "").toLowerCase().trim();
        return name !== "super admin";
      });
      setUserRoles(filtered);
    } catch (error: any) {
      logger.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (id) {
      fetchUserData(id);
    }
  }, [id]);

  const onSubmit = async (formData: any) => {
    try {
      if (!formData || typeof formData !== "object") {
        toast.error("Form data is missing or invalid.");
        return;
      }

      if (!selectedRole) {
        toast.error("Please select a role");
        return;
      }

      const { profilePic } = formData;

      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === "profilePic" && profilePic && profilePic.length > 0) {
            data.append(key, profilePic[0]);
          } else if (key !== "profilePic") {
            data.append(key, formData[key]);
          }
        }
      }
      data.append("roleId", selectedRole);
      data.append("userType", selectedUserType);
      data.append("approvalLevel", selectedApprovalLevel);

      if (!id) {
        await authApi.post("/user/", data);
        toast.success("User created successfully");
      } else {
        data.delete("id");
        data.append("userId", id);
        await authApi.post("/user/update-profile", data);
        toast.success("User updated successfully");
      }

      navigate("/user-management");
    } catch (error: any) {
      logger.error("Error during form submission:", error);
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-dark-bg">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border pt-6 px-6 pb-4 flex-shrink-0 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <IoArrowBackOutline className="text-2xl text-gray-600 dark:text-dark-text-secondary" />
            </button>
            <div className="flex items-center gap-2">
              <BiUserCheck className="text-2xl text-blue-500" />
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-dark-text">
                {id ? "Edit User" : "Create New User"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm">
            <form
              onSubmit={handleSubmit(onSubmit)}
              encType="multipart/form-data"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Row 1: Full Name + Email */}
                  <InputField
                    label="Full Name"
                    name="name"
                    placeholder="Enter full name"
                    type="text"
                    register={register}
                    error={errors.name}
                    className="text-sm text-gray-900"
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    placeholder="Enter email address"
                    type="email"
                    register={register}
                    error={errors.email}
                    className="text-sm text-gray-900"
                  />

                  {/* Row 2: Phone Number + User Role */}
                  <InputField
                    label="Phone Number"
                    name="phone"
                    placeholder="Enter phone number"
                    type="tel"
                    register={register}
                    error={errors.phone}
                    className="text-sm text-gray-900"
                  />
                  <div className="my-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={rolesLoading}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {rolesLoading ? "Loading roles..." : "Select a role"}
                        </option>
                        {userRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        {rolesLoading ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    {userRoles.length === 0 && !rolesLoading && (
                      <p className="mt-1 text-sm text-red-500">
                        No roles available. Please contact administrator.
                      </p>
                    )}
                  </div>

                  {/* Row 3: User Type + Approval Level */}
                  <div className="my-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedUserType}
                        onChange={(e) => setSelectedUserType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="admin">Admin</option>
                        <option value="procurement">Procurement</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="my-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Level
                    </label>
                    <div className="relative">
                      <select
                        value={selectedApprovalLevel}
                        onChange={(e) =>
                          setSelectedApprovalLevel(e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="NONE">None</option>
                        <option value="L1">Level 1</option>
                        <option value="L2">Level 2</option>
                        <option value="L3">Level 3</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Password field (only for create mode) */}
                  {!id && (
                    <InputField
                      label="Password"
                      name="password"
                      placeholder="Enter password"
                      type="password"
                      register={register}
                      error={errors.password}
                      className="text-sm text-gray-900"
                    />
                  )}
                </div>
              </div>

              {/* Form Actions - Matching Project Form Style */}
              <div className="flex justify-end gap-4 p-6 bg-gray-50 dark:bg-dark-bg/50 border-t border-gray-200 dark:border-dark-border rounded-b-lg">
                <Button
                  type="button"
                  className="!w-auto px-6 py-3 !bg-white border-2 border-gray-400 !text-gray-800 hover:!bg-gray-100 hover:border-gray-500 hover:!text-gray-900 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedRole}
                  className={`!w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center shadow-sm hover:shadow-md active:shadow-inner
                    ${
                      isSubmitting || !selectedRole
                        ? "!bg-[#f3f4f6] !text-[#9ca3af] cursor-not-allowed shadow-none"
                        : "!bg-[#2563eb] !text-white hover:!bg-[#1d4ed8] active:!bg-[#1e40af]"
                    }`}
                  loading={isSubmitting}
                >
                  {id ? "Update User" : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;