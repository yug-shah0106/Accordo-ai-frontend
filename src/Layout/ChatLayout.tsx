import { Outlet } from "react-router-dom";
import ChatSidebar from "../components/SideBar/ChatSideBar";

interface ChatLayoutProps {
    logo: string;
}

const ChatLayout = ({ logo }: ChatLayoutProps) => {
    return (
        <div className="flex h-screen pt-4 pl-4 pr-0 pb-0 bg-[#F5F6F8] dark:bg-dark-bg">
            <ChatSidebar logo={logo} />
            <main className="flex-1 flex-grow overflow-y-auto bg-white dark:bg-dark-surface ms-4 me-4 h-full">
                <Outlet />
            </main>
        </div>
    );
};

export default ChatLayout;
