



// Old  side bar without navigation poopup







// import { useEffect, useState } from "react";
// import { FiBarChart2, FiGitBranch, FiMessageSquare } from "react-icons/fi";
// import { BiUserCheck } from "react-icons/bi";
// import { useLocation, useNavigate } from "react-router-dom";
// import { RiBox3Line } from "react-icons/ri";
// import { IoIosGitBranch } from "react-icons/io";
// import { SlSettings } from "react-icons/sl";
// import { PiFramerLogo, PiGitBranchLight } from "react-icons/pi";
// import { LuGitPullRequest, LuTwitch } from "react-icons/lu";
// import { CiLogout } from "react-icons/ci";

// const Sidebar = ({ logo }) => {
//   const [activeItem, setActiveItem] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(false); // State to manage sidebar visibility
//   const location = useLocation();
//   const navigate = useNavigate();

//   const menuItems = [
//     {
//       name: "Dashboard",
//       icon: <FiBarChart2 className="text-xl" />,
//       link: "dashboard",
//       isActive: true,

//     },
//     {
//       name: "Project Management",
//       icon: <LuTwitch className="text-xl" />,
//       link: "project-management",
//       isActive: true,

//     },
//     {
//       name: "Requisition Management",
//       icon: <LuGitPullRequest className="text-xl" />,
//       link: "requisition-management",
//       isActive: true,

//     },
//     {
//       name: "PO Management",
//       icon: <PiFramerLogo className="text-xl" />,
//       link: "po-management",
//       isActive: true,
//     },
//     {
//       name: "Product Management",
//       icon: <RiBox3Line className="text-xl" />,
//       link: "product-management",
//       isActive: true,

//     },
//     {
//       name: "Vendor Management",
//       icon: <FiGitBranch className="text-xl" />,
//       link: "vendor-management",
//       isActive: true,
//     },
//     {
//       name: "User Management",
//       icon: <BiUserCheck className="text-xl" />,
//       link: "user-management",
//       isActive: true,
//     },
//     {
//       name: "Feedback",
//       icon: <FiMessageSquare className="text-xl" />,
//       link: "feedback",
//       isActive: false,
//     },
//     // {
//     //   name: "Test",
//     //   icon: <SlSettings className="text-xl" />,
//     //   link: "test ",
//     //   isActive: true,
//     // },

//     {
//       name: "Settings",
//       icon: <SlSettings className="text-xl" />,
//       link: "setting",
//       isActive: true,
//     },
//     {
//       name: "Logout",
//       icon: <CiLogout className="text-xl" />,
//       link: "logout",
//       isActive: true,
//     },

//   ];

//   useEffect(() => {
//     setActiveItem(location.pathname ?? "");
//   }, [location.pathname]);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768) {
//         setSidebarOpen(false);
//       } else {
//         setSidebarOpen(true);
//       }
//     };

//     window.addEventListener("resize", handleResize);

//     handleResize();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   return (
//     <div className="relative">
//       {/* Sidebar Container */}
//       <div
//         className={`${sidebarOpen ? "w-80" : "w-20"
//           } md:w-80 transition-all h-full duration-300 bg-white rounded-md shadow-md border-r border-gray-200 overflow-hidden flex flex-col md:block  md:relative top-0 left-0 z-0`}
//       >
//         {/* Logo and Toggle Button */}
//         <div className="flex items-center justify-center px-4 pt-4 pb-0 border-b border-gray-200">
//           <div className="flex items-center">
//             <img src={logo} alt="Logo" className="w-28 h-auto" />
//           </div>
//         </div>

//         {/* Menu Items */}
//         <ul className="mt-4 overflow-auto h-full hide-scrollbar">
//           {menuItems.map((item, index) => {
//             return (
//               <li
//                 key={index}
//                 className={`flex items-center px-3 pt-2 pb-0 cursor-pointer`}
//                 onClick={() => {
//                   setActiveItem(item.link);
//                   // Uncomment the following lines if you want to close the sidebar on small screens
//                   // if (window.innerWidth < 768) {
//                   //   setSidebarOpen(false); // Close sidebar when item is clicked on small screens
//                   // }

//                   if (item.name !== "Logout") {
//                     if (item.isActive) {
//                       navigate(`/${item.link}`);
//                     }
//                   } else {
//                     localStorage.removeItem("%accessToken%");
//                     localStorage.removeItem("%companyId%");

