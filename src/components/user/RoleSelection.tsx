import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Button from "../Button";
import { authApi } from "../../api";
import toast from "react-hot-toast";

interface RoleSelectionModalProps {
  onClose: () => void;
  edit_role?: {
    id: number;
    name: string;
    permissions?: number[];
  } | null;
  onSuccess?: () => void;
}

const RoleSelectionModal = ({ onClose, edit_role, onSuccess }: RoleSelectionModalProps) => {
  const [roleName, setRoleName] = useState("");
  const [_selectedModules, _setSelectedModules] = useState<Record<string, boolean>>({});
  const [_selectedPermissions, _setSelectedPermissions] = useState<Record<string, number[]>>({});
  const [given_permissions, setGiven_permissions] = useState([0, 0, 0, 0, 0, 0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ENUM: Record<number, string> = {
    0: 'NONE',
    1: 'READ ONLY',
    3: 'READ & UPDATE',
    7: 'READ, UPDATE & WRITE',
    15: 'FULL ACCESS',
  };

  const permissionValues = [0, 1, 3, 7, 15];

  useEffect(() => {
    if (edit_role) {
      setRoleName(edit_role?.name || "");
      if (edit_role?.permissions && edit_role.permissions.length > 0) {
        setGiven_permissions(edit_role.permissions);
      }
    }
  }, [edit_role]);

  // Module Data matching backend modules
  const modules = [
    {
      id: "1",
      name: "Dashboard",
      permissions: permissionValues,
    },
    {
      id: "2",
      name: "User Management",
      permissions: permissionValues,
    },
    {
      id: "3",
      name: "Projects",
      permissions: permissionValues,
    },
    {
      id: "4",
      name: "Requisitions",
      permissions: permissionValues,
    },
    {
      id: "5",
      name: "Vendors",
      permissions: permissionValues,
    },
    {
      id: "6",
      name: "Approvals",
      permissions: permissionValues,
    },
  ];

  // Handle Permission Change
  const handlePermissionChange = (permission: number, moduleId: string) => {
    const index = parseInt(moduleId) - 1;
    setGiven_permissions(prev => {
      const newPermissions = [...prev];
      newPermissions[index] = permission;
      return newPermissions;
    });
  };

  // Submit Handler for Create
  const handleSubmit = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.post("/role/create", {
        name: roleName.trim(),
        permissions: given_permissions,
      });

      if (response.status === 201) {
        toast.success("Role created successfully");
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (error: any) {
      console.error("Error creating role:", error);
      toast.error(error.response?.data?.error || "Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler for Update
  const handleEdit = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    if (!edit_role?.id) {
      toast.error("Invalid role");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.put(`/role/update/${edit_role.id}`, {
        name: roleName.trim(),
        permissions: given_permissions,
      });

      if (response.status === 201) {
        toast.success("Role updated successfully");
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data?.error || "Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] rounded-lg shadow-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold">
            {edit_role ? "Edit Role" : "Create New Role"}
          </h2>
          <IoClose
            className="text-2xl cursor-pointer hover:text-gray-600 transition-colors"
            onClick={onClose}
          />
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Module Level Permissions */}
          <h3 className="text-sm font-bold mb-4 text-gray-700">Module Permissions</h3>
          <div className="space-y-4">
            {modules.map((module) => (
              <div
                key={module.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                {/* Module Name */}
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  {module.name}
                </h3>

                {/* Permissions */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {module.permissions.map((permission) => (
                    <label
                      key={permission}
                      className={`flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors ${
                        given_permissions[parseInt(module.id) - 1] === permission
                          ? "bg-blue-100 border border-blue-300"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`permission-${module.id}`}
                        value={permission}
                        checked={given_permissions[parseInt(module.id) - 1] === permission}
                        onChange={() => handlePermissionChange(permission, module.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {ENUM[permission]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
          <Button
            type="button"
            className="!w-auto px-6 py-3 !bg-white border-2 border-gray-400 !text-gray-800 hover:!bg-gray-100 hover:border-gray-500 hover:!text-gray-900 rounded-lg font-medium transition-all duration-200 min-w-[100px]"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={`!w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[100px]
              ${!roleName.trim() || isSubmitting
                ? '!bg-gray-300 !text-gray-500 cursor-not-allowed'
                : '!bg-[#2563eb] !text-white hover:!bg-[#1d4ed8]'
              }`}
            onClick={edit_role ? handleEdit : handleSubmit}
            disabled={!roleName.trim() || isSubmitting}
            loading={isSubmitting}
          >
            {edit_role ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
