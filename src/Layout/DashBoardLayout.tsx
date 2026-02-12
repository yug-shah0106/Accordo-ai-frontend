import Sidebar from "../components/SideBar/SideBar";
import { Outlet } from "react-router-dom";

interface DashBoardLayoutProps {
  logo: string;
}

const DashBoardLayout = ({ logo }: DashBoardLayoutProps) => {
  return (
    <div className="flex h-screen pt-4 pl-4 pr-0 pb-0 bg-[#F5F6F8] dark:bg-dark-bg">
      <Sidebar logo={logo} />
      <main className="flex-1 flex-grow bg-white dark:bg-dark-surface ms-4 me-4 overflow-y-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default DashBoardLayout;
