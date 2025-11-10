// ChatPage.js (Upgraded with Tailwind CSS, Auto-Scroll, and Role Logic)

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [user, setUser] = useState({}); // Ab ismein { username: "...", role: "..." } hoga
    const location = useLocation();
    
    // Auto-scroll ke liye useRef hook add kiya
    const messagesEndRef = useRef(null); 

    // Get projectTitle and clientEmail from query params
    const queryParams = new URLSearchParams(location.search);
    const projectTitle = queryParams.get("projectTitle") || "Unknown Project";
    const clientEmail = queryParams.get("clientEmail") || "Unknown Client";
    
    // Local Storage key
    const chatKey = `chatMessages_${projectTitle}`;

    // --- EFFECT: Load User & Messages ---
    useEffect(() => {
        // IMPORTANT: Hum assume kar rahe hain ki login ke time 'user' object mein
        // 'role' field bhi store kiya gaya hai (e.g., { username: "Kumar", role: "Freelancer" })
        const storedUser = JSON.parse(localStorage.getItem("user")) || { 
            username: "Guest User", 
            role: "Freelancer" // Default role for testing
        };
        setUser(storedUser);

        const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
        setMessages(savedMessages);
    }, [chatKey]);

    // --- EFFECT: Auto-Scroll ---
    // Jab bhi messages update honge, yeh scroll ko bottom tak le jaayega
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (text.trim() === "") return;

        const newMsg = {
            sender: user.username, // e.g., "Kumar"
            senderRole: user.role, // e.g., "Freelancer"
            text,
            // Timestamp ko thoda behtar format kiya
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
        };

        const updated = [...messages, newMsg];
        setMessages(updated);
        
        // LocalStorage mein 'senderRole' bhi save ho raha hai
        localStorage.setItem(chatKey, JSON.stringify(updated));
        setText("");
    };

    // --- RENDER LOGIC (Using Tailwind CSS) ---
    return (
        <div className="flex flex-col h-[90vh] w-[95%] max-w-4xl mx-auto my-5 border border-gray-300 rounded-xl shadow-2xl bg-white">
            
            {/* --- Chat Header --- */}
            <div className="text-center p-4 border-b bg-blue-600 text-white rounded-t-xl shadow-md">
                <h2 className="text-xl font-bold">💬 Chat Room</h2>
                <p className="mt-1 text-sm">
                    <strong>Project:</strong> {projectTitle}
                </p>
                <p className="text-xs">
                    <strong>Client:</strong> {clientEmail}
                </p>
            </div>

            {/* --- Chat Messages Area (Auto-Scrolling) --- */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 bg-gray-50">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 mt-5">No messages yet. Start your conversation!</p>
                )}
                {messages.map((msg, i) => {
                    // Check ki message current logged-in user ne bheja hai ya nahi
                    const isMyMessage = msg.sender === user.username;
                    
                    // Alignment: Current user's messages right mein
                    const alignment = isMyMessage ? "justify-end" : "justify-start";
                    
                    return (
                        <div
                            key={i}
                            className={`flex ${alignment}`}
                        >
                            <div className="max-w-[75%]">
                                {/* Sender Name and Role Display */}
                                <p className={`text-xs font-semibold mb-1 ${isMyMessage ? "text-blue-700 text-right" : "text-gray-600 text-left"}`}>
                                    {msg.sender}
                                    <span className="ml-2 text-gray-400 font-normal">
                                        ({msg.senderRole || "User"})
                                    </span>
                                </p>
                                
                                {/* Message Bubble */}
                                <div
                                    className={`p-3 text-sm rounded-xl shadow-md ${
                                        isMyMessage
                                            ? "bg-green-100 text-gray-800 rounded-br-none" // Right side bubble
                                            : "bg-white text-gray-800 rounded-tl-none border border-gray-200" // Left side bubble
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                
                                {/* Timestamp */}
                                <small className={`text-[10px] text-gray-400 mt-1 block ${isMyMessage ? "text-right" : "text-left"}`}>
                                    {msg.time}
                                </small>
                            </div>
                        </div>
                    );
                })}
                {/* Auto-scroll anchor point */}
                <div ref={messagesEndRef} /> 
            </div>

            {/* --- Message Input --- */}
            <div className="flex p-4 border-t border-gray-200 bg-white rounded-b-xl">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white w-10 h-10 ml-3 flex items-center justify-center rounded-full font-bold hover:bg-blue-700 transition duration-150 shadow-lg"
                    disabled={text.trim() === ""}
                >
                    ➤
                </button>
            </div>
        </div>
    );
}

export default ChatPage;