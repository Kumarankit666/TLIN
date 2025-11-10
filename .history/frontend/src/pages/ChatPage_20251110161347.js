import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState({});
  const location = useLocation();

  // Get projectTitle and clientEmail from query params
  const queryParams = new URLSearchParams(location.search);
  const projectTitle = queryParams.get("projectTitle") || "Unknown Project";
  const clientEmail = queryParams.get("clientEmail") || "Unknown Client";

  const chatKey = `chatMessages_${projectTitle}`;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || { username: "Guest" };
    setUser(storedUser);

    const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
    setMessages(savedMessages);
  }, [chatKey]);

  const sendMessage = () => {
    if (text.trim() === "") return;

    const newMsg = {
      sender: user.username,
      text,
      time: new Date().toLocaleTimeString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(chatKey, JSON.stringify(updated));
    setText("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "90vh",
        width: "80%",
        margin: "20px auto",
        border: "1px solid #ccc",
        borderRadius: "10px",
        background: "#f9f9f9",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          textAlign: "center",
          padding: "15px 0",
          borderBottom: "1px solid #ddd",
          background: "#007bff",
          color: "white",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <h2 style={{ margin: 0 }}>💬 Chat Room</h2>
        <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>
          <strong>Project:</strong> {projectTitle} <br />
          <strong>Client:</strong> {clientEmail}
        </p>
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#777" }}>No messages yet</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.sender === user.username ? "flex-end" : "flex-start",
              background: msg.sender === user.username ? "#d1e7dd" : "#e2e3e5",
              padding: "10px 15px",
              borderRadius: "15px",
              maxWidth: "60%",
            }}
          >
            <strong>{msg.sender}</strong>
            <p style={{ margin: "5px 0" }}>{msg.text}</p>
            <small style={{ fontSize: "11px", color: "#555" }}>{msg.time}</small>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ddd",
          background: "white",
          borderRadius: "0 0 10px 10px",
        }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 15px",
            marginLeft: "8px",
            borderRadius: "50%",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatPage;
