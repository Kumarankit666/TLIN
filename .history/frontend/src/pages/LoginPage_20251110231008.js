import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

// 🔑 Modal Component (Forgot Password Popup)
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Password Reset Request Sent!</h3>
        <p>
          We've sent a **password reset link** to your registered email address.
          Please check your inbox (and spam folder) to reset your password.
        </p>
        <button className="modal-close-btn" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
};
// ----------------------------------------------------

function LoginPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  // 🔑 New state for managing the popup
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // Function to handle the Forgot Password click
  const handleForgotPassword = (e) => {
    e.preventDefault();
    // 1. You would typically make an API call here to request a password reset email.
    // 2. Then, open the modal.
    setIsModalOpen(true);
  };


  // 🌌 Animated glowing dots (rest of the useEffect remains the same)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("3d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 4 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      glow: Math.random() * 40 + 30,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(10, 15, 30, 0.3)";
      ctx.fillRect(0, 0, width, height);

      dots.forEach((dot) => {
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.glow / 2);
        gradient.addColorStop(0, "rgba(56,189,248,0.9)");
        gradient.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();

        dot.x += dot.dx;
        dot.y += dot.dy;

        if (dot.x < 0 || dot.x > width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > height) dot.dy *= -1;
      });

      requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = { username, role };
    localStorage.setItem("user", JSON.stringify(user));
    navigate(role === "client" ? "/client-dashboard" : "/freelancer-dashboard");
  };

  return (
    <div className="auth-page">
      {/* Canvas Background */}
      <canvas ref={canvasRef} className="animated-bg"></canvas>

      {/* Glass Card */}
      <div className="login-card">
        <h2 className="login-title">Welcome Back </h2>
        <p className="subtitle">Login to continue your journey</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 🔑 'Forgot Password' button updated to open modal */}
          <div className="forgot-password-link">
            <button 
                type="button" 
                className="forgot-link-btn"
                onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <div className="role-select">
            <label className={`role-option ${role === "client" ? "active" : ""}`}>
              <input
                type="radio"
                value="client"
                checked={role === "client"}
                onChange={(e) => setRole(e.target.value)}
              />
              Client
            </label>
            <label className={`role-option ${role === "freelancer" ? "active" : ""}`}>
              <input
                type="radio"
                value="freelancer"
                checked={role === "freelancer"}
                onChange={(e) => setRole(e.target.value)}
              />
              Freelancer
            </label>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          <p className="register-text">
            Don’t have an account?{" "}
            <Link to="/register" className="register-link">
              Register here
            </Link>
          </p>
        </form>
      </div>
      
      {/* 🔑 Modal component is added here */}
      <ForgotPasswordModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default LoginPage;