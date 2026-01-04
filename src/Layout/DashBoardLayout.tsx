import Sidebar from "../components/SideBar/SideBar";
import { Outlet } from "react-router-dom";

interface DashBoardLayoutProps {
  logo: string;
}

const DashBoardLayout = ({ logo }: DashBoardLayoutProps) => {
  return (
    <div className="flex h-screen p-6 bg-[#F5F6F8]">
      <Sidebar logo={logo} />
      <main className="flex-1 flex-grow bg-white shadow-md rounded-md ms-6 h-full overflow-auto hide-scrollbar">
        <Outlet />
      </main>
    </div>
  );
};

export default DashBoardLayout;
