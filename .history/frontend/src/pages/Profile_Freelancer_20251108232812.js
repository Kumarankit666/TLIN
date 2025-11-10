import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate hook का उपयोग करेंगे

// Note: यह मानकर चल रहे हैं कि आप Tailwind CSS का उपयोग कर रहे हैं। 
// अगर नहीं, तो आपको अपनी CSS फ़ाइल में 'profile-container', 'profile-card' आदि की स्टाइलिंग जोड़नी होगी।

function Profile_Freelancer() {
    const navigate = useNavigate();
    
    // ⭐ Initial state with necessary fields
    const [profile, setProfile] = useState({
        name: "", // User's name from Local Storage
        email: "", // User's email from Local Storage
        contact: "",
        skills: "", // Freelancer specific
        hourlyRate: "", // Freelancer specific
        bio: "",
    });
    
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        // Local Storage से यूज़र और प्रोफ़ाइल डेटा लोड करें
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const storedProfile = JSON.parse(localStorage.getItem("freelancer_profile"));

        if (!storedUser || storedUser.role !== 'freelancer') {
            // अगर user logged in नहीं है या role freelancer नहीं है
            setStatusMessage("⚠️ Please log in as a Freelancer first.");
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setProfile((prev) => ({ 
            ...prev, 
            name: storedUser.username || "",
            email: storedUser.email || "",
            ...(storedProfile || {}), // Load existing profile data if available
        }));

        setLoading(false);
    }, [navigate]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // हम केवल Editable fields को ही save करेंगे
            const profileDataToSave = {
                contact: profile.contact,
                skills: profile.skills,
                hourlyRate: profile.hourlyRate,
                bio: profile.bio,
            };
            
            localStorage.setItem("freelancer_profile", JSON.stringify(profileDataToSave));
            
            setStatusMessage("✅ Profile Saved! Redirecting to dashboard...");
            
            // ⭐ प्रोफाइल सेव होने के बाद डैशबोर्ड पर रीडायरेक्ट करें
            setTimeout(() => navigate('/freelancer-dashboard'), 1500);

        } catch (error) {
            console.error("❌ Error saving profile:", error);
            setStatusMessage("❌ Error saving profile. Please try again.");
        }
    };
    
    // Show loading state or message
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <p className="text-xl">Loading profile data...</p>
            </div>
        );
    }

    return (
        <div className="profile-container min-h-screen flex justify-center items-center bg-gray-900 p-4">
            <div className="profile-card bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full">
                <h2 className="text-3xl font-bold text-sky-400 mb-2 text-center">✨ Freelancer Profile Setup</h2>
                <p className="text-gray-400 mb-8 text-center">
                    Tell us about your skills and rates to start getting hired.
                </p>
                
                {statusMessage && (
                    <div className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${statusMessage.startsWith('✅') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {statusMessage}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Name & Email (Disabled) */}
                    <input 
                        type="text" 
                        name="name" 
                        value={profile.name} 
                        disabled 
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed"
                        placeholder="Full Name (Auto-filled)"
                    />
                    <input 
                        type="email" 
                        name="email" 
                        value={profile.email} 
                        disabled 
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed"
                        placeholder="Email (Auto-filled)"
                    />

                    {/* Contact No. */}
                    <input 
                        type="text" 
                        name="contact" 
                        value={profile.contact} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-sky-500 focus:border-sky-500"
                        placeholder="📞 Contact No."
                    />

                    {/* Skills */}
                    <input 
                        type="text" 
                        name="skills" 
                        value={profile.skills} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-sky-500 focus:border-sky-500"
                        placeholder="💡 Your Skills (e.g., React, Python, UI/UX, Writing)"
                    />
                    
                    {/* Hourly Rate */}
                    <div className="flex items-center space-x-3">
                        <label className="text-gray-300 w-32 shrink-0">Hourly Rate ($):</label>
                        <input 
                            type="number" 
                            name="hourlyRate" 
                            value={profile.hourlyRate} 
                            onChange={handleChange} 
                            min="5" 
                            required 
                            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-sky-500 focus:border-sky-500"
                            placeholder="50"
                        />
                    </div>

                    {/* Bio/Description */}
                    <textarea 
                        name="bio" 
                        value={profile.bio} 
                        onChange={handleChange} 
                        required 
                        rows="4"
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-sky-500 focus:border-sky-500 resize-none"
                        placeholder="✍️ Write a professional bio (2-3 lines) highlighting your experience..." 
                    />

                    <button type="submit" className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg rounded-lg transition-all shadow-lg shadow-sky-900/50">
                        🚀 Complete Profile Setup
                    </button>
                    <button type="button" onClick={() => navigate('/freelancer-dashboard')} className="w-full text-sm text-gray-400 hover:text-sky-400 transition-colors">
                        Go to Dashboard (Skip)
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile_Freelancer;