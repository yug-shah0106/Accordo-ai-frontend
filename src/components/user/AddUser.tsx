import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../api";
import InputField from "../InputField";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import RoleSelectionModal from "./RoleSelection";
import { BiUserCheck } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";

interface CreateUserFormProps {
  onClose?: () => void;
}

const CreateUserForm = ({ onClose }: CreateUserFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [selectedNotifications, setSelectedNotifications] = useState({});
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  const [userRoles, setUserRoles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      profilePic: null,
    },
  });

  const watchFields = watch(["name", "email", "phone", "password"]);

  useEffect(() => {
    const allFieldsFilled = watchFields.every((field) => field?.trim() !== "");
    setIsFormFilled(allFieldsFilled);
  }, [watchFields]);

  const fetchUserData = async (userId) => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/user/get/${userId}`);
      reset({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.UserPassword,
        profilePic: data.profilePic,
      });
      let url = `${import.meta.env.VITE_ASSEST_URL}/uploads/${data.profilePic}`;
      setPreview(url);
    } catch (error) {
      console.error(error.response?.data?.error || "Something went wrong");
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserData(id);
    }
  }, [id]);

  const fetchRoles = async () => {
    try {
      const data = await authApi.get(`/role/get-all`);
      setUserRoles(data.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (formData) => {
    try {
      if (!formData || typeof formData !== "object") {
        toast.error("Form data is missing or invalid.");
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
      data.append("permissions", JSON.stringify(selectedPermissions));
      data.append("notifications", JSON.stringify(selectedNotifications));

      if (!id) {
        await authApi.post("/user/create", data);
        toast.success("User created successfully");
      } else {
        data.delete("id");
        data.append("userId", id);
        await authApi.post("/user/update-profile", data);
        toast.success("User updated successfully");
      }

      navigate("/user-management");
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoArrowBackOutline className="text-2xl text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <BiUserCheck className="text-2xl text-blue-500" />
              <h1 className="text-2xl font-semibold text-gray-800">
                {id ? "Edit User" : "Create New User"}
              </h1>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  name="name"
                  placeholder="Enter full name"
                  type="text"
                  register={register}
                  error={errors.name}
                  icon={<BiUserCheck className="text-gray-400" />}
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
                <InputField
                  label="Phone Number"
                  name="phone"
                  placeholder="Enter phone number"
                  type="tel"
                  register={register}
                  error={errors.phone}
                  className="text-sm text-gray-900"
                />
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

              {/* Role Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="">Select a role</option>
                    {userRoles.map((role) => (
                      <option
                        key={role.id}
                        value={role.id}
                        className="py-2 text-sm text-gray-900"
                      >
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex justify-end gap-4">
                <Button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  type="button"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                  disabled={isSubmitting}
                >
                  <FaPlus className="text-sm" />
                  {id ? "Update User" : "Create User"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
