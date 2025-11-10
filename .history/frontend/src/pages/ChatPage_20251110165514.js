import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
// Note: This component assumes a running environment where react-router-dom and its hooks are available.

// The component no longer imports a separate CSS file to resolve the compilation error.
// All styles are included in the component's JSX inside a <style> block.

// Utility function to generate unique ID (simple timestamp + random number)
const generateUniqueId = () => Date.now() + Math.random().toString(36).substring(2);

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    // We are mocking a user object based on the structure provided in the original prompt
    const [user, setUser] = useState({ username: "Loading..." }); 
    
    // Autoscroll reference
    const messagesEndRef = useRef(null);
    
    // Get location data for project and client info
    const location = useLocation();
    
    // Get projectTitle and clientEmail from query params
    const queryParams = new URLSearchParams(location.search);
    const projectTitle = queryParams.get("projectTitle") || "Unknown Project";
    const clientEmail = queryParams.get("clientEmail") || "Unknown Client";

    // Use a unique key based on the project for message persistence
    const chatKey = `chatMessages_${projectTitle.replace(/\s/g, '_')}`;

    // --- Persistence and User Loading Effect ---
    useEffect(() => {
        // Load user from localStorage (or default to Guest)
        const storedUser = JSON.parse(localStorage.getItem("user")) || { username: "Guest" };
        setUser(storedUser);

        // Load messages based on the dynamic chat key
        const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
        setMessages(savedMessages);
    }, [chatKey]);

    // --- Autoscroll Effect ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Message Sending Logic ---
    const sendMessage = (e) => {
        if (e) e.preventDefault();
        if (text.trim() === "") return;

        const newMsg = {
            id: generateUniqueId(),
            sender: user.username,
            text: text.trim(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        
        // Save updated messages to localStorage
        try {
            localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            // In a real application, you would handle this gracefully (e.g., use Firestore)
        }
        
        setText("");
    };

    // Determine if the current message is mine or received
    const isMyMessage = (sender) => sender === user.username;

    return (
        <>
            {/* Injecting CSS styles to resolve the missing file issue */}
            <style jsx="true">{`
                /* Full wrapper */
                .chat-wrapper {
                    display: flex;
                    flex-direction: column;
                    height: 90vh;
                    width: 95%; /* Increased width for better mobile view */
                    max-width: 900px;
                    margin: 30px auto;
                    border-radius: 20px;
                    background: linear-gradient(135deg, #6a11cb, #2575fc); /* Gradient background */
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); /* Stronger shadow */
                    font-family: "Inter", sans-serif;
                }
                @media (min-width: 768px) {
                    .chat-wrapper {
                        width: 80%;
                    }
                }

                /* Header */
                .chat-header {
                    text-align: center;
                    padding: 20px 0;
                    background: rgba(255, 255, 255, 0.15);
                    color: #fff;
                    backdrop-filter: blur(15px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }

                .chat-header h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                }

                .chat-header p {
                    font-size: 13px;
                    color: #e0e0e0;
                    margin: 5px 15px 0;
                }
                @media (max-width: 600px) {
                    .chat-header p {
                        font-size: 11px;
                    }
                }

                /* Body */
                .chat-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    scroll-behavior: smooth;
                }

                .no-msg {
                    text-align: center;
                    color: #e2e2e2;
                    margin-top: 50px;
                }

                /* Message bubble */
                .chat-bubble {
                    max-width: 80%; /* Increased max width for mobile */
                    padding: 12px 16px;
                    border-radius: 18px;
                    animation: fadeIn 0.3s ease;
                    word-wrap: break-word;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                @media (min-width: 600px) {
                    .chat-bubble {
                        max-width: 60%;
                    }
                }

                .chat-bubble.sent {
                    align-self: flex-end;
                    background: #ff6a00; /* Warm accent color for sent */
                    color: white;
                    border-bottom-right-radius: 5px;
                }

                .chat-bubble.received {
                    align-self: flex-start;
                    background: rgba(255, 255, 255, 0.95); /* Light color for received */
                    color: #333;
                    border-bottom-left-radius: 5px;
                }

                .chat-sender {
                    font-weight: 600;
                    margin-bottom: 3px;
                    font-size: 13px;
                    display: block; /* Ensures sender name is on its own line */
                }

                .chat-bubble.sent .chat-sender {
                    color: #fff; /* White sender name for sent messages */
                }
                .chat-bubble.received .chat-sender {
                    color: #007bff; /* Blue sender name for received messages */
                }


                .chat-text {
                    font-size: 15px;
                    margin: 5px 0;
                }

                .chat-time {
                    font-size: 10px;
                    text-align: right;
                    display: block;
                    margin-top: 5px;
                    opacity: 0.8;
                }

                /* Input area */
                .chat-input {
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(15px);
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                }

                .chat-input input {
                    flex: 1;
                    padding: 12px 20px;
                    border-radius: 25px;
                    border: none;
                    outline: none;
                    background: rgba(255, 255, 255, 0.95);
                    font-size: 16px;
                    transition: box-shadow 0.2s;
                }

                .chat-input input:focus {
                    box-shadow: 0 0 10px rgba(255, 106, 0, 0.5);
                }

                .chat-input button {
                    margin-left: 10px;
                    width: 48px;
                    height: 48px;
                    border: none;
                    border-radius: 50%;
                    background: #ff6a00;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s, transform 0.3s;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                }
                
                .chat-input button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                .chat-input button:hover:not(:disabled) {
                    background: #e65c00;
                    transform: scale(1.05);
                }

                .send-icon {
                    width: 20px;
                    height: 20px;
                }

                /* Scrollbar styling */
                .chat-body::-webkit-scrollbar {
                    width: 6px;
                }
                .chat-body::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.4);
                    border-radius: 10px;
                }

                /* Animation */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            
            <div className="chat-wrapper">
                
                {/* Chat Header */}
                <header className="chat-header">
                    <h2>💬 Chat Room</h2>
                    <p>
                        <strong>Project:</strong> {projectTitle} | 
                        <strong> Client:</strong> {clientEmail} | 
                        Chatting as: **{user.username}**
                    </p>
                </header>

                {/* Chat Messages Body */}
                <div className="chat-body">
                    {messages.length === 0 && (
                        <p className="no-msg">
                            Apni baat-cheet abhi shuru karein! (Sandesh {chatKey} key ke antargat save kiye gaye hain)
                        </p>
                    )}
                    
                    {messages.map((msg) => (
                        <div
                            key={msg.id || msg.time} // Use ID if present, fallback to time
                            className={`chat-bubble ${isMyMessage(msg.sender) ? 'sent' : 'received'}`}
                        >
                            <strong className="chat-sender">{msg.sender}</strong>
                            <p className="chat-text">{msg.text}</p>
                            <small className="chat-time">{msg.time}</small>
                        </div>
                    ))}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <footer className="chat-input">
                    <input
                        type="text"
                        placeholder="Type..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={text.trim() === ""}
                        className="send-button"
                    >
                        {/* SVG for Send Icon (White) */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="send-icon">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.542 60.542 0 0018.445-8.986.75.75 0 000-1.218A60.542 60.542 0 003.478 2.405z" />
                        </svg>
                    </button>
                </footer>
            </div>
        </>
    );
}

export default ChatPage;