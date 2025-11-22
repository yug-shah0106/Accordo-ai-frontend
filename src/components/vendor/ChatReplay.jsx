import React, { useState } from "react";
import chatLogo from "../../assets/chatLogo.png";

function ChatReplay({ isOpen, toggleMenu }) {
  const [chat, setChat] = useState({
    chatId: "123",
    participants: [
      {
        userId: "user123",
        username: "Panjit",
        role: "sender",
      },
      {
        userId: "bot456",
        username: "ChatBot",
        role: "bot",
      },
    ],
    messages: [
      {
        messageId: "1",
        senderId: "user123",
        senderName: "Panjit",
        content: "Hello, Bot!",
        timestamp: "2024-11-25T10:00:00Z",
        status: "delivered",
      },
      {
        messageId: "2",
        senderId: "bot456",
        senderName: "ChatBot",
        content:
          "Hi there, Panjit! How can I assist you today? Lorem jsdhusadhasdasdojasdojudjosdafibdfaslasdfhasdfihasdfiuufsdiuh ",
        timestamp: "2024-11-25T10:00:10Z",
        status: "sent",
      },
      {
        messageId: "3",
        senderId: "user123",
        senderName: "Panjit",
        content: "Can you tell me today's weather?",
        timestamp: "2024-11-25T10:01:00Z",
        status: "delivered",
      },
      {
        messageId: "4",
        senderId: "bot456",
        senderName: "ChatBot",
        content: "Sure! It's sunny with a high of 25°C.",
        timestamp: "2024-11-25T10:01:05Z",
        status: "read",
      },
    ],
    lastMessage: {
      messageId: "4",
      senderId: "bot456",
      content: "Sure! It's sunny with a high of 25°C.",
      timestamp: "2024-11-25T10:01:05Z",
    },
    createdAt: "2024-11-25T09:59:00Z",
    updatedAt: "2024-11-25T10:01:05Z",
  });
  return (
    <div className="xl:w-2/3 w-full flex   flex-col justify-between">
      <nav className="bg-white border-b border-b-[#D1CFCF] p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={chatLogo} alt="chatLogo" className="w-10 mx-auto" />
            <div className="flex flex-col items-start">
              <span className="text-lg font-semibold text-gray-800">
                Chat Replay ({chat.chatId})
              </span>
              <span className="text-sm text-gray-500">Online</span>
            </div>
          </div>

          <div className={`hamburger-icon ${isOpen ? "open" : ""}`} onClick={toggleMenu} >
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="p-4 flex flex-col justify-between">
        <div className="overflow-y-scroll hide-scrollbar flex  flex-col h-[50vh] space-y-3 xl:px-8">
          {chat?.messages.map((message) => (
            <div
              key={message.messageId}
              className={`message-item max-w-[70%] p-2 mb-2 rounded-md break-words ${
                message.senderId === "user123"
                  ? "bg-blue-100 text-left"
                  : "bg-[#F1F1F1] ml-auto font-light text-right"
              }`}
            >
              <strong>{message.senderName}:</strong>
              <p>{message.content}</p>
              <small className="text-gray-500 text-xs">
                {new Date(message.timestamp).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>

        <div className="text-start text-sm p-3 rounded-lg shadow-lg">
          <textarea
            className="text-gray-500 font-light w-[100%] h-16 resize-none outline-none"
            placeholder="Your receiver has been successfully submitted"
          ></textarea>
          <div className="text-end">
            <button className="ml-auto text-xs bg-blue-600 text-white px-4 py-2 rounded">
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatReplay;

{
  /* <div className="flex space-x-5">
            <div className="">
              <img src={chatLogo} alt="chatLogo" className="w-10 mx-auto" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 pb-4">Support Bot:</p>
              <p className="bg-[#DCE1F9] p-4 rounded-lg text-[#18100E] font-light">
                Welcome to NegoEngine. I'm ChatBot, your AI assistant. Let me
                know how I can help you.
              </p>
            </div>
          </div>

          <div className="ml-12">
            <p className="bg-[#F1F1F1] p-4 rounded-lg text-[#18100E] font-light">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation.
            </p>
          </div>

          <div className="flex space-x-5">
            <div className="">
              <img src={chatLogo} alt="chatLogo" className="w-10 mx-auto" />
            </div>
            <p className="font-semibold text-gray-800">Support Bot:</p>
          </div>
          <p className="bg-[#FEEDAF] text-[#18100E] p-2 rounded-lg w-2/3 text-center font-light">
            Thank you for the feedback!
          </p>
          <div className="ml-12">
            <p className="bg-[#F1F1F1] p-4 rounded-lg text-[#18100E] font-light">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation.
            </p>
          </div> */
}
