import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { FaBell, FaEnvelope } from "react-icons/fa"; // Notification + Message icons

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Profile_Client from "./pages/Profile_Client";
import Profile_Freelancer from "./pages/Profile_Freelancer";
import MyProfile from "./pages/MyProfile";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ProjectsPage from "./pages/ProjectsPage";
import MyProjects from "./pages/MyProjects";
import PostProject from "./pages/PostProject";
import HomePage from "./pages/HomePage";
import ProjectsSearchPage from "./pages/ProjectsSearchPage";
import "./pages/Auth.css";
import { AiOutlineMail } from "react-icons/ai"; // Outline mail icon

// ✅ NEW IMPORT for Chat Page
import ChatPage from "./pages/ChatPage"; // <-- Added line

// ✅ Header Component
function HeaderBar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  let user = {
    username: "Guest",
    name: "Unknown",
    email: "example@mail.com",
    role: "User",
    profilePhoto: null,
  };

  try {
    const stored = localStorage.getItem("user");
    if (stored) user = JSON.parse(stored);
  } catch (err) {
    console.log("Invalid user data in localStorage");
  }

  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        background: theme === "dark" ? "#181818" : "#f0f4ff",
        color: theme === "dark" ? "#ffffff" : "#000000",
        borderBottom: theme === "dark" ? "1px solid #333" : "1px solid #dbeafe",
        position: "sticky",
        top: 0,
        zIndex: 100,
        transition: "0.3s ease-in-out",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          color: theme === "dark" ? "#90caf9" : "#007bff",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ⬅ Back
      </button>

      {/* Greeting */}
      <div style={{ fontSize: "18px", fontWeight: "600" }}>
        {greeting}, {user.username} 👋
      </div>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", position: "relative" }}>
        {/* Notification Icon */}
        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => alert("No new notifications!")}>
          <FaBell size={24} color={theme === "dark" ? "#fff" : "#333"} />
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            3
          </span>
        </div>

        {/* Message Icon */}
        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setMessageOpen(!messageOpen)}>
          <FaEnvelope size={24} color={theme === "dark" ? "#fff" : "#333"} />
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            1
          </span>

          {/* Message Dropdown */}
          {messageOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "35px",
                width: "300px",
                background: theme === "dark" ? "#222" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                borderRadius: "10px",
                padding: "10px",
                zIndex: 1000,
              }}
            >
              <h4 style={{ margin: "5px 0" }}>Messages</h4>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <p style={{ padding: "5px 0", borderBottom: "1px solid #ccc" }}>Message 1</p>
                <p style={{ padding: "5px 0", borderBottom: "1px solid #ccc" }}>Message 2</p>
                <p style={{ padding: "5px 0", borderBottom: "1px solid #ccc" }}>Message 3</p>
              </div>
              <button
                onClick={() => navigate("/chat")} // ✅ Go to chat page
                style={{
                  marginTop: "5px",
                  width: "100%",
                  padding: "6px 10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                💬 Open Chat
              </button>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div style={{ position: "relative" }}>
          <img
            src={user.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="Profile"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
              border: "2px solid #007bff",
            }}
          />

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50px",
                background: theme === "dark" ? "#222" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                width: "250px",
                padding: "15px",
                zIndex: 1000,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <img
                  src={user.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="Profile"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    marginBottom: "10px",
                  }}
                />
                <h3 style={{ margin: 0 }}>{user.username}</h3>
                <p style={{ margin: "5px 0", fontSize: "14px", opacity: 0.8 }}>{user.email}</p>
                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "13px",
                    background: "#007bff",
                    color: "white",
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "8px",
                  }}
                >
                  {user.role}
                </p>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/my-profile");
                  }}
                  style={{
                    marginTop: "10px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Layout Wrapper
function Layout({ children, theme, toggleTheme }) {
  const location = useLocation();

  const showTopBar =
    location.pathname.includes("dashboard") ||
    location.pathname.includes("projects") ||
    location.pathname.includes("my-projects") ||
    location.pathname.includes("post-project");

  return (
    <div
      style={{
        padding: "20px",
        position: "relative",
        background: theme === "dark" ? "#121212" : "#ffffff",
        color: theme === "dark" ? "#eaeaea" : "#000000",
        minHeight: "100vh",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {showTopBar && <HeaderBar theme={theme} toggleTheme={toggleTheme} />}
      {children}
    </div>
  );
}

// ✅ Main App Component
function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Router>
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/client-profile" element={<Profile_Client />} />
          <Route path="/freelancer-profile" element={<Profile_Freelancer />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects-search" element={<ProjectsSearchPage />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/post-project" element={<PostProject />} />
          <Route path="/homepage" element={<HomePage />} />

          {/* ✅ NEW CHAT ROUTE */}
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
