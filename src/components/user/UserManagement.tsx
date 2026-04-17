import { useEffect, useState, useMemo } from "react";
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
import Badge from "../Badge";
import { BiUserCheck } from "react-icons/bi";
import { Menu, MenuItem } from "@mui/material";
import type {
  User,
  TableColumn,
  TableAction,
  UseFetchDataReturn
} from "../../types/management.types";

const UserManagement = () => {
  const [isModal, setIsModal] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

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
      header: "User Type",
      accessor: "userType",
    },
    {
      header: "Approval Level",
      accessor: "approvalLevel",
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

  const formatUserType = (value: string) => {
    const map: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      procurement: 'Procurement',
      vendor: 'Vendor',
    };
    return map[value] || value;
  };

  const formatApprovalLevel = (value: string) => {
    const map: Record<string, string> = {
      NONE: 'None',
      L1: 'Level 1',
      L2: 'Level 2',
      L3: 'Level 3',
    };
    return map[value] || value;
  };

  const {
    data: allUsers,
    totalCount,
    page,
    setPage,
    limit,
    setSearch,
    totalDoc,
    refetch,
  } = useFetchData("/user/", 10) as UseFetchDataReturn<User>;
  const debounce = useDebounce(setSearch, 600);

  // Filter out super_admin users (dev team only) from the list
  const users = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((user: any) => user.userType !== 'super_admin');
  }, [allUsers]);

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

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedRow, setSelectedRow] = useState<{ element: HTMLElement | null; user: User | null }>({ element: null, user: null });

  return (
    <div className="flex flex-col bg-white dark:bg-dark-surface rounded-lg min-h-full">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border pt-6 px-6 pb-4 flex-shrink-0">
        {/* Header Section */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm pt-6 px-6 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              {/* User Management Section */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BiUserCheck className="text-2xl text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-dark-text">User Management</h1>
                </div>
                <Link
                  to="/user-management/create-user"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <FaPlus className="text-sm" /> Add New User
                </Link>
              </div>

              <div className="h-10 w-px bg-gray-200 dark:bg-dark-border"></div>

              {/* Roles Section */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <VscSettings className="text-2xl text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-dark-text">Roles</h1>
                </div>
                <Link
                  to="/user-management/edit-roles"
                  className="inline-flex items-center gap-2 bg-white dark:bg-dark-surface text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium border border-blue-200 dark:border-blue-500 hover:border-blue-300"
                >
                  <FaPlus className="text-sm" /> Manage Roles
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, phone, role..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-dark-text dark:bg-dark-bg dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                onChange={(e) => debounce(e.target.value)}
              />
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-bg/50 border-b dark:border-dark-border">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {users?.map((row, _rowIndex) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text"
                    >
                      {column.isBadge ? (
                        <Badge
                          status={(row as any)[column.accessor]}
                        />
                      ) : column.accessorKey ? (
                        (row as any)[column.accessor]?.[column.accessorKey]
                      ) : column.accessor === 'userType' ? (
                        formatUserType((row as any)[column.accessor])
                      ) : column.accessor === 'approvalLevel' ? (
                        formatApprovalLevel((row as any)[column.accessor])
                      ) : (
                        (row as any)[column.accessor]
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                    <div className="relative">
                      <PiDotsThreeBold
                        className="text-xl cursor-pointer hover:text-blue-500 transition-colors"
                        onClick={(event) => setSelectedRow({ element: event.currentTarget as unknown as HTMLElement, user: row })}
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

        <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
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
      {/* End Scrollable Content Area */}

      {/* Modals - Outside Scrollable Area */}
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
