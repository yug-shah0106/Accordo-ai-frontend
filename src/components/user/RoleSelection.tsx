import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Button from "../Button";
import { authApi } from "../../api";

const RoleSelectionModal = ({ onClose,edit_role }) => {
    const [roleName, setRoleName] = useState("");
    const [selectedModules, setSelectedModules] = useState({});
    const [selectedPermissions, setSelectedPermissions] = useState({});
    const [selectedOption, setSelectedOption] = useState('');
    const [given_permissions,setGiven_permissions]=useState([0,0,0,0,0])
    



    const ENUM={
        0:'NONE',
        1:'READ ONLY',
        2:'READ&UPDATE',
        3:'ALL',
    }

    useEffect(()=>{
        if(edit_role){
            setRoleName(edit_role?.name)
            setGiven_permissions(edit_role?.permissions)
        }
    },[])
    

    // Dummy Module Data
    const modules = [
        {
            id: "1",
            name: "Project Details",
            permissions: [
                0,1,2,3,
            ],
        },
        {
            id: "2",
            name: "User Management",
            permissions: [
                0,1,2,3,
            ],
        },
        {
            id: "3",
            name: "Requisition Management",
            permissions: [
                0,1,2,3,
            ],
        },
        {
            id: "4",
            name: "Product Management",
            permissions: [
                0,1,2,3,
            ],permissions: [
                0,1,2,3,
            ],
        },
        {
            id: "5",
            name: "Vendor Management",
            permissions: [
                0,1,2,3,
            ],
        },
    ];


    const choosenPermission=(permission,moduleId)=>{
        setSelectedOption(permission)
        setSelectedModules(moduleId)
    }

    // Handle Module Selection
    const handleModuleChange = (moduleId) => {
        setSelectedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));

        // Reset permissions if unselected
        if (selectedModules[moduleId]) {
            setSelectedPermissions((prev) => ({
                ...prev,
                [moduleId]: [],
            }));
        }
    };

    // Handle Permission Change
    const handlePermissionChange = ( permission,moduleId) => {
        setGiven_permissions(prev=>{
            prev[moduleId-1]=permission
            return [...prev]
        })
    };

    // Submit Handler
    const handleSubmit = async() => {
         let result=await authApi.post("/role/create", {
            name:roleName,
            permissions:given_permissions,
          });
    };

    const handleEdit=async()=>{
        let result=await authApi.put(`/role/update/${edit_role?.id}`, {
            name:roleName,
            permissions:given_permissions,
          });
    }



    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[700px] rounded-lg shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Add Project Level Role</h2>
                    <IoClose className="text-2xl cursor-pointer" onClick={onClose} />
                </div>

                <div className="p-6 max-h-[500px] overflow-y-auto">
                    <div className="mb-6">
                        <label className="text-sm font-medium">Role Name *</label>
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="Enter role name"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Module Level Permissions */}
                    <h3 className="text-sm font-bold mb-4">Role Permissions</h3>
                    <div className="space-y-6">
                        {modules.map((module) => (
                            <div
                                key={module.id}
                                className={`border rounded-lg p-4 shadow-sm ${selectedModules[module.id]
                                        ? "bg-gray-50"
                                        : "bg-gray-100 opacity-70"
                                    }`}
                            >
                                {/* Module Name */}
                                <div className="flex items-center gap-2 mb-4">
                                    {/* <input
                                        type="checkbox"
                                        checked={!!selectedModules[module.id]}
                                        onChange={() => handleModuleChange(module.id)}
                                        className="cursor-pointer"
                                    /> */}
                                    <h3 className="text-md font-semibold">{module.name}</h3>
                                </div>

                                {/* Permissions */}
                                <h4 className="text-sm font-medium mt-2">Permissions</h4>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {module.permissions.map((permission, index) => (
                                        <label
                                            key={index}
                                            onChange={()=>handlePermissionChange(permission,module.id)}
                                            className={`flex items-center gap-2 cursor-pointer `}
                                         >
                                            
                                            <input
                                                type="radio"
                                                value={permission}
                                                checked={given_permissions[module.id-1]===permission} 

                                            />
                                            <span className="text-sm">{ENUM[permission]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 p-4 border-t">
                    <Button
                        className="bg-gray-10 text-gray-700 px-4 py-2 rounded-md"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={`px-4 py-2 rounded-md ${roleName
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        onClick={edit_role ? handleEdit : handleSubmit}
                        disabled={!roleName}
                    >
                        {edit_role ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
