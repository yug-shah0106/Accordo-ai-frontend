import { useState, useEffect } from "react";
import Table from "../Table";
import { PiDotsThreeBold, PiPlusSquareBold } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";
import RoleSelectionModal from "../user/RoleSelection";
import { authApi } from "../../api";
import { Menu, MenuItem } from "@mui/material";
import { VscEdit } from "react-icons/vsc";
import { RiDeleteBin5Line } from "react-icons/ri";
import { format } from "date-fns";
import { IoArrowBackOutline } from "react-icons/io5";

function Roles() {
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRow, setSelectedRow] = useState({ element: null, user: null });
  const [edit_role, setEditRole] = useState(null);

  const columns = [
    {
      header: "Sr No",
      accessor: "index",
      width: "80px",
    },
    {
      header: "Role Name",
      accessor: "name",
      width: "200px",
    },
    {
      header: "Created By",
      accessor: "Creator",
      width: "200px",
      Cell: ({ value }) => value?.name || "N/A",
    },
    {
      header: "Last Updated",
      accessor: "updatedAt",
      width: "200px",
      Cell: ({ value }) => format(new Date(value), "MMM dd, yyyy HH:mm"),
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "100px",
    },
  ];

  const getAllRoles = async () => {
    try {
      const response = await authApi.get(`/role/get-all`);
      if (response.status === 201) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    getAllRoles();
  }, []);

  const handleDelete = async (deleteId) => {
    try {
      const result = await authApi.delete(`/role/delete/${deleteId}`);
      if (result.status === 201) {
        getAllRoles();
      }
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const handleEdit = (user) => {
    setEditRole(user);
    setIsRoleModalOpen(true);
  };

  const tableData = roles.map((role, index) => ({
    ...role,
    index: index + 1,
    actions: (
      <div className="relative">
        <PiDotsThreeBold 
          className="text-xl cursor-pointer hover:text-blue-500 transition-colors" 
          onClick={(event) => setSelectedRow({ element: event.currentTarget, user: role })}
        />
        <Menu
          anchorEl={selectedRow.element}
          open={Boolean(selectedRow.element) && selectedRow.user?.id === role.id}
          onClose={() => setSelectedRow({ element: null, user: null })}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            elevation: 2,
            sx: {
              mt: 1,
              minWidth: "150px",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleEdit(selectedRow.user);
              setSelectedRow({ element: null, user: null });
            }}
            className="flex items-center gap-2 text-gray-700 hover:bg-blue-50"
          >
            <VscEdit className="text-blue-500" /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDelete(selectedRow.user.id);
              setSelectedRow({ element: null, user: null });
            }}
            className="flex items-center gap-2 text-gray-700 hover:bg-red-50"
          >
            <RiDeleteBin5Line className="text-red-500" /> Delete
          </MenuItem>
        </Menu>
      </div>
    ),
  }));

  return (
    <div className="h-full bg-gray-50 pt-6 px-6 pb-0">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm pt-6 px-6 pb-0 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <IoArrowBackOutline className="text-2xl text-gray-600" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-800">Roles</h1>
              </div>
              <span className="px-3 pt-1 pb-0 bg-blue-100 text-blue-600 rounded-full text-sm">
                {roles.length} Total Roles
              </span>
            </div>
            <button
              onClick={() => {
                setEditRole(null);
                setIsRoleModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 pt-2 pb-0 rounded-md hover:bg-blue-600 transition-colors"
            >
              <PiPlusSquareBold className="text-xl" />
              Create New Role
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 pt-3 pb-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: column.width }}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tableData.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 pt-4 pb-0 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.Cell ? column.Cell({ value: row[column.accessor] }) : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isRoleModalOpen && (
        <RoleSelectionModal
          onClose={() => {
            setIsRoleModalOpen(false);
            setEditRole(null);
          }}
          edit_role={edit_role}
          onSuccess={getAllRoles}
        />
      )}
    </div>
  );
}

export default Roles;
