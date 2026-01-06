import { Outlet } from "react-router-dom";
import ChatSidebar from "../components/SideBar/ChatSideBar";

interface ChatLayoutProps {
    logo: string;
}

const ChatLayout = ({ logo }: ChatLayoutProps) => {
    return (
        <div className="flex min-h-screen  bg-[#F5F6F8]">
            <ChatSidebar logo={logo} />
            <main className="flex-1 flex-grow   min-h-full">
                <Outlet />
            </main>
        </div>
    );
};

export default ChatLayout;
