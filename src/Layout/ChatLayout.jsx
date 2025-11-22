import React from "react";
import { Outlet } from "react-router-dom";
import ChatSidebar from "../components/SideBar/ChatSideBar";

const ChatLayout = ({ logo }) => {
    return (
        <div className="flex h-screen  bg-[#F5F6F8]">
            <ChatSidebar logo={logo} />
            <main className="flex-1 flex-grow   h-full overflow-auto hide-scrollbar">
                <Outlet />
            </main>
        </div>
    );
};

export default ChatLayout;