//                     navigate("/");
//                   }
//                 }}
//               >
//                 <div
//                   className={`flex items-center w-full px-4 pt-2 pb-0 rounded-md ${activeItem?.includes(item.link) || activeItem === item.link
//                     ? "bg-[#234BF3] text-white"
//                     : "text-gray-700 hover:bg-gray-100"
//                     }`}
//                 >
//                   <span className="mr-2">{item.icon}</span>{" "}
//                   {sidebarOpen && item.name}
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       </div>

//       {/* Toggle Button (for small screens) */}
//       {/* <button
//         // onClick={toggleSidebar}
//         className="md:hidden fixed top-4 left-4 z-20 pt-2 px-2 pb-0 rounded-md text-gray-700 bg-white shadow-md"
//       >
//         {sidebarOpen ? "Close" : "Open"}
//       </button> */}
//     </div>
//   );
// };

// export default Sidebar;


import { useEffect, useState, useRef } from "react";
import { FiBarChart2, FiGitBranch, FiMessageSquare, FiSun, FiMoon } from "react-icons/fi";
import { VscFeedback } from "react-icons/vsc";
import { BiUserCheck } from "react-icons/bi";
import { MdVerified } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { RiBox3Line } from "react-icons/ri";
import { SlSettings } from "react-icons/sl";
// import { PiFramerLogo } from "react-icons/pi"; // Unused
import { LuGitPullRequest, LuTwitch } from "react-icons/lu";
import { CiLogout } from "react-icons/ci";
import Modal from "../Modal";
import { authApi } from "../../api";
import { tokenStorage } from "../../utils/tokenStorage";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStatus } from "../OnboardingReminder";

interface SidebarProps {
  logo: string;
}

