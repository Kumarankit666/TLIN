import React, { useState, useRef, useEffect } from "react";

const ChatPage = () => {
  // Assume user info (you can replace with actual AuthContext)
  const currentUser = {
    username: "Kumar", // 👈 dynamically replace this with logged-in user's name
    role: "freelancer", // or "client"
  };

  const [messages, setMessages] = useState([
    {
      sender: "Kumar",
      text: "Hii",
      time: "15:56:41",
    },
    {
      sender: "Client_John",
      text: "Hello Kumar!",
      time: "15:57:00",
    },
    {
      sender: "Kumar",
      text: "How are you?",
      time: "15:57:15",
    },
  ]);

  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Auto scroll to bottom when new message added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;

    const newMessage = {
      sender: currentUser.username,
      text: input,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-3/4 h-[85vh] bg-white shadow-lg rounded-2xl flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">💬 Chat Room</h2>
          <div className="text-right text-sm">
            <p>
              <strong>Project:</strong> Web App
            </p>
            <p>
              <strong>Client:</strong> unknown@example.com
            </p>
          </div>
        </div>

        {/* Chat Box */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.map((msg, index) => {
            const isOwnMessage = msg.sender === currentUser.username;
            return (
              <div
                key={index}
                className={`mb-4 flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-2xl p-3 ${
                    isOwnMessage
                      ? "bg-green-100 text-right"
                      : "bg-gray-200 text-left"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-800">
                    {msg.sender}
                  </p>
                  <p className="text-gray-700 mt-1">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-3 bg-white border-t rounded-b-2xl flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSend}
            className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-semibold transition"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
