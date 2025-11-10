// ChatPage.js (Integrated with Chatpage.css)

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
// 🛑 IMPORTANT: Apni CSS file ko yahaan import karein
import './Chatpage.css'; 

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [user, setUser] = useState({}); 
    const location = useLocation();
    
    // Auto-scroll ke liye ref
    const messagesEndRef = useRef(null); 

    const queryParams = new URLSearchParams(location.search);
    const projectTitle = queryParams.get("projectTitle") || "Creative Project";
    const clientEmail = queryParams.get("clientEmail") || "client@domain.com";
    
    const chatKey = `chatMessages_${projectTitle}`;

    // --- EFFECT: Load User & Messages ---
    useEffect(() => {
        // Assume user object contains { username: "Kumar", role: "Client" } ya { username: "Jane", role: "Freelancer" }
        const storedUser = JSON.parse(localStorage.getItem("user")) || { 
            username: "Demo User", 
            role: "Freelancer" // Default for testing
        };
        setUser(storedUser);

        const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
        setMessages(savedMessages);
    }, [chatKey]);

    // --- EFFECT: Auto-Scroll ---
    // Auto-scroll logic CSS mein 'scroll-behavior: smooth' se bhi handle ho sakta hai,
    // lekin JS se smooth scroll ko ensure karna best practice hai.
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

    // --- RENDER LOGIC (Using your CSS classes) ---
    return (
        // Wrapper uses your gradient and shadow styles
        <div className="chat-wrapper">
            
            {/* Chat Header */}
            <div className="chat-header">
                <h2>💬 Chat Room</h2>
                <p>
                    <strong>Project:</strong> {projectTitle} <br />
                    <strong>Logged in as:</strong> {user.username} ({user.role})
                </p>
            </div>

            {/* Chat Messages Body */}
            <div className="chat-body">
                {messages.length === 0 && (
                    <p className="no-msg">No messages yet. Say Hii! 👋</p>
                )}
                {messages.map((msg, i) => {
                    const isMyMessage = msg.sender === user.username;
                    
                    // CSS Class selection
                    const bubbleClass = isMyMessage ? "chat-bubble sent" : "chat-bubble received";
                    const senderColor = isMyMessage ? { color: '#6a11cb' } : { color: '#e0e0e0' }; // Custom color for sender based on bubble
                    
                    return (
                        <div key={i} className={bubbleClass}>
                            {/* Sender Name */}
                            <p className="chat-sender" style={senderColor}>
                                {msg.sender} 
                                <span style={{ fontWeight: 400, opacity: 0.8, marginLeft: '5px' }}>
                                    ({msg.senderRole || 'User'})
                                </span>
                            </p>
                            
                            {/* Message Text */}
                            <p className="chat-text">{msg.text}</p>
                            
                            {/* Timestamp */}
                            <small className="chat-time">{msg.time}</small>
                        </div>
                    );
                })}
                {/* Auto-scroll anchor point */}
                <div ref={messagesEndRef} /> 
            </div>

            {/* Message Input Area */}
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    disabled={text.trim() === ""}
                >
                    ➤
                </button>
            </div>
        </div>
    );
}

export default ChatPage;