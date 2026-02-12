import logo from "../../assets/logo.svg";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bg-black text-white">
      <div className="pb-4">
        {/* <div className="py-6 xl:py-28 xl:px-60 rounded-b-[174px] xl:flex justify-between relative">
          <div className="w-full  xl:w-[60%] ">
            <div className="w-[70%] mx-auto my-6">
              <h1 className="text-2xl xl:text-5xl pt-2 pb-0">
                Lets Get in
                <span className="text-[#656ED3] font-bold">Touch!</span>
              </h1>
              <p className=" w-full xl:w-[50%]">
                Have a question or need assistance? Reach out to us via email,
                phone, or the contact form below. We're eager to assist you.
              </p>
              <p className="text-[#656ED3] font-bold">Nice hearing from you!</p>
            </div>
            <img
              src={footerTopImg}
              className="absolute left-[50%] translate-x-[-50%] top-0 w-[25%] hidden md:block"
            />
            <img
              src={footerBottomImg}
              className="absolute right-[55%] translate-x-[15%] bottom-0 w-[25%] hidden md:block"
            />
            <img
              src={footerCircle}
              className="absolute right-[55%] -bottom-52 w-[25%] hidden md:block"
            />
          </div>
          <div className="w-full xl:w-[40%] ">
            <form className="bg-[#0d0d0d] border border-[#232323] px-10 pt-10 pb-0 rounded-xl w-[80%] mx-auto">
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full border border-[#343434] bg-[#1f1f1f] rounded-md px-3 pt-2 pb-0 text-sm focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full border border-[#343434] bg-[#1f1f1f] rounded-md px-3 pt-2 pb-0 text-sm focus:outline-none"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block text-sm mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  className="w-full border border-[#343434] bg-[#1f1f1f] rounded-md px-3 pt-2 pb-0 text-sm focus:outline-none"
                  rows="4"
                ></textarea>
              </div>
              <div className="w-full text-end">
                <button
                  type="submit"
                  className=" bg-[#234BF3] text-white rounded pt-2 px-2 pb-0 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div> */}
        <div className="xl:pb-20 xl:pt-32 pt-10 pb-0 lg:w-[80%] w-[90%] mx-auto">
          <div className="grid lg:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">
            <div className="lg:col-span-1 sm:col-span-3 col-span-2">
              <img src={logo} alt="logo" className="h-28" />
              {/* <p className="text-[#234BF3] pt-2 pb-0">info@accordo.ai</p> */}
            </div>
            <div className="px-3 md:px-4">
              <p className="new-design-small mb-6 text-white">Company</p>
              <div className="flex flex-col gap-4">
                <a className="text-sm w-fit text-[#828282] opacify-link" href="#">
                  About Us
                </a>
                <a className="text-sm w-fit text-[#828282] opacify-link" href="#">
                  Career
                </a>
                <a className="text-sm w-fit text-[#828282] opacify-link" href="#">
                  Contact Us
                </a>
                <a className="text-sm w-fit text-[#828282] opacify-link" href="#">
                  Privacy Policy
                </a>
                <a className="text-sm w-fit text-[#828282] opacify-link" href="#">
                  Terms of Services
                </a>
              </div>
            </div>
            <div className="px-3 md:px-4">
              <p className="new-design-small mb-6 text-white">Resources</p>
              <div className="flex flex-col gap-4">
                <a className="text-sm w-fit text-[#828282] opacify-link" href="#">
                  Blog
                </a>
                <a className="text-sm w-fit text-[#828282] opacify-link" href="#">
                  Use Case
                </a>
              </div>
            </div>
            <div className="px-3 md:px-4">
              <p className="new-design-small mb-6 text-white">Social</p>
              <div className="flex flex-col gap-4">
                {/* <a
                  className="text-sm w-fit flex items-center gap-2 text-[#828282] opacify-link"
                  href="#"
                >
                  <FaXTwitter /> Twitter
                </a> */}
                <a
                  className="text-sm w-fit flex items-center gap-2 text-[#828282] opacify-link"
                  href="https://www.linkedin.com/company/accordo-ai/"
                >
                  <FaLinkedin /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex lg:justify-between w-[80%] sm mx-auto flex-wrap justify-center">
          <p className="text-gray-500  text-xs lg:text-lg">
            © 2025, Accordo AI. All Rights Reserved.
          </p>
          {/* <ul className="flex flex-wrap xl:text-md text-xs">
            <li>
              <a href="#about">About &nbsp; |</a>
            </li>
            <li>
              <a href="#home">&nbsp; Career &nbsp; |</a>
            </li>
            <li>
              <a href="#services">&nbsp; PrivacyPolicy &nbsp; |</a>
            </li>
            <li>
              <a href="#contact">&nbsp; Terms & Conditions</a>
            </li>
            <li>
              <a href="#contact">&nbsp; ConSecuritytact &nbsp; |</a>
            </li>
            <li>
              <a href="#contact">&nbsp; Whitepaper</a>
            </li>
          </ul> */}
        </div>
      </div>
    </div>
  );
};

export default Footer;
