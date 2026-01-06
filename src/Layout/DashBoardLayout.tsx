import Sidebar from "../components/SideBar/SideBar";
import { Outlet } from "react-router-dom";

interface DashBoardLayoutProps {
  logo: string;
}

const DashBoardLayout = ({ logo }: DashBoardLayoutProps) => {
  return (
    <div className="flex min-h-screen pt-6 pl-6 pr-0 pb-0 bg-[#F5F6F8] dark:bg-dark-bg">
      <Sidebar logo={logo} />
      <main className="flex-1 flex-grow bg-white dark:bg-dark-surface ms-6 me-6 min-h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DashBoardLayout;
