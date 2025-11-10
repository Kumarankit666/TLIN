import React, { useState, useEffect } from "react";
import "./Auth.css";

function Profile_Freelancer() {
  const [profile, setProfile] = useState({
  name: "",
  email: "",
  contact: "",
  skills: "",
  hourly_rate: "",
  available: "",
});

  // ✅ Auto-fill email from localStorage after register
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.email) {
      setProfile((prev) => ({ ...prev, email: storedUser.email }));
    }
  }, []);

  // ✅ Update input values
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // ✅ Save profile to Django backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access"); // JWT token from login
    if (!token) {
      alert("❌ Please login first!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/freelancer/profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contact: profile.contact,
          skills: profile.skills,
          hourly_rate: profile.hourly_rate, // match Django field
          available: profile.available,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Saved to backend:", data);
        alert("✅ Freelancer Profile Saved Successfully in Backend!");
      } else {
        const errorData = await response.json();
        console.error("❌ Error saving profile:", errorData);
        alert("❌ Failed to save profile: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Something went wrong while saving profile!");
    }
  };

  return (
    <div className="auth-container">
      <h2>💻 Freelancer Profile</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={profile.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profile.email}
          disabled
        />

        <input
          type="text"
          name="contact"
          placeholder="Contact No."
          value={profile.contact}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="skills"
          placeholder="Skills (e.g. React, Django)"
          value={profile.skills}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="hourly_rate"
          placeholder="Hourly Rate ($)"
          value={profile.hourly_rate}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="available"
          placeholder="Availability (hrs/day)"
          value={profile.available}
          onChange={handleChange}
          required
        />

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}

export default Profile_Freelancer;
