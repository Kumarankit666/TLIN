import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function RegisterPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "freelancer",
  });
  const [loading, setLoading] = useState(false);

  // 🌌 Animated background dots (same as login) - इसमें कोई बदलाव नहीं है
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ⭐ हैंडल सबमिट फंक्शन में मुख्य बदलाव यहाँ है
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ⏳ 1.5 सेकंड का नकली लोडिंग टाइम (Backend-less Logic)
    setTimeout(() => {
      // 1. लोकल स्टोरेज में यूज़र डेटा सेव करें
      const userToStore = {
          id: Date.now(), // डमी id
          username: formData.username,
          email: formData.email,
          role: formData.role,
      };

      // 'user' key के तहत यूज़र ऑब्जेक्ट को JSON स्ट्रिंग के रूप में सेव करें
      localStorage.setItem("user", JSON.stringify(userToStore));
      
      console.log("✅ DUMMY Registration successful! Data saved to Local Storage:", userToStore);
      alert("🎉 Registration successful! Now please Login.");
      
      setLoading(false); // लोडिंग खत्म करें

      // 2. ⭐ यूज़र को सीधे लॉग इन पेज पर रीडायरेक्ट करें (role-based redirect हटा दिया गया)
      navigate("/login"); 

    }, 1500); // 1.5 सेकंड की देरी
  };

  return (
    <div className="auth-page">
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="animated-bg"></canvas>

      <div className="login-card">
        <h2 className="login-title">Create Account</h2>
        <p className="subtitle">Join Talent Link today and start your journey</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="👤 Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="📧 Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="🔑 Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="role-select">
            <label
              className={`role-option ${formData.role === "client" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="role"
                value="client"
                checked={formData.role === "client"}
                onChange={handleChange}
              />
              Client
            </label>

            <label
              className={`role-option ${formData.role === "freelancer" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="role"
                value="freelancer"
                checked={formData.role === "freelancer"}
                onChange={handleChange}
              />
              Freelancer
            </label>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "⏳ Registering..." : "🚀 Register"}
          </button>

          <p className="register-text">
            Already have an account?{" "}
            <Link to="/login" className="register-link">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;