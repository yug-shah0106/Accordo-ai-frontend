import Sidebar from "../components/SideBar/SideBar";
import { Outlet } from "react-router-dom";

interface DashBoardLayoutProps {
  logo: string;
}

const DashBoardLayout = ({ logo }: DashBoardLayoutProps) => {
  return (
    <div className="flex h-screen pt-4 px-4 pb-0 bg-[#F5F6F8] dark:bg-dark-bg overflow-hidden">
      <Sidebar logo={logo} />
      <main className="flex-1 bg-white dark:bg-dark-surface ms-4 overflow-y-auto overflow-x-hidden flex flex-col min-w-0 max-w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DashBoardLayout;
