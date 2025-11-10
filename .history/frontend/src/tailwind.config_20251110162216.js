// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aapke content files ko yahaan specify karein
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // --- Custom Animations Definitions ---
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '.8' },
        }
      },
      // --- Apply Keyframes to CSS Classes ---
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // Agar aap custom scrollbar chahte hain, toh pehle yeh plugin install karna hoga:
    // require('tailwindcss-scrollbar'), 
  ],
};