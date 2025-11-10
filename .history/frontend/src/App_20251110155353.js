import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Profile_Client from "./pages/Profile_Client";
import Profile_Freelancer from "./pages/Profile_Freelancer";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ProjectsPage from "./pages/ProjectsPage";
import MyProjects from "./pages/MyProjects";
import PostProject from "./pages/PostProject";
import HomePage from "./pages/HomePage";
import ProjectsSearchPage from "./pages/ProjectsSearchPage";
import "./pages/Auth.css";
import ChatPage from "./pages/ChatPage";

// ✅ Header Component (profile + message + my profile parts removed)
function HeaderBar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  let user = {
    username: "Guest",
  };

  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

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

      {/* Empty right section (profile logo removed) */}
      <div></div>
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
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects-search" element={<ProjectsSearchPage />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/post-project" element={<PostProject />} />
          <Route path="/homepage" element={<HomePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
