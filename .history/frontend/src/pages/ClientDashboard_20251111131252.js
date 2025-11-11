import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // ✅ Profile Icon

// --- COLOR CONSTANTS ---
const colors = {
  primary: "#6f42c1",
  secondary: "#fd7e14",
  success: "#20c997",
  danger: "#dc3545",
  info: "#007bff",
  warning: "#ffc107",
  background: "#f0f7f8ff",
  cardBackground: "#ffffff",
  text: "#343a40",
  lightText: "#6c757d",
};

// --- MAIN COMPONENT ---
function ClientDashboard() {
  const navigate = useNavigate();

  // ✅ Profile States
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("clientName") || "",
    company: localStorage.getItem("clientCompany") || "",
    bio: localStorage.getItem("clientBio") || "",
    photo: localStorage.getItem("clientPhoto") || "",
    budgetRange: localStorage.getItem("clientBudgetRange") || "",
    hiringFrequency: localStorage.getItem("clientHiringFrequency") || "Occasional",
    role: "Client",
  });

  // ✅ Close profile popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showProfilePopup &&
        !e.target.closest(".profile-icon") &&
        !e.target.closest(".profile-popup")
      ) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showProfilePopup]);

  return (
    <div
      style={{
        padding: "40px 30px",
        background: "linear-gradient(135deg, #e0f7fa 0%, #f9fbe7 100%)",
        minHeight: "100vh",
        position: "relative",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ margin: 0, color: colors.primary }}>📊 Client Dashboard</h2>

        {/* TOP RIGHT ICONS */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* 👤 PROFILE ICON */}
          <div
            className="profile-icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowProfilePopup(!showProfilePopup);
            }}
            style={{
              cursor: "pointer",
              fontSize: "34px",
              color: colors.primary,
            }}
          >
            <FaUserCircle />
          </div>

          {/* 🧠 PROFILE POPUP MENU */}
          {showProfilePopup && (
            <div
              className="profile-popup"
              style={{
                position: "absolute",
                top: "60px",
                right: "0px",
                background: "white",
                boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
                borderRadius: "12px",
                padding: "15px",
                width: "200px",
                zIndex: 2000,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <button
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowEditModal(true);
                  setShowProfilePopup(false);
                }}
              >
                ✏️ Edit Profile
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigate("/login");
                  localStorage.removeItem("isLoggedIn");
                }}
              >
                🚪 Logout
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px",
                  textAlign: "left",
                  color: "red",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowProfilePopup(false);
                }}
              >
                ❌ Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======= WELCOME MESSAGE ======= */}
      <div
        style={{
          background: colors.cardBackground,
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <h3 style={{ color: colors.primary }}>
          👋 Welcome {profileData.name || "Client"}!
        </h3>
        <p style={{ color: colors.lightText, margin: 0 }}>
          {profileData.company
            ? `Company: ${profileData.company}`
            : "Complete your profile to personalize your dashboard."}
        </p>
      </div>

      {/* ======= YOUR PROJECTS (Placeholder for Future) ======= */}
      <div
        style={{
          background: colors.cardBackground,
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: colors.primary }}>📝 Your Projects</h3>
        <p style={{ color: colors.lightText }}>
          Projects management system coming soon...
        </p>
      </div>

      {/* ======= EDIT PROFILE MODAL ======= */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "25px",
              width: "400px",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: colors.primary }}>Edit Profile</h2>

            {/* PHOTO */}
            <div style={{ marginBottom: "15px" }}>
              {profileData.photo ? (
                <img
                  src={profileData.photo}
                  alt="Profile"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${colors.primary}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "#f1f1f1",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: colors.primary,
                  }}
                >
                  📸
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () =>
                      setProfileData({ ...profileData, photo: reader.result });
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <input
              type="text"
              placeholder="Full Name"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />

            <input
              type="text"
              placeholder="Company / Organization"
              value={profileData.company}
              onChange={(e) =>
                setProfileData({ ...profileData, company: e.target.value })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />

            <textarea
              placeholder="Bio"
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({ ...profileData, bio: e.target.value })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            ></textarea>

            <input
              type="text"
              placeholder="Budget Range (e.g. $500 - $5000)"
              value={profileData.budgetRange}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  budgetRange: e.target.value,
                })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />

            <select
              value={profileData.hiringFrequency}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  hiringFrequency: e.target.value,
                })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            >
              <option value="Occasional">Occasional</option>
              <option value="Frequent">Frequent</option>
              <option value="Full-time Hiring">Full-time Hiring</option>
            </select>

            <input
              type="text"
              value={profileData.role}
              readOnly
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                background: "#f5f5f5",
                textAlign: "center",
                color: colors.primary,
                fontWeight: "bold",
              }}
            />

            <button
              style={{
                background: colors.primary,
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 20px",
                marginRight: "10px",
              }}
              onClick={() => {
                localStorage.setItem("clientName", profileData.name);
                localStorage.setItem("clientCompany", profileData.company);
                localStorage.setItem("clientBio", profileData.bio);
                localStorage.setItem("clientPhoto", profileData.photo);
                localStorage.setItem(
                  "clientBudgetRange",
                  profileData.budgetRange
                );
                localStorage.setItem(
                  "clientHiringFrequency",
                  profileData.hiringFrequency
                );
                alert("✅ Profile Updated Successfully!");
                setShowEditModal(false);
              }}
            >
              💾 Save
            </button>

            <button
              style={{
                background: "gray",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 20px",
              }}
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ======= DELETE CONFIRMATION MODAL ======= */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 4000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "25px",
              width: "350px",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "red" }}>⚠️ Confirm Account Deletion</h3>
            <p>
              Type <b>delete</b> to permanently remove your account.
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type delete..."
              style={{
                width: "80%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            />
            <div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ marginRight: "10px", padding: "8px 15px" }}
              >
                Cancel
              </button>
              <button
                style={{
                  background: "red",
                  color: "white",
                  padding: "8px 15px",
                  border: "none",
                  borderRadius: "6px",
                }}
                onClick={() => {
                  if (deleteInput.toLowerCase() === "delete") {
                    alert("❌ Account deleted permanently!");
                    localStorage.clear();
                    navigate("/register");
                  } else {
                    alert("Please type 'delete' to confirm.");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;