const Sidebar = ({ logo }: SidebarProps) => {
  const [activeItem, setActiveItem] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nextPath, setNextPath] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const { theme: _theme, toggleTheme, isDark } = useTheme();
  const { showBadge: showOnboardingBadge } = useOnboardingStatus();

  // List of paths where forms exist
  const formPaths = [
    "/create-project",
    "/create-requisition",
    "/createproductform",
    "/create-vendor",
    "/create-user",
  ];

  // Note: hasPermission function commented out - permission filtering is disabled
  // type PermissionModule = 'contractPermission' | 'poPermission' | 'productPermission' | 'projectPermission' | 'requisitionPermission' | 'userPermission' | 'vendorPermission';
  // const hasPermission = (module: PermissionModule): boolean => {
  //   const permissions: Record<PermissionModule, string[] | null> = {
  //     contractPermission: JSON.parse(localStorage.getItem("contractPermission") || 'null'),
  //     poPermission: JSON.parse(localStorage.getItem("poPermission") || 'null'),
  //     productPermission: JSON.parse(localStorage.getItem("productPermission") || 'null'),
  //     projectPermission: JSON.parse(localStorage.getItem("projectPermission") || 'null'),
  //     requisitionPermission: JSON.parse(localStorage.getItem("requisitionPermission") || 'null'),
  //     userPermission: JSON.parse(localStorage.getItem("userPermission") || 'null'),
  //     vendorPermission: JSON.parse(localStorage.getItem("vendorPermission") || 'null'),
  //   };
  //   const modulePermission = permissions[module];
  //   return modulePermission !== null && Array.isArray(modulePermission) && modulePermission.includes("R");
  // };

  // Menu items with associated permissions
  const menuItems = [
    {
      name: "Dashboard",
      icon: <FiBarChart2 className="text-xl" />,
      link: "dashboard",
      permissionKey: "projectPermission",
      isActive: true,
    },
    {
      name: "Project Management",
      icon: <LuTwitch className="text-xl" />,
      link: "project-management",
      permissionKey: "projectPermission",
      isActive: true,
    },
    {
      name: "Requisition Management",
      icon: <LuGitPullRequest className="text-xl" />,
      link: "requisition-management",
      permissionKey: "requisitionPermission",
      isActive: true,
    },
    {
      name: "Product Management",
      icon: <RiBox3Line className="text-xl" />,
      link: "product-management",
      permissionKey: "productPermission",
      isActive: true,
    },
    {
      name: "Vendor Management",
      icon: <FiGitBranch className="text-xl" />,
      link: "vendor-management",
      permissionKey: "vendorPermission",
      isActive: true,
    },
    {
      name: "User Management",
      icon: <BiUserCheck className="text-xl" />,
      link: "user-management",
      permissionKey: "userPermission",
    },
    {
      name: "Negotiations",
      icon: <FiMessageSquare className="text-xl" />,
      link: "chatbot/requisitions",
      permissionKey: null,
      isActive: true,
    },
    {
      name: "Bid Analysis",
      icon: <MdVerified className="text-xl" />,
      link: "bid-analysis",
      permissionKey: "requisitionPermission",
      isActive: true,
    },
    {
      name: "Feedback",
      icon: <VscFeedback className="text-xl" />,
      link: "feedback",
      permissionKey: null,
      isActive: true,
    },
    {
      name: "Settings",
      icon: <SlSettings className="text-xl" />,
      link: "setting",
      permissionKey: null,
      isActive: true,
    },
    {
      name: "Logout",
      icon: <CiLogout className="text-xl" />,
      link: "logout",
      permissionKey: null,
      isActive: true,
    },
  ];

  useEffect(() => {
    setActiveItem(location.pathname ?? "");
  }, [location.pathname]);

  // Handle navigation
  const handleNavigation = (path: string) => {
    const fullPath = `/${path}`;
    const currentPath = location.pathname.split("/").pop(); // Get last part of path

    // Check if the current path is a form route
    if (formPaths.includes(`/${currentPath}`)) {
      setNextPath(fullPath);
      setShowModal(true); // Show modal to confirm
      return;
    }

    navigateToPath(fullPath, path);
  };

  // Navigate after confirming in modal
  const confirmNavigation = () => {
    setShowModal(false);
    navigate(nextPath);
  };

  // Handle actual navigation
  const navigateToPath = async (fullPath: string, path: string) => {
    if (path === "logout") {
      try {
        // Call logout endpoint to invalidate refresh tokens on server
        await authApi.post("/auth/logout");
      } catch (error: unknown) {
        console.error("Logout error:", error);
        // Continue with local cleanup even if API call fails
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || "Logout failed");
      } finally {
        // Always clear local tokens and user data
        tokenStorage.clearTokens();
        navigate("/");
      }
    } else {
      navigate(fullPath);
    }
  };

  // Handle sidebar responsiveness
  // Sidebar is now collapsed by default on all screens
  // Users can manually expand it using the toggle button
  useEffect(() => {
    const handleResize = () => {
      // Sidebar remains collapsed by default regardless of screen size
      // User preference is maintained unless they explicitly toggle
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Detect click outside the sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !(sidebarRef.current as HTMLElement).contains(event.target as Node) &&
        window.innerWidth < 992
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Note: Permission filtering is disabled - all menu items are visible
  // const visibleMenuItems = menuItems.filter((item) => {
  //   if (item.permissionKey === null) return true;
  //   return hasPermission(item.permissionKey);
  // });


  return (
    <div className="relative">
      <div
        ref={sidebarRef}
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all h-full duration-300 bg-white dark:bg-dark-surface rounded-md shadow-md border-r border-gray-200 dark:border-dark-border flex flex-col md:block md:relative top-0 left-0 z-10`}
      >
        {/* Logo Section with Toggle and Theme Buttons */}
        <div className="relative flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200 dark:border-dark-border overflow-visible">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className={`${sidebarOpen ? 'h-8' : 'h-6'} w-auto transition-all duration-300`} />
          </div>

          {/* Theme Toggle Button (visible when expanded) */}
          {sidebarOpen && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <FiSun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          )}

          {/* Circular Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20"
          >
            <svg
              className={`w-3 h-3 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <ul    className="mt-4 overflow-auto h-full hide-scrollbar">
          {menuItems.map((item, index) => {
            return (
              <li
                key={index}
                className="flex items-center px-3 py-2 cursor-pointer"
                onClick={() => handleNavigation(item.link)}
                style={{cursor:'pointer'}}
              >
                <div
                  className={`flex items-center w-full px-4 py-2.5 rounded-md ${activeItem?.includes(item.link) || activeItem === item.link
                    ? "bg-[#234BF3] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <span className="mr-2 relative">
                    {item.icon}
                    {/* Onboarding badge on Settings */}
                    {item.link === "setting" && showOnboardingBadge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </span>
                  {sidebarOpen && (
                    <span className="flex items-center gap-2">
                      {item.name}
                      {/* Onboarding badge text when sidebar is open */}
                      {item.link === "setting" && showOnboardingBadge && (
                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">!</span>
                      )}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {showModal && (
        <Modal
          heading="Confirm Navigation"
          body="You are navigating away. Are you sure you want to leave this page?"
          onClose={() => setShowModal(false)}
          onAction={() => confirmNavigation()}
          actionText="Yes, Leave"
          wholeModalStyle={"z-40"}
          btnsStyle={"justify-center"}
        />
      )}
    </div>
  );
};

export default Sidebar;


