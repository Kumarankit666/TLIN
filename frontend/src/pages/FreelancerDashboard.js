import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FreelancerDashboard.css";

function FreelancerDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAppliedList, setShowAppliedList] = useState(false);
  const [appliedProjects, setAppliedProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    budget: "",
    deadline: "",
    reason: "",
  });

  const [showAcceptedPopup, setShowAcceptedPopup] = useState(false);
  const [status, setStatus] = useState("In Process");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("clientProjects")) || [];
    setProjects(stored);

    const applied = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    setAppliedProjects(applied);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
      setAppliedProjects(updatedApps);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchTerm.trim() === "") {
        setFiltered([]);
      } else {
        const result = projects.filter((proj) =>
          proj.skills.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFiltered(result);
      }
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();

    const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const existingApp = freelancerApps.find(
      (app) => app.projectTitle === selectedProject.title
    );

    if (existingApp) {
      if (existingApp.status === "Accepted") {
        alert("✅ You are already in this project");
        setShowForm(false);
        return;
      } else if (existingApp.status === "Pending") {
        alert("⏳ You have already applied for this project");
        setShowForm(false);
        return;
      }
    }

    const application = {
      projectTitle: selectedProject.title,
      skills: selectedProject.skills,
      budget: selectedProject.budget,
      deadline: selectedProject.deadline,
      description: selectedProject.description || "No description available",
      ...formData,
      status: "Pending",
      appliedAt: new Date().toLocaleString(),
    };

    const storedApps = JSON.parse(localStorage.getItem("applications")) || [];
    storedApps.push(application);
    localStorage.setItem("applications", JSON.stringify(storedApps));

    freelancerApps.push(application);
    localStorage.setItem("freelancerApplications", JSON.stringify(freelancerApps));

    setAppliedProjects(freelancerApps);
    alert(`✅ Application submitted for ${selectedProject.title}!`);

    setFormData({
      name: "",
      email: "",
      budget: "",
      deadline: "",
      reason: "",
    });
    setShowForm(false);
  };

  const handleAcceptedProjectClick = (app) => {
    const latest = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const matched = latest.find(
      (a) => a.projectTitle === app.projectTitle && a.email === app.email
    ) || app;
    setSelectedProject(matched);
    const initialStatus = matched.projectStatus || matched.proposedStatus || "In Process";
    setStatus(initialStatus);
    setShowAcceptedPopup(true);
  };

  const handleSaveStatusProposal = () => {
    if (!selectedProject) return;

    const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const applications = JSON.parse(localStorage.getItem("applications")) || [];

    const updatedFreelancer = freelancerApps.map((a) => {
      if (a.projectTitle === selectedProject.projectTitle && a.email === selectedProject.email) {
        if (a.awaitingApproval) {
          return a;
        }
        return {
          ...a,
          proposedStatus: status,
          awaitingApproval: true,
          proposedAt: new Date().toLocaleString(),
        };
      }
      return a;
    });

    const updatedApplications = applications.map((a) => {
      if (a.projectTitle === selectedProject.projectTitle && a.email === selectedProject.email) {
        if (a.awaitingApproval) return a;
        return {
          ...a,
          proposedStatus: status,
          awaitingApproval: true,
          proposedAt: new Date().toLocaleString(),
        };
      }
      return a;
    });

    localStorage.setItem("freelancerApplications", JSON.stringify(updatedFreelancer));
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    setAppliedProjects(updatedFreelancer);

    const updatedSel = updatedFreelancer.find(
      (a) => a.projectTitle === selectedProject.projectTitle && a.email === selectedProject.email
    );
    setSelectedProject(updatedSel);

    alert("✅ Status proposed. Waiting for client approval.");
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleChat = () => {
    if (!selectedProject) return;
    const clientEmail = selectedProject.clientEmail || "unknown@example.com";
    navigate(`/chat?projectTitle=${encodeURIComponent(selectedProject.projectTitle)}&clientEmail=${encodeURIComponent(clientEmail)}`);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="nav-item" onClick={() => navigate("/freelancer-dashboard")}>
          📊 Dashboard
        </div>
        <div className="nav-item" onClick={() => navigate("/projects")}>
          📁 Projects
        </div>
        <div className="nav-item" onClick={() => navigate("/projects-search")}>
          🔍 Find Projects
        </div>
        <div className="nav-item">💰 Invoices</div>
        <div className="nav-item">📈 Reports</div>
      </div>

      <div className="main">
        <div className="metrics">
          <div className="metric-card">
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>₹12,8700</div>
            <div>Earnings</div>
          </div>

          <div
            className="metric-card"
            style={{ cursor: "pointer" }}
            onClick={() => setShowAppliedList(!showAppliedList)}
          >
            <div style={{ fontSize: "24px" }}>
              📨 Total Applied: {appliedProjects.length}
            </div>
            <div>Click to view</div>
          </div>

          <div className="metric-card">
            <div style={{ fontSize: "24px" }}>Rank: 87</div>
            <div>45 Projects</div>
          </div>
        </div>

        {showAppliedList && (
          <div
            style={{
              background: "#f8f9fa",
              borderRadius: "10px",
              padding: "20px",
              marginTop: "15px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3>📋 Your Applied Projects</h3>
            {appliedProjects.length > 0 ? (
              appliedProjects.map((app, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    cursor: app.status === "Accepted" ? "pointer" : "default",
                    transition: "0.3s",
                  }}
                  onClick={() =>
                    app.status === "Accepted" && handleAcceptedProjectClick(app)
                  }
                >
                  <strong style={{ fontSize: "18px" }}>{app.projectTitle}</strong>
                  <p style={{ margin: "5px 0" }}>
                    Status:{" "}
                    <span
                      style={{
                        color:
                          app.status === "Accepted"
                            ? "green"
                            : app.status === "Rejected"
                            ? "red"
                            : "orange",
                        fontWeight: "bold",
                      }}
                    >
                      {app.status}
                    </span>
                  </p>
                  <p style={{ fontSize: "13px", color: "#555" }}>
                    Applied on: {app.appliedAt}
                  </p>

                  {app.awaitingApproval && (
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#6c757d" }}>
                      ⏳ Status proposed: <b>{app.proposedStatus}</b> (awaiting client approval)
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No applications yet 🚫</p>
            )}
          </div>
        )}

        <div style={{ margin: "20px 0" }}>
          <input
            type="text"
            placeholder="Search projects by skill and press Enter..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            style={{
              width: "60%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </div>

        {searchTerm && (
          <>
            {filtered.length > 0 ? (
              <div>
                {filtered.map((proj, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f3f4f6",
                      padding: "15px",
                      borderRadius: "10px",
                      marginBottom: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div>
                      <h3 style={{ marginBottom: "5px" }}>{proj.title}</h3>
                      <p>
                        <strong>Skills:</strong> {proj.skills}
                      </p>
                      <p>
                        <strong>Budget:</strong> ₹{proj.budget}
                      </p>
                      <p>
                        <strong>Deadline:</strong> {proj.deadline}
                      </p>
                    </div>

                    <button
                      className="apply-btn"
                      onClick={() => {
                        setSelectedProject(proj);
                        setShowForm(true);
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No matching projects found ❌</p>
            )}
          </>
        )}
      </div>

      {/* ✅ Apply Form Popup */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Apply for {selectedProject?.title}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Proposed Budget (₹)"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
              <input
                type="date"
                placeholder="Deadline"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
              <textarea
                placeholder="Why should client hire you?"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
              <div className="form-buttons">
                <button type="submit" className="submit-btn">Submit</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accepted Project Popup */}
      {showAcceptedPopup && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "500px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#007bff" }}>
              {selectedProject?.projectTitle}
            </h2>

            <div
              style={{
                background: "#fff",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <p><strong>💰 Budget:</strong> ₹{selectedProject?.budget}</p>
              <p><strong>📅 Deadline:</strong> {selectedProject?.deadline}</p>
              <p><strong>🧠 Skills:</strong> {selectedProject?.skills}</p>
              <p><strong>📝 Description:</strong> {selectedProject?.description}</p>

              {selectedProject?.awaitingApproval && (
                <p style={{ marginTop: "8px", color: "#6c757d" }}>
                  ⏳ Proposed: <b>{selectedProject.proposedStatus}</b> (sent on {selectedProject.proposedAt})
                </p>
              )}
            </div>

            <label style={{ fontWeight: "bold" }}>Project Status</label>
            <select
              value={status}
              onChange={handleStatusChange}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "15px",
              }}
              disabled={selectedProject?.awaitingApproval ? true : false}
            >
              <option>In Process</option>
              <option>Completed</option>
            </select>

            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="dashboard-btn"
                style={{
                  background: selectedProject?.awaitingApproval ? "#6c757d" : "#007bff",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: selectedProject?.awaitingApproval ? "not-allowed" : "pointer",
                }}
                onClick={() => {
                  if (selectedProject?.awaitingApproval) {
                    alert("⏳ Waiting for client to approve/reject previous proposal.");
                    return;
                  }
                  handleSaveStatusProposal();
                }}
              >
                💾 Save (Propose)
              </button>

              <button
                className="dashboard-btn"
                style={{
                  background: "#28a745",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
                onClick={handleChat}
              >
                💬 Chat with Client
              </button>

              <button
                className="dashboard-btn cancel"
                style={{
                  background: "#dc3545",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
                onClick={() => setShowAcceptedPopup(false)}
              >
                ❌ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FreelancerDashboard;
