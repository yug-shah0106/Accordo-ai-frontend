



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
//         <div className="flex items-center justify-center px-4 py-4 border-b border-gray-200">
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
//                 className={`flex items-center px-3 py-2 cursor-pointer`}
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
//                   className={`flex items-center w-full px-4 py-2 rounded-md ${activeItem?.includes(item.link) || activeItem === item.link
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
//         className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-md text-gray-700 bg-white shadow-md"
//       >
//         {sidebarOpen ? "Close" : "Open"}
//       </button> */}
//     </div>
//   );
// };

// export default Sidebar;


import { useEffect, useState, useRef } from "react";
import { FiBarChart2, FiGitBranch, FiMessageSquare } from "react-icons/fi";
import { BiUserCheck } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { RiBox3Line } from "react-icons/ri";
import { SlSettings } from "react-icons/sl";
import { PiFramerLogo } from "react-icons/pi";
import { LuGitPullRequest, LuTwitch } from "react-icons/lu";
import { CiLogout } from "react-icons/ci";
import Modal from "../Modal";
import { authApi } from "../../api";
import { tokenStorage } from "../../utils/tokenStorage";
import toast from "react-hot-toast";

const Sidebar = ({ logo }) => {
  const [activeItem, setActiveItem] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nextPath, setNextPath] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // List of paths where forms exist
  const formPaths = [
    "/create-project",
    "/create-requisition",
    "/createproductform",
    "/create-vendor",
    "/create-user",
  ];

  // ✅ Check if user has permission for a given module
  const hasPermission = (module) => {
    // Get all permissions from localStorage
    const permissions = {
      contractPermission: JSON.parse(localStorage.getItem("contractPermission")),
      poPermission: JSON.parse(localStorage.getItem("poPermission")),
      productPermission: JSON.parse(localStorage.getItem("productPermission")),
      projectPermission: JSON.parse(localStorage.getItem("projectPermission")),
      requisitionPermission: JSON.parse(localStorage.getItem("requisitionPermission")),
      userPermission: JSON.parse(localStorage.getItem("userPermission")),
      vendorPermission: JSON.parse(localStorage.getItem("vendorPermission")),
    };

    // Get the module-specific permission
    const modulePermission = permissions[module];

    // Check if the module permission is valid and includes "R"
    return modulePermission !== null && Array.isArray(modulePermission) && modulePermission.includes("R");
  };

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
    // {
    //   name: "PO Management",
    //   icon: <PiFramerLogo className="text-xl" />,
    //   link: "po-management",
    //   permissionKey: "poPermission",
    //   isActive: true,
    // },
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
      name: "Feedback",
      icon: <FiMessageSquare className="text-xl" />,
      link: "feedback",
      permissionKey: null,
      isActive: false,
    },
    {
      name: "Organisation Settings",
      icon: <SlSettings className="text-xl" />,
      link: "setting",
      permissionKey: null,
      isActive: true,
    },
    {
      name: "Logout",
      icon: <CiLogout className="text-xl" />,
      link: "logout",
      permissionKey: null, // Logout should always be visible
      isActive: true,
    },
  ];

  useEffect(() => {
    setActiveItem(location.pathname ?? "");
  }, [location.pathname]);

  // Handle navigation
  const handleNavigation = (path) => {
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
  const navigateToPath = async (fullPath, path) => {
    if (path === "logout") {
      try {
        // Call logout endpoint to invalidate refresh tokens on server
        await authApi.post("/auth/logout");
      } catch (error) {
        console.error("Logout error:", error);
        // Continue with local cleanup even if API call fails
        toast.error(error.response?.data?.message || "Logout failed");
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
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Detect click outside the sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
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

  // ✅ Filter only the menu items with valid permissions
  const visibleMenuItems = menuItems.filter((item) => {
    true
    // if (item.permissionKey === null) {
    //   return true; // Always show if no permission is required
    // }
    // const hasPerm = hasPermission(item.permissionKey);
    // console.log(`Checking ${item.name}:`, hasPerm);
    // return hasPerm;
  });


  return (
    <div className="relative">
      <div
        ref={sidebarRef}
        onMouseEnter={()=>setSidebarOpen(true)}
        onMouseLeave={()=>setSidebarOpen(false)}
        className={`${
          sidebarOpen ? "w-80" : "w-20"
        } transition-all h-full duration-300 overflow-auto bg-white rounded-md shadow-md border-r border-gray-200 hide-scrollbar flex flex-col md:block md:relative top-0 left-0 z-10`}
      >
        {/* Logo Section */}
        <div onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center px-4 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-28 h-auto" />
          </div>
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
                  className={`flex items-center w-full px-4 py-2 rounded-md ${activeItem?.includes(item.link) || activeItem === item.link
                    ? "bg-[#234BF3] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {sidebarOpen && item.name}
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


