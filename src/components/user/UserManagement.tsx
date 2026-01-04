import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { VscEdit, VscSettings } from "react-icons/vsc";
import { PiDotsThreeBold } from "react-icons/pi";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import useFetchData from "../../hooks/useFetchData";
import useDebounce from "../../hooks/useDebounce";
import { authApi } from "../../api";
import Modal from "../Modal";
import Filter from "../Filter";
import Badge from "../badge";
import { BiUserCheck } from "react-icons/bi";
import { Menu, MenuItem } from "@mui/material";
import type {
  User,
  Role,
  TableColumn,
  TableAction,
  FilterOption,
  UseFetchDataReturn
} from "../../types/management.types";

const UserManagement = () => {
  const [isModal, setIsModal] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([
    {
      moduleName: "User",
      filterBy: "status",
      controlType: "checkbox",
      label: "User Status",
      description: "User Status ",
      value: [],
      options: ["active", "inactive"],
    },
    {
      moduleName: "User",
      filterBy: "role",
      controlType: "checkbox",
      label: "User role",
      description: "User role ",
      value: [],
      options: userRoles?.map((role: Role) => role.name) || [],
    },
  ]);

  const columns: TableColumn[] = [
    {
      header: "User Name",
      accessor: "name",
    },
    {
      header: "User Email",
      accessor: "email",
    },
    {
      header: "User Phone",
      accessor: "phone",
    },
    {
      header: "User Role",
      accessor: "Role",
      accessorKey: "name"
    },
    {
      header: "User Status",
      accessor: "status",
      isBadge: true
    },
  ];

  const handleConfirmResetPassword = (user: User) => {
    setUserToReset(user);
    setIsModal(true);
  };

  const {
    data: users,
    totalCount,
    page,
    setPage,
    limit,
    setSearch,
    totalDoc,
    refetch,
    setFilters
  } = useFetchData("/user/get-all", 10) as UseFetchDataReturn<User>;
  const debounce = useDebounce(setSearch, 600);

  const handleResetPassword = async (user: User) => {
    try {
      const response = await authApi.put(
        `/auth/reset-password-auto/${user.id}`
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatusChange = async (user: User) => {
    try {
      const data = new FormData();
      data.append("userId", user.id);
      data.append("status", user.status === "active" ? "inactive" : "active");
      const response = await authApi.post(`/user/update-profile`, data);
      await refetch();
      console.log(response);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const actions: TableAction[] = [
    {
      type: "link",
      label: "Edit Details",
      icon: <VscEdit />,
      link: (row: User) => `/user-management/edit-user/${row.id}`,
    },
    {
      type: "button",
      label: "Change Status",
      icon: <RiDeleteBin5Line />,
      onClick: (row: User) => {
        handleStatusChange(row)
      },
    },
    {
      type: "button",
      label: "Reset Password",
      icon: <VscEdit />,
      onClick: (row: User) => {
        handleConfirmResetPassword(row);
      },
    },
  ];

  const handleCloseModal = async () => {
    setIsModal(false);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const applyFilters = (filters: Record<string, FilterOption> | null) => {
    if (filters === null) {
      const clearedFilters = selectedFilters.map((filter) => {
        if (filter.controlType === "rangeNumeric" && filter.range) {
          return { ...filter, value: [filter.range[0], filter.range[1]] };
        } else if (filter.controlType === "checkbox") {
          return { ...filter, selected: {}, value: [] };
        } else if (filter.controlType === "rangeDate") {
          return { ...filter, value: { from: "", to: "" } };
        } else if (filter.controlType === "inputText") {
          return { ...filter, value: "" };
        }
        return filter;
      });
      setSelectedFilters(clearedFilters);
      setFilters(null);
      setIsFilterModalOpen((prev) => (!prev));
      return;
    }

    const transformedFilters = Object.keys(filters).reduce((acc, key) => {
      const filter = filters[key];

      if (filter.controlType === "checkbox" && typeof filter.selected === "object") {
        acc[key] = {
          ...filter,
          value: Object.keys(filter.selected).filter((k) => filter.selected![k]),
        };
      } else {
        acc[key] = filter;
      }

      return acc;
    }, {} as Record<string, FilterOption>);

    const apiFilters = Object.values(filters).map((filter: FilterOption) => {
      if (filter.controlType === "checkbox" && typeof filter.selected === "object") {
        return {
          ...filter,
          value: Object.keys(filter.selected).filter(key => filter.selected![key]),
          selected: undefined,
        };
      }

      if (filter.controlType === "rangeDate") {
        return {
          ...filter,
          value: [filter.value.from, filter.value.to],
        };
      }

      return filter;
    });

    setSelectedFilters(Object.values(transformedFilters));
    setFilters(JSON.stringify(apiFilters));
    setIsFilterModalOpen(false);
  };

  const fetchRoles = async () => {
    try {
      const data = await authApi.get<{ data: Role[] }>(`/role/get-all`);
      setUserRoles(data.data.data);
      setSelectedFilters((prevFilters) => [
        {
          moduleName: "User",
          filterBy: "status",
          controlType: "checkbox",
          label: "User Status",
          description: "User Status",
          value: prevFilters.find((f) => f.filterBy === "status")?.value || [],
          options: ["active", "inactive"],
        },
        {
          moduleName: "User",
          filterBy: "role",
          controlType: "checkbox",
          label: "User Role",
          description: "User Role",
          value: prevFilters.find((f) => f.filterBy === "role")?.value || [],
          options: data?.data?.data?.map((role: Role) => role.name) || [],
        },
      ]);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const [selectedRow, setSelectedRow] = useState<{ element: HTMLElement | null; user: User | null }>({ element: null, user: null });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              {/* User Management Section */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BiUserCheck className="text-2xl text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
                </div>
                <Link
                  to="/user-management/create-user"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <FaPlus className="text-sm" /> Add New User
                </Link>
              </div>

              <div className="h-10 w-px bg-gray-200"></div>

              {/* Roles Section */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <VscSettings className="text-2xl text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-800">Roles</h1>
                </div>
                <Link
                  to="/user-management/edit-roles"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm font-medium border border-blue-200 hover:border-blue-300"
                >
                  <FaPlus className="text-sm" /> Manage Roles
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                    onChange={(e) => debounce(e.target.value)}
                  />
                  <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <VscSettings className="text-gray-500" /> Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users?.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.isBadge ? (
                          <Badge
                            status={row[column.accessor]}
                            className="text-xs"
                          />
                        ) : column.accessorKey ? (
                          row[column.accessor]?.[column.accessorKey]
                        ) : (
                          row[column.accessor]
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="relative">
                        <PiDotsThreeBold
                          className="text-xl cursor-pointer hover:text-blue-500 transition-colors"
                          onClick={(event) => setSelectedRow({ element: event.currentTarget as HTMLElement, user: row })}
                        />
                        <Menu
                          anchorEl={selectedRow.element}
                          open={Boolean(selectedRow.element) && selectedRow.user?.id === row.id}
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
                          {actions.map((action, index) => (
                            action.type === "link" && action.link ? (
                              <MenuItem
                                key={index}
                                component={Link}
                                to={action.link(row)}
                                className="flex items-center gap-2 text-gray-700 hover:bg-blue-50"
                              >
                                {action.icon} {action.label}
                              </MenuItem>
                            ) : action.onClick ? (
                              <MenuItem
                                key={index}
                                onClick={() => {
                                  action.onClick!(row);
                                  setSelectedRow({ element: null, user: null });
                                }}
                                className="flex items-center gap-2 text-gray-700 hover:bg-blue-50"
                              >
                                {action.icon} {action.label}
                              </MenuItem>
                            ) : null
                          ))}
                        </Menu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {totalDoc > 0 ? (
                  `Showing ${((page - 1) * limit) + 1} to ${Math.min(page * limit, totalDoc)} of ${totalDoc} entries`
                ) : (
                  "No entries found"
                )}
              </div>
              {totalCount > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalCount}
                  onPageChange={setPage}
                  limit={limit}
                  totalDoc={totalDoc}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {isFilterModalOpen && (
        <Filter
          onClose={closeFilterModal}
          filtersData={selectedFilters.reduce((acc, filter, idx) => {
            acc[idx] = filter;
            return acc;
          }, {} as Record<string, FilterOption>)}
          onApply={applyFilters}
        />
      )}

      {isModal && userToReset && (
        <Modal
          heading="Reset Password"
          body="Are you sure you want to reset the password for this user?"
          onClose={handleCloseModal}
          onAction={() => {
            handleResetPassword(userToReset);
            handleCloseModal();
          }}
          actionText="Reset"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default UserManagement;
