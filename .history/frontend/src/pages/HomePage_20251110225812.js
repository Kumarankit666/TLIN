import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // 🌌 Particle Animation
  useEffect(() => {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    const count = 50;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * 0.6 - 0.3;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,255,0.6)";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00ffff";
        ctx.fill();
      }
    }

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };
    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      const moveX = (e.clientX / window.innerWidth - 0.5) * 10;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 10;
      canvas.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // 🧠 Typing Animation Trigger on Scroll
  useEffect(() => {
    const titles = document.querySelectorAll(
      ".hero-content h2, .why-choose h2, .how-it-works h2, .cta-section h2"
    );

    const handleScroll = () => {
      titles.forEach((title) => {
        const rect = title.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100 && !title.classList.contains("typing")) {
          title.classList.add("typing");
        }
      });

      const fadeEls = document.querySelectorAll(".fade-in-up");
      fadeEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
          el.classList.add("visible");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`homepage ${darkMode ? "dark" : "light"}`}>
      <canvas id="particle-canvas"></canvas>

      {/* ✅ Header */}
      <header className="homepage-header">
        <h1 className="logo">FreelancePro 🌐</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      {/* ✅ Hero Section */}
      <section className="hero fade-in-up">
        <div className="hero-content">
          <h2>Welcome to <span>FreelancePro</span></h2>
          <p>
            Find top freelancers and clients across the globe 🌍.
            Post projects, hire experts, and build your dream career — all in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn primary-btn">
              Get Started 🚀
            </Link>
            <Link to="/login" className="btn secondary-btn">
              Login 🔑
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Why Choose FreelancePro */}
      <section className="why-choose fade-in-up">
        <h2>Why Choose FreelancePro?</h2>
        <div className="features">
          <div className="feature">
            <div className="icon">🔍</div>
            <h3>Smart Search</h3>
            <p>Filter by skills, budget, and duration to find the perfect match.</p>
          </div>
          <div className="feature">
            <div className="icon">💬</div>
            <h3>Real-time Messaging</h3>
            <p>Communicate seamlessly with clients and freelancers.</p>
          </div>
          <div className="feature">
            <div className="icon">💲</div>
            <h3>Transparent Pricing</h3>
            <p>Clear proposals and contracts with no hidden fees.</p>
          </div>
          <div className="feature">
            <div className="icon">⭐</div>
            <h3>Reviews & Ratings</h3>
            <p>Build your reputation with verified client feedback.</p>
          </div>
        </div>
      </section>

      {/* ✅ How It Works (Below Why Choose) */}
      <section className="how-it-works fade-in-up">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">👥</div>
            <h3>Login or Signup</h3>
            <p>Join as a <b>Client</b> or <b>Freelancer</b> and create your profile easily.</p>
          </div>
          <div className="step">
            <div className="step-icon">📂</div>
            <h3>Post Project</h3>
            <p>Clients can post detailed projects to find the right freelancers.</p>
          </div>
          <div className="step">
            <div className="step-icon">🔎</div>
            <h3>Search & Apply</h3>
            <p>Freelancers can search, apply, and connect with clients instantly.</p>
          </div>
          <div className="step">
            <div className="step-icon">📨</div>
            <h3>Submit Work</h3>
            <p>Deliver your work, get reviewed, and grow your reputation.</p>
          </div>
        </div>
      </section>

      {/* ✅ CTA Section */}
      <section className="cta-section fade-in-up">
        <h2>Ready to Get Started?</h2>
        <p>
          Join thousands of freelancers and clients already working together on <b>FreelancePro</b>.
        </p>
        <Link to="/register" className="btn cta-btn">
          Create Free Account
        </Link>
      </section>

      {/* ✅ Footer */}
      <footer className="footer">
        <p>© 2025 Talen-link | Connect. Work. Grow.</p>
      </footer>
    </div>
  );
}

export default HomePage;
