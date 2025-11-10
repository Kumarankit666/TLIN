import React, { useState, useEffect, useRef } from 'react';
// Import the custom CSS file
import './ChatPage.css';

// Utility function to generate unique ID (simple timestamp + random number)
const generateUniqueId = () => Date.now() + Math.random().toString(36).substring(2);

// Mock initial user and messages for simulation
const MOCK_USER = {
    username: 'Kumar',
    role: 'Client' // Change to 'Freelancer' here to test the opposite view
};
const OPPONENT = MOCK_USER.role === 'Client' ? 'Jane (Freelancer)' : 'Alpha Corp (Client)';

const initialMessages = [
    {
        id: generateUniqueId(),
        sender: MOCK_USER.role === 'Client' ? 'Freelancer' : 'Client', // Opponent
        text: "Hello! I've reviewed the project scope. Ready for a quick call?",
        time: new Date(Date.now() - 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
    {
        id: generateUniqueId(),
        sender: MOCK_USER.role, // Current user
        text: 'Hi! Yes, I’m free in 15 minutes. Great to hear you’re ready!',
        time: new Date(Date.now() - 2400000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
    {
        id: generateUniqueId(),
        sender: MOCK_USER.role === 'Client' ? 'Freelancer' : 'Client', // Opponent
        text: null,
        file: {
            name: 'Project_Brief.pdf',
            type: 'application/pdf',
            dataUrl: '#', // Placeholder for file data
            size: '150.55', // Mock size
        },
        time: new Date(Date.now() - 1200000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
];

const App = () => {
    const [messages, setMessages] = useState(initialMessages);
    const [text, setText] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Stores the ID of the message to delete
    const [user] = useState(MOCK_USER);
    
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // --- Auto-Scroll Effect ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Message Sending Logic ---
    const handleSend = (e) => {
        e.preventDefault();
        if (text.trim() === '') return;

        const newMsg = {
            id: generateUniqueId(),
            sender: user.role,
            text: text.trim(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, newMsg]);
        setText('');
    };

    // --- File Handling Logic ---
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Simulate reading the file into a data URL for preview/download simulation
        const reader = new FileReader();
        reader.onloadend = () => {
            const newFileMsg = {
                id: generateUniqueId(),
                sender: user.role,
                text: null,
                file: {
                    name: file.name,
                    type: file.type,
                    dataUrl: reader.result, // Actual Base64 data for image/file preview
                    size: (file.size / 1024).toFixed(2), // KB
                },
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages(prev => [...prev, newFileMsg]);
        };
        reader.readAsDataURL(file);
    };

    // --- Delete Confirmation Logic ---
    const handleDeleteClick = (id) => {
        setDeleteConfirm(id);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            setMessages(prev => prev.filter(msg => msg.id !== deleteConfirm));
            setDeleteConfirm(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    // --- Chat Bubble Component ---
    const ChatBubble = ({ msg }) => {
        const isMyMessage = msg.sender === user.role;
        const bubbleClass = isMyMessage ? 'chat-bubble sent' : 'chat-bubble received';
        const senderName = isMyMessage ? user.username : OPPONENT;

        // Render file content
        const renderFileContent = () => {
            if (!msg.file) return null;

            const { name, type, dataUrl, size } = msg.file;
            const isImage = type.startsWith('image/');

            return (
                <a href={dataUrl} download={name} className="file-card">
                    {isImage ? (
                        <div className="file-preview-image">
                            <img src={dataUrl} alt={name} loading="lazy" />
                        </div>
                    ) : (
                        <div className="file-preview-icon">
                             {/* Document Icon (SVG) - FIXED */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="file-icon">
                                <path fillRule="evenodd" d="M19.5 9.75V3.75h-1.5V6H5.25V3.75H3.75v6h1.5V8.25h12v1.5H19.5zm-1.5 6h-1.5V18h-9v-1.5h-1.5V19.5h12v-3.75z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    <div className="file-details">
                        <p className="file-name">{name}</p>
                        <p className="file-size">{size} KB | Click to Download</p>
                    </div>
                </a>
            );
        };

        return (
            <div className={`chat-bubble-container ${isMyMessage ? 'my-message' : 'other-message'}`}>
                <div className={bubbleClass}>
                    <div className="chat-sender-info">
                        <span className="chat-sender-name">{senderName}</span>
                        {/* Delete Button */}
                        <div className="delete-button-wrapper" onClick={() => handleDeleteClick(msg.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="delete-icon">
                                <path d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" />
                            </svg>
                        </div>
                    </div>
                    
                    {msg.text && <p className="chat-text">{msg.text}</p>}
                    
                    {msg.file && renderFileContent()}
                    
                    <small className="chat-time">{msg.time}</small>
                </div>
            </div>
        );
    };


    return (
        <div className="chat-wrapper">
            
            {/* --- Fixed Header --- */}
            <header className="chat-header">
                <h2>{OPPONENT}</h2>
                <p>Chatting as: **{user.username} ({user.role})**</p>
            </header>

            {/* --- Scrollable Body --- */}
            <div className="chat-body">
                {messages.length === 0 && (
                    <p className="no-msg">Start your conversation now! 🚀</p>
                )}
                {messages.map(msg => (
                    <ChatBubble key={msg.id} msg={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* --- Fixed Input/Footer --- */}
            <footer className="chat-input">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(e)}
                />
                
                {/* File Attachment Button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <button 
                    type="button" 
                    className="attach-button"
                    onClick={() => fileInputRef.current.click()}
                    title="Send File"
                >
                    {/* Attachment Icon (📎) */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="attach-icon">
                        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.657-7.657a.75.75 0 011.06 1.06l-7.656 7.657a5.25 5.25 0 11-7.424-7.424l10.94-10.94a3.75 3.75 0 115.304 5.303l-7.656 7.657a.75.75 0 01-1.06-1.06l7.657-7.657a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Send Button */}
                <button
                    type="submit"
                    onClick={handleSend}
                    disabled={text.trim() === ""}
                    className="send-button"
                >
                    {/* Send Icon (➡️) */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="send-icon">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.542 60.542 0 0018.445-8.986.75.75 0 000-1.218A60.542 60.542 0 003.478 2.405z" />
                    </svg>
                </button>
            </footer>

            {/* --- Delete Confirmation Modal --- */}
            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this message?</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
                            <button className="btn-confirm" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;