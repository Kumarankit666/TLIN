// ChatPage.js (Upgraded with Tailwind CSS and Auto-Scroll)

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [user, setUser] = useState({});
    const location = useLocation();

    // 1. Auto-scroll ke liye ref (Zaruri)
    const messagesEndRef = useRef(null); 

    // Get projectTitle and clientEmail from query params
    const queryParams = new URLSearchParams(location.search);
    const projectTitle = queryParams.get("projectTitle") || "Unknown Project";
    const clientEmail = queryParams.get("clientEmail") || "Unknown Client";

    // Dummy Data for Freelancer/Client name (Aap isse LocalStorage se bhi fetch kar sakte hain)
    const freelancerName = "Jane Doe (Freelancer)";
    const clientName = clientEmail.split('@')[0] + " (Client)"; // Client's name from email

    // Decide what the current user's role is based on username
    const isCurrentUser = (senderName) => senderName === user.username;

    // Local Storage key
    const chatKey = `chatMessages_${projectTitle}`;

    // 2. Fetch data and set user on load
    useEffect(() => {
        // Load Current User (Assuming Freelancer login)
        const storedUser = JSON.parse(localStorage.getItem("user")) || { username: freelancerName };
        setUser(storedUser);

        // Load Messages from LocalStorage
        const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
        setMessages(savedMessages);

        // NOTE: Agar aap Client aur Freelancer dono ko simulate karna chahte hain
        // to aapko login ke time hi user.role bhi set karna padega.
        
    }, [chatKey, freelancerName]);

    // 3. Auto-Scroll Effect (Har baar messages update hone par scroll karega)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (text.trim() === "") return;

        const newMsg = {
            sender: user.username, // Current logged-in user (e.g., Jane Doe (Freelancer))
            text,
            time: new Date().toLocaleTimeString(),
        };

        const updated = [...messages, newMsg];
        setMessages(updated);
        localStorage.setItem(chatKey, JSON.stringify(updated));
        setText("");
    };

    return (
        <div className="flex flex-col h-screen w-full max-w-4xl mx-auto my-5 border border-gray-300 rounded-xl shadow-2xl bg-white">
            
            {/* --- Chat Header (Using Tailwind) --- */}
            <div className="text-center p-4 border-b bg-indigo-600 text-white rounded-t-xl shadow-md">
                <h2 className="text-2xl font-bold">💬 Project Chat</h2>
                <p className="mt-1 text-sm">
                    <strong>Project:</strong> {projectTitle}
                </p>
                <p className="text-xs">
                    (You: {user.username} vs. {user.username === clientName ? freelancerName : clientName})
                </p>
            </div>

            {/* --- Chat Messages Area (Auto-Scrolling) --- */}
            <div
                className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 bg-gray-50"
            >
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 mt-5">Start your conversation!</p>
                )}
                {messages.map((msg, i) => {
                    const isMyMessage = isCurrentUser(msg.sender);
                    return (
                        <div
                            key={i}
                            className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                        >
                            <div className="max-w-xs md:max-w-md">
                                <p className={`text-xs font-semibold mb-1 ${isMyMessage ? "text-indigo-700" : "text-gray-600"}`}>
                                    {msg.sender}
                                </p>
                                <div
                                    className={`p-3 text-sm rounded-xl shadow-md ${
                                        isMyMessage
                                            ? "bg-indigo-500 text-white rounded-br-none"
                                            : "bg-gray-200 text-gray-800 rounded-tl-none"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                <small className={`text-xs text-gray-400 mt-1 block ${isMyMessage ? "text-right" : "text-left"}`}>
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
                    className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150"
                />
                <button
                    onClick={sendMessage}
                    className="bg-indigo-600 text-white w-10 h-10 ml-3 flex items-center justify-center rounded-full font-bold hover:bg-indigo-700 transition duration-150 shadow-lg disabled:opacity-50"
                    disabled={text.trim() === ""}
                >
                    ➤
                </button>
            </div>
        </div>
    );
}

export default ChatPage;