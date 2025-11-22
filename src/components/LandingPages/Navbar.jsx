import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMouseEnter = (index) => setDropdownOpen(index);
  const handleMouseLeave = () => setDropdownOpen(null);

  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);

  const menuItems = [
    { title: "Product", options: ["Dashboard", "Settings", "Earnings"] },
    // { title: "Solutions", options: ["Dashboard", "Settings", "Earnings"] },
    // { title: "Integrations", options: ["Dashboard", "Settings", "Earnings"] },
    { title: "Resources", options: ["Blog", "Use Case"] },
  ];

  return (
    <nav className="block xl:absolute w-full border-gray-200 dark:bg-gray-900 bg-black z-10">
      <div className="w-[90%] flex items-start  mx-auto p-2 relative">
        <div className="flex items-center justify-between w-full ">
          <Link
            to="/home"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src={logo} className="h-28" alt="Logo" />
          </Link>

          <button
            onClick={handleMobileMenuToggle}
            className="block md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="items-start justify-start hidden w-full md:flex md:w-auto md:order-1">
            <ul className="flex flex-col font-medium  p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:space-x-4 md:flex-row md:mt-0 md:border-0 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <a
                  href="#"
                  className="block py-2 mt-2 px-3 md:p-0 text-white rounded hover:bg-gray-100 md:hover:bg-transparent dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  About Us
                </a>
              </li>

              {menuItems.map((menu, index) => (
                <li
                  key={index}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  className="relative"
                >
                  <button className="flex items-center justify-between w-full py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 dark:text-white md:dark:hover:text-blue-500">
                    {menu.title}
                    <svg
                      className="w-2.5 h-2.5 ms-2.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  </button>

                  {dropdownOpen === index && (
                    <div className="z-10 absolute left-0 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                      <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                        {menu.options.map((option, i) => (
                          <li key={i}>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              {option}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}

              {/* <li>
                <a
                  href="#"
                  className="block py-2 mt-2 px-3 md:p-0 text-white rounded hover:bg-gray-100 md:hover:bg-transparent dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 mt-2 px-3 md:p-0 text-white rounded hover:bg-gray-100 md:hover:bg-transparent dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Pricing
                </a>
              </li> */}
            </ul>
          </div>
          <div className="hidden md:flex gap-5 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <Link
              to="/sign-in"
              className="text-white bg-[#234BF3] font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              Login
            </Link>
            {/* <Link
              to="/sign-up"
              className="text-white bg-[#234BF3] font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              Register
            </Link> */}
          </div>
        </div>

        <div
          className={`md:hidden w-full ${
            mobileMenuOpen ? "absolute top-full " : "hidden"
          }  `}
        >
          <ul className="flex flex-col font-medium p-4 mt-2 border border-gray-100 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <li>
              <a
                href="#"
                className="block py-2 mt-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white"
              >
                About Us
              </a>
            </li>
            {menuItems.map((menu, index) => (
              <li key={index}>
                <button
                  onClick={() => handleMouseEnter(index)}
                  className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                >
                  {menu.title}
                  <svg
                    className="w-2.5 h-2.5 ms-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>

                {dropdownOpen === index && (
                  <div className="font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700 dark:divide-gray-600">
                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                      {menu.options.map((option, i) => (
                        <li key={i}>
                          <a
                            href="#"
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            {option}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}

            <div className="flex justify-end gap-6 py-2">
              <Link
                to="/sign-in"
                className="text-black font-semibold rounded-lg text-sm  py-2 text-center"
              >
                Login
              </Link>
              {/* <Link
                to="/sign-up"
                className="text-white bg-[#234BF3] font-medium rounded-lg text-sm px-4 py-2 text-center"
              >
                Register
              </Link> */}
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
