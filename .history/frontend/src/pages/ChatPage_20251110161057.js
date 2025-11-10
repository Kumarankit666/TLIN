import React, { useState, useEffect, useRef } from "react";

const ChatPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const chatEndRef = useRef(null);

  // Dummy project list
  const projects = [
    { id: 1, title: "Website UI Design", unread: 2 },
    { id: 2, title: "E-learning Dashboard", unread: 0 },
    { id: 3, title: "Mobile App Frontend", unread: 5 },
  ];

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedProject]);

  const handleSend = () => {
    if (!message.trim() || !selectedProject) return;

    const newMsg = {
      text: message,
      sender: "You",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedProject.id]: [...(prev[selectedProject.id] || []), newMsg],
    }));
    setMessage("");
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    // Mark unread as read
    project.unread = 0;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        <h2 className="text-xl font-bold p-4 border-b">💼 Projects</h2>
        <div className="overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleSelectProject(project)}
              className={`flex justify-between items-center p-4 cursor-pointer hover:bg-green-100 ${
                selectedProject?.id === project.id ? "bg-green-50" : ""
              }`}
            >
              <span className="font-medium text-gray-800">{project.title}</span>
              {project.unread > 0 && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {project.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            {/* Header */}
            <div className="bg-green-600 text-white p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                💬 Chat — {selectedProject.title}
              </h2>
              <span className="text-sm opacity-80">Online</span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {(messages[selectedProject.id] || []).map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 flex ${
                    msg.sender === "You" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-2xl ${
                      msg.sender === "You"
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 shadow rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-xs opacity-70 block mt-1 text-right">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input Box */}
            <div className="border-t bg-white p-3 flex items-center">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="ml-3 bg-green-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-green-600 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
            Select a project to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
