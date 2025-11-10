// ChatPage.js (Final Code: Fixes Role Display & Opponent Name)

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [user, setUser] = useState({}); // Stores { username: "...", role: "Client" or "Freelancer" }
    const location = useLocation();
    
    const messagesEndRef = useRef(null); 

    const queryParams = new URLSearchParams(location.search);
    const projectTitle = queryParams.get("projectTitle") || "Unknown Project";
    const clientEmail = queryParams.get("clientEmail") || "unknown@client.com";
    
    const chatKey = `chatMessages_${projectTitle}`;

    // --- EFFECT: Load User & Messages ---
    useEffect(() => {
        // Assume user object contains { username: "Kumar", role: "Client" } ya { username: "Jane", role: "Freelancer" }
        // Agar LocalStorage mein 'user' nahi hai, toh default 'Client' set kar rahe hain
        const storedUser = JSON.parse(localStorage.getItem("user")) || { 
            username: "Default User", 
            role: "Client" 
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
            sender: user.username, // e.g., "Kumar"
            senderRole: user.role, // **IMPORTANT: Yahaan Sahi Role Save Kar Rahe Hain**
            text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
        };

        const updated = [...messages, newMsg];
        setMessages(updated);
        
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
                {/* FIX 1: Logged-in Role Display */}
                <p className="text-xs">
                    You are logged in as <strong>{user.username} ({user.role})</strong> chatting with the other party.
                </p>
            </div>

            {/* --- Chat Messages Area --- */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 bg-gray-50">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 mt-5">No messages yet. Start your conversation!</p>
                )}
                {messages.map((msg, i) => {
                    const isMyMessage = msg.sender === user.username;
                    const alignment = isMyMessage ? "justify-end" : "justify-start";
                    
                    // FIX 2: Sender Name/Role Display Logic
                    let displayedName;
                    if (isMyMessage) {
                        // Agar yeh mera message hai: Mera Username aur Role dikhao
                        displayedName = `${msg.sender} (${msg.senderRole})`;
                    } else {
                        // Agar yeh doosre ka message hai: Uska Role (Jo aapka opposite hai) dikhao
                        const opponentRole = msg.senderRole; // Use the role stored in the message
                        
                        // NOTE: Agar purane messages mein senderRole save nahi hai, toh default 'Opponent' dikhega
                        displayedName = `${msg.sender} (${opponentRole || 'Opponent'})`; 
                    }
                    
                    return (
                        <div
                            key={i}
                            className={`flex ${alignment}`}
                        >
                            <div className="max-w-[75%]">
                                {/* Sender Name Display FIX */}
                                <p className={`text-xs font-semibold mb-1 ${isMyMessage ? "text-blue-700 text-right" : "text-gray-600 text-left"}`}>
                                    {/* FIX: Ab hum message mein saved senderRole use kar rahe hain, not a hardcoded opposite */}
                                    {msg.sender} ({msg.senderRole || 'User'}) 
                                </p>
                                
                                {/* Message Bubble */}
                                <div
                                    className={`p-3 text-sm rounded-xl shadow-md ${
                                        isMyMessage
                                            ? "bg-green-100 text-gray-800 rounded-br-none" // Current User
                                            : "bg-white text-gray-800 rounded-tl-none border border-gray-200" // Opponent
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