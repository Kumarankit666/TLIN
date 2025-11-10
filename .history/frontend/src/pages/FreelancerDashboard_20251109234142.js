// ===============================
// FreelancerDashboard.js (Updated)
// ===============================
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import "./FreelancerDashboard.css";

function FreelancerDashboard() {
  const navigate = useNavigate();

  // 🌟 NEW STATES FOR PROFILE & ACCOUNT
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [trashData, setTrashData] = useState(
    JSON.parse(localStorage.getItem("trashData")) || []
  );

  // Existing states from your code
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAppliedList, setShowAppliedList] = useState(true);
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [selectedTrashProjects, setSelectedTrashProjects] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // ===============================
  // 🧠 PROFILE MENU + ACCOUNT DELETE LOGIC
  // ===============================
  const handleProfileMenuToggle = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleAccountDelete = () => {
    if (deleteConfirmText !== "DELETE") {
      alert('Please type "DELETE" to confirm.');
      return;
    }

    // Move data to Trash before clearing
    const allData = {
      freelancerApplications:
        JSON.parse(localStorage.getItem("freelancerApplications")) || [],
      notifications: JSON.parse(localStorage.getItem("notifications")) || [],
      archivedProjects:
        JSON.parse(localStorage.getItem("freelancerArchivedApplications")) || [],
      earnings: localStorage.getItem("freelancerTotalEarnings") || 0,
    };

    const updatedTrash = [...trashData, { ...allData, deletedAt: new Date() }];
    localStorage.setItem("trashData", JSON.stringify(updatedTrash));

    // Clear account-related data
    localStorage.removeItem("freelancerApplications");
    localStorage.removeItem("applications");
    localStorage.removeItem("freelancerArchivedApplications");
    localStorage.removeItem("freelancerTotalEarnings");
    localStorage.removeItem("notifications");

    setTrashData(updatedTrash);
    setShowDeletePopup(false);
    setDeleteConfirmText("");
    alert("Account deleted successfully!");
    navigate("/login");
  };

  // ===============================
  // 🧭 TOP NAVBAR (INSTEAD OF SIDEBAR)
  // ===============================
  const TopNavbar = () => (
    <div
      className="top-navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#1f2937",
        padding: "10px 20px",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* LEFT - NAV ITEMS */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <div
          onClick={() => {
            setShowReports(false);
            setShowTrash(false);
            setShowAppliedList(true);
          }}
          style={{ cursor: "pointer", fontWeight: "600" }}
        >
          📊 Dashboard
        </div>
        <div
          onClick={() => {
            setShowReports(true);
            setShowTrash(false);
            setShowAppliedList(false);
          }}
          style={{ cursor: "pointer", fontWeight: "600" }}
        >
          📈 Reports
        </div>
      </div>

      {/* RIGHT - PROFILE ICON */}
      <div style={{ position: "relative" }}>
        <div
          onClick={handleProfileMenuToggle}
          style={{
            cursor: "pointer",
            fontSize: "24px",
            userSelect: "none",
          }}
        >
          👤
        </div>

        {showProfileMenu && (
          <div
            className="profile-menu"
            style={{
              position: "absolute",
              right: 0,
              top: "40px",
              background: "white",
              color: "black",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              padding: "10px",
              minWidth: "160px",
            }}
          >
            <div
              className="profile-item"
              style={{ padding: "8px", cursor: "pointer" }}
              onClick={() => alert("Edit Profile Coming Soon...")}
            >
              ✏️ Edit Profile
            </div>
            <div
              className="profile-item"
              style={{ padding: "8px", cursor: "pointer" }}
              onClick={() => {
                setShowReports(false);
                setShowTrash(true);
                setShowAppliedList(false);
                setShowProfileMenu(false);
              }}
            >
              🗑️ Trash
            </div>
            <div
              className="profile-item"
              style={{ padding: "8px", cursor: "pointer" }}
              onClick={() => {
                setShowDeletePopup(true);
                setShowProfileMenu(false);
              }}
            >
              ⚙️ Account
            </div>
            <div
              className="profile-item"
              style={{ padding: "8px", cursor: "pointer", color: "red" }}
              onClick={() => navigate("/login")}
            >
              🚪 Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ===============================
  // YOUR ORIGINAL DASHBOARD CODE BELOW
  // ===============================
  // 🧠 NOTE: Main JSX me <TopNavbar /> add kiya gaya hai sabse upar

  return (
    <div className="container">
      <TopNavbar />

      {/* ====================== DELETE ACCOUNT POPUP ====================== */}
      {showDeletePopup && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#ef4444" }}>Delete Your Account</h2>
            <p>
              Type <b>DELETE</b> below to confirm deleting your account.
            </p>
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              style={{
                width: "90%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "15px",
              }}
            />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                className="dashboard-btn cancel"
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "10px 15px",
                  borderRadius: "8px",
                }}
                onClick={handleAccountDelete}
              >
                Confirm Delete
              </button>
              <button
                className="dashboard-btn"
                style={{
                  background: "#9ca3af",
                  color: "white",
                  padding: "10px 15px",
                  borderRadius: "8px",
                }}
                onClick={() => {
                  setShowDeletePopup(false);
                  setDeleteConfirmText("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💻 Your Full Existing Dashboard Code */}
      {/* Just paste the rest of your original code here, starting from your previous <div className="main"> ... */}
      {/* I haven’t removed or edited any old logic */}
    </div>
  );
}

export default FreelancerDashboard;
