// ChatPage.js (Attractive UI with Enhanced Tailwind CSS)

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [user, setUser] = useState({}); // { username: "...", role: "Client" or "Freelancer" }
    const location = useLocation();
    
    const messagesEndRef = useRef(null); 

    const queryParams = new URLSearchParams(location.search);
    const projectTitle = queryParams.get("projectTitle") || "Awesome Project";
    const clientEmail = queryParams.get("clientEmail") || "client@example.com";
    
    const chatKey = `chatMessages_${projectTitle}`;

    // --- EFFECT: Load User & Messages ---
    useEffect(() => {
        // IMPORTANT: Ensure 'user' object has 'username' and 'role' from your login system.
        // For testing, we'll default to a Freelancer. You can change this to 'Client' to test the other side.
        const storedUser = JSON.parse(localStorage.getItem("user")) || { 
            username: "Jane Doe", 
            role: "Freelancer" 
        };
        setUser(storedUser);

        const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
        setMessages(savedMessages);
    }, [chatKey]);

    // --- EFFECT: Auto-Scroll ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (text.trim() === "") return;

        const newMsg = {
            sender: user.username, 
            senderRole: user.role, 
            text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
        };

        const updated = [...messages, newMsg];
        setMessages(updated);
        
        localStorage.setItem(chatKey, JSON.stringify(updated));
        setText("");
    };

    // --- RENDER LOGIC (Attractive UI with Tailwind CSS) ---
    return (
        <div className="flex flex-col h-[95vh] w-[98%] max-w-5xl mx-auto my-3 md:my-5 
                        bg-white border border-gray-200 rounded-3xl shadow-xl 
                        overflow-hidden transform transition-all duration-300 ease-in-out 
                        hover:shadow-2xl hover:scale-[1.005]">
            
            {/* --- Chat Header (Gradient Background) --- */}
            <div className="relative p-5 text-white text-center 
                            bg-gradient-to-r from-blue-600 to-purple-700 
                            rounded-t-3xl shadow-lg z-10">
                <h2 className="text-3xl font-extrabold mb-1 animate-pulse-slow">
                    <span className="mr-2">💬</span> Project Chat Room
                </h2>
                <p className="text-lg font-medium">
                    <strong>Project:</strong> <span className="text-blue-200">{projectTitle}</span>
                </p>
                <p className="text-sm italic opacity-80 mt-1">
                    You are logged in as <strong>{user.username} ({user.role})</strong>.
                </p>
            </div>

            {/* --- Chat Messages Area (Enhanced Scrollbar, Animated Messages) --- */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-4 bg-gray-50 
                            scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 text-lg mt-10 animate-fade-in">
                        No messages yet. Be the first to start the conversation!
                    </p>
                )}
                {messages.map((msg, i) => {
                    const isMyMessage = msg.sender === user.username;
                    const alignment = isMyMessage ? "justify-end" : "justify-start";
                    
                    return (
                        <div
                            key={i}
                            className={`flex ${alignment} animate-fade-in-up`} // Message entry animation
                        >
                            <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                {/* Sender Name and Role */}
                                <p className={`text-xs font-semibold mb-1 px-3 ${isMyMessage ? "text-blue-800 text-right" : "text-gray-700 text-left"}`}>
                                    {msg.sender} 
                                    <span className="ml-1 text-gray-500 font-normal text-[0.65rem]">
                                        ({msg.senderRole || 'User'})
                                    </span>
                                </p>
                                
                                {/* Message Bubble */}
                                <div
                                    className={`p-4 text-base rounded-2xl shadow-md 
                                                transform transition-transform duration-200 ease-out 
                                                ${
                                                    isMyMessage
                                                        ? "bg-gradient-to-br from-green-300 to-green-500 text-white rounded-br-none" // Your messages
                                                        : "bg-white text-gray-800 rounded-tl-none border border-gray-200" // Opponent's messages
                                                }`}
                                >
                                    {msg.text}
                                </div>
                                
                                {/* Timestamp */}
                                <small className={`text-[0.6rem] text-gray-400 mt-1 px-3 ${isMyMessage ? "text-right" : "text-left"}`}>
                                    {msg.time}
                                </small>
                            </div>
                        </div>
                    );
                })}
                {/* Auto-scroll anchor point */}
                <div ref={messagesEndRef} /> 
            </div>

            {/* --- Message Input (Stylish) --- */}
            <div className="flex p-4 border-t border-gray-200 bg-white rounded-b-3xl shadow-inner">
                <input
                    type="text"
                    placeholder="Type your message here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 p-3.5 border border-gray-300 rounded-full 
                                focus:ring-4 focus:ring-blue-300 focus:border-blue-500 
                                outline-none transition duration-200 text-gray-700 text-base 
                                placeholder-gray-400 shadow-sm"
                />
                <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                                w-12 h-12 ml-3 flex items-center justify-center rounded-full 
                                font-bold text-xl hover:scale-110 active:scale-95 
                                transition duration-200 shadow-lg hover:shadow-xl 
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    disabled={text.trim() === ""}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-45 -mt-1 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ChatPage;