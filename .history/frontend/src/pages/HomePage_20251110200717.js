import React, { useState, useEffect, useCallback } from "react";
// Imports are correct for local development:
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- Environment Setup (FIXED for Local Development) ---
// These global variables are not available locally. We replace them with placeholders.
// NOTE: If you want this app to connect to YOUR Firebase project, you must replace the
// values in localFirebaseConfig with your actual configuration object.
const localFirebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const appId = 'local-dev-app-id'; // Using a placeholder ID for local context
const firebaseConfig = localFirebaseConfig; // Using the placeholder config above
const initialAuthToken = null; // Custom token is not available locally

// Main component, must be named App
const App = () => {
  // --- Firebase State and Hooks ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState(true);

  // Application State
  const [darkMode, setDarkMode] = useState(true); // Default to Dark Mode for the neon aesthetic

  // 1. Initialization and Authentication
  useEffect(() => {
    try {
      // Safety check to ensure the config is not empty (which would happen if user forgets to replace placeholder)
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
        console.warn("WARNING: Using placeholder Firebase config. Authentication will default to Anonymous.");
      }
      
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authentication = getAuth(app);
      // setLogLevel('debug'); // Uncomment for debugging in console

      setDb(firestore);
      setAuth(authentication);

      const unsubscribe = onAuthStateChanged(authentication, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // In local dev, we always sign in anonymously as the custom token is null
          const anonUser = await signInAnonymously(authentication);
          setUserId(anonUser.user.uid);
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      // This catch is crucial if the user has an invalid localFirebaseConfig structure
      console.error("Firebase initialization or auth error:", error);
      setIsAuthReady(true); 
    }
  }, []);

  // Determine the Firestore Document Reference for theme settings
  const themeDocRef = db && userId
    ? doc(db, `artifacts/${appId}/users/${userId}/settings/theme_doc`)
    : null;

  // 2. Theme Listener (Replaces localStorage.getItem)
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

    // Listen for real-time theme changes
    const unsubscribe = onSnapshot(themeDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDarkMode(data.theme === 'dark');
      } else {
        // Document doesn't exist, set default to dark mode in Firestore
        setDoc(themeDocRef, { theme: 'dark' }, { merge: true })
          .catch(e => console.error("Error setting default theme:", e));
      }
      setLoadingTheme(false);
    }, (error) => {
      console.error("Error subscribing to theme:", error);
      setLoadingTheme(false);
    });

    return () => unsubscribe();
  }, [isAuthReady, db, userId, themeDocRef]);

  // 3. Theme Toggle Handler (Replaces localStorage.setItem)
  const toggleDarkMode = () => {
    if (!themeDocRef) return;
    const newTheme = !darkMode;
    setDoc(themeDocRef, { theme: newTheme ? 'dark' : 'light' }, { merge: true })
      .catch(e => console.error("Error toggling theme:", e));
    // Optimistically update UI
    setDarkMode(newTheme);
  };

  // Apply dark/light classes to HTML root element for Tailwind
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);


  // --- Canvas Particle Animation Logic ---
  useEffect(() => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    const count = window.innerWidth > 768 ? 80 : 40; // Fewer particles on mobile
    let animationFrameId;

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
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
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
        // Dynamic color based on theme
        const color = darkMode ? "rgba(0, 255, 255, 0.6)" : "rgba(0, 150, 255, 0.6)";
        const shadowColor = darkMode ? "#00ffff" : "#0096ff";
        
        ctx.fillStyle = color;
        ctx.shadowBlur = darkMode ? 10 : 5;
        ctx.shadowColor = shadowColor;
        ctx.fill();
      }
    }

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };
    createParticles();

    const animate = () => {
      // Clear the canvas with a transparent layer for subtle trails
      ctx.fillStyle = darkMode ? "rgba(17, 24, 39, 0.05)" : "rgba(249, 250, 251, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 🖱️ Mouse parallax
    const handleMouseMove = (e) => {
      const moveX = (e.clientX / window.innerWidth - 0.5) * 15;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 15;
      canvas.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [darkMode]);

  // --- Rendering UI ---

  // Show a basic loader while checking auth and loading theme
  if (loadingTheme || !isAuthReady) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-cyan-400">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mr-3"></div>
            Loading FreelancePro...
        </div>
    );
  }

  // Display user ID for multi-user context (required for Firestore rules)
  const displayUserId = userId || "Guest";

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 overflow-hidden font-sans">
      
      {/* Canvas for Particle Background */}
      <canvas id="particle-canvas" className="absolute top-0 left-0 w-full h-full z-0 transition-opacity duration-500 opacity-70"></canvas>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 sm:p-8">
        
        {/* Header (Top Nav) */}
        <header className="flex justify-between items-center py-4 px-2 md:px-4 bg-white/5 backdrop-blur-sm rounded-xl shadow-lg border border-cyan-500/30">
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400">
            Freelance<span className="text-pink-400">Pro</span> 🌐
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-400 hidden sm:block">
                User: {displayUserId.substring(0, 8)}...
            </span>
            <button
              className="px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300
                         bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-500/50"
              onClick={toggleDarkMode}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-grow flex items-center justify-center py-20">
          <div className="max-w-4xl text-center p-8 sm:p-12 bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-pink-400/50 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-pink-500/20">
            <h2 className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight">
              Welcome to 
              <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                FreelancePro
              </span>
            </h2>
            <p className="text-lg sm:text-xl font-light mb-8 max-w-2xl mx-auto dark:text-gray-300 text-gray-700">
              Find top freelancers and clients across the globe 🌍. Post projects, hire experts, and build your dream career — all in one streamlined platform.
            </p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a href="/register"
                className="btn primary-btn block w-full sm:w-auto px-10 py-3 rounded-full text-lg font-bold transition-all duration-300 transform 
                           bg-cyan-500 hover:bg-cyan-600 text-gray-900 shadow-xl shadow-cyan-500/40 hover:scale-105"
              >
                Get Started 🚀
              </a>
              <a href="/login"
                className="btn secondary-btn block w-full sm:w-auto px-10 py-3 rounded-full text-lg font-bold transition-all duration-300 transform 
                           bg-pink-500 hover:bg-pink-600 text-white shadow-xl shadow-pink-500/40 hover:scale-105"
              >
                Login 🔑
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-4 text-center text-sm font-light text-gray-500 dark:text-gray-400 bg-white/5 backdrop-blur-sm rounded-lg mt-auto">
          <p>© 2025 FreelancePro | Connect. Work. Grow.</p>
          <p className="text-xs mt-1">
            Data saved via Firestore for persistence. User ID: {displayUserId}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;