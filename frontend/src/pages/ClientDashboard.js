import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("clientProjects")) || [];
    const savedApplications = JSON.parse(localStorage.getItem("applications")) || [];
    setProjects(savedProjects);
    setApplications(savedApplications);
  }, []);

  const saveProjects = (updated) => {
    setProjects(updated);
    localStorage.setItem("clientProjects", JSON.stringify(updated));
  };

  const handleDeleteProject = (index) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updated = [...projects];
      updated.splice(index, 1);
      saveProjects(updated);
    }
  };

  const handleEditSave = () => {
    const updated = projects.map((p) =>
      p.title === editProject.title ? editProject : p
    );
    saveProjects(updated);
    setEditProject(null);
  };

  const getApplicationsForProject = (title) =>
    applications.filter((app) => app.projectTitle === title);

  // ✅ Accept / Reject freelancer application
  const handleStatusChange = (index, newStatus, title) => {
    const updated = [...applications];
    const target = updated.filter((app) => app.projectTitle === title)[index];
    if (!target) return;

    const newAppList = applications.map((app) =>
      app.projectTitle === title && app.email === target.email
        ? { ...app, status: newStatus }
        : app
    );
    setApplications(newAppList);
    localStorage.setItem("applications", JSON.stringify(newAppList));

    const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const updatedFreelancerApps = freelancerApps.map((app) =>
      app.projectTitle === title && app.email === target.email
        ? { ...app, status: newStatus }
        : app
    );
    localStorage.setItem("freelancerApplications", JSON.stringify(updatedFreelancerApps));

    alert(`Application ${newStatus} successfully!`);
  };

  // ✅ Approve freelancer proposed status
  const handleApproveProposal = (email, title) => {
    const apps = JSON.parse(localStorage.getItem("applications")) || [];
    const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const clientProjects = JSON.parse(localStorage.getItem("clientProjects")) || [];

    const updatedApps = apps.map((a) => {
      if (a.projectTitle === title && a.email === email) {
        return {
          ...a,
          projectStatus: a.proposedStatus || a.projectStatus || null,
          awaitingApproval: false,
          approvedByClient: true,
          approvedAt: new Date().toLocaleString(),
          proposedStatus: undefined,
          proposedAt: undefined,
        };
      }
      return a;
    });

    const updatedFreelancerApps = freelancerApps.map((a) => {
      if (a.projectTitle === title && a.email === email) {
        return {
          ...a,
          projectStatus: a.proposedStatus || a.projectStatus || null,
          awaitingApproval: false,
          approvedByClient: true,
          approvedAt: new Date().toLocaleString(),
          proposedStatus: undefined,
          proposedAt: undefined,
        };
      }
      return a;
    });

    const updatedProjects = clientProjects.map((p) => {
      if (p.title === title) {
        const newStatus = updatedApps.find((a) => a.projectTitle === title)?.projectStatus;
        if (newStatus) p.status = newStatus;
      }
      return p;
    });

    localStorage.setItem("applications", JSON.stringify(updatedApps));
    localStorage.setItem("freelancerApplications", JSON.stringify(updatedFreelancerApps));
    localStorage.setItem("clientProjects", JSON.stringify(updatedProjects));
    setApplications(updatedApps);
    setProjects(updatedProjects);

    alert("✅ Freelancer status approved and project status updated.");
  };

  // ❌ Reject freelancer proposed status
  const handleRejectProposal = (email, title) => {
    const apps = JSON.parse(localStorage.getItem("applications")) || [];
    const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];

    const updatedApps = apps.map((a) => {
      if (a.projectTitle === title && a.email === email) {
        return {
          ...a,
          awaitingApproval: false,
          clientRejected: true,
          clientRejectedAt: new Date().toLocaleString(),
          proposedStatus: undefined,
          proposedAt: undefined,
        };
      }
      return a;
    });

    const updatedFreelancerApps = freelancerApps.map((a) => {
      if (a.projectTitle === title && a.email === email) {
        return {
          ...a,
          awaitingApproval: false,
          clientRejected: true,
          clientRejectedAt: new Date().toLocaleString(),
          proposedStatus: undefined,
          proposedAt: undefined,
        };
      }
      return a;
    });

    localStorage.setItem("applications", JSON.stringify(updatedApps));
    localStorage.setItem("freelancerApplications", JSON.stringify(updatedFreelancerApps));
    setApplications(updatedApps);
    alert("❌ Freelancer's proposed status was not approved.");
  };

  // ✅ NEW: Chat navigation
  const handleChatOpen = (projectTitle, freelancerEmail) => {
    navigate(`/chat?projectTitle=${encodeURIComponent(projectTitle)}&freelancerEmail=${encodeURIComponent(freelancerEmail)}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>📊 Client Dashboard</h2>
        <button
          onClick={() => navigate("/post-project")}
          style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          ➕ Create Project
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div style={{ background: "#f1f5ff", padding: "20px", borderRadius: "12px", flex: "1", textAlign: "center" }}>
          <h3>Total Projects</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{projects.length}</p>
        </div>
        <div style={{ background: "#e7f9ee", padding: "20px", borderRadius: "12px", flex: "1", textAlign: "center" }}>
          <h3>Active Projects</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{projects.filter((p) => p.status === "Active").length}</p>
        </div>
        <div style={{ background: "#fff4e6", padding: "20px", borderRadius: "12px", flex: "1", textAlign: "center" }}>
          <h3>Completed Projects</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{projects.filter((p) => p.status === "Completed").length}</p>
        </div>
      </div>

      {/* Projects */}
      <h3>🗂️ My Projects</h3>
      {projects.length === 0 ? (
        <p>You didn't post any project yet.</p>
      ) : (
        projects.map((project, i) => {
          const projectApps = getApplicationsForProject(project.title);
          return (
            <div key={i} style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", border: "1px solid #dee2e6", marginBottom: "10px" }}>
              <h4>{project.title}</h4>
              <p>💰 Budget: {project.budget}</p>
              <p>🧠 Skills: {project.skills}</p>
              <p>📅 Deadline: {project.deadline}</p>
              <p>📌 Status: <b>{project.status}</b></p>
              <p>📨 Total Applications: {projectApps.length}</p>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => { setSelectedProject(project); setShowModal(true); }}
                  style={{ background: "#007bff", color: "white", padding: "6px 12px", borderRadius: "8px", border: "none", marginRight: "10px", cursor: "pointer" }}
                >
                  View Applications
                </button>

                <button
                  onClick={() => setEditProject({ ...project })}
                  style={{ background: "#ffc107", color: "black", padding: "6px 12px", borderRadius: "8px", border: "none", marginRight: "10px", cursor: "pointer" }}
                >
                  Edit Project
                </button>

                <button
                  onClick={() => handleDeleteProject(i)}
                  style={{ background: "red", color: "white", padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer" }}
                >
                  Delete Project
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Applications Modal */}
      {showModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: "20px", borderRadius: "10px", maxWidth: "600px", width: "90%", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }}>
            <h3>📨 Applications for {selectedProject.title}</h3>
            <button
              onClick={() => setShowModal(false)}
              style={{ float: "right", background: "red", color: "white", border: "none", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}
            >
              ✖ Close
            </button>

            <div style={{ marginTop: "20px" }}>
              {getApplicationsForProject(selectedProject.title).length === 0 ? (
                <p>No applications yet.</p>
              ) : (
                getApplicationsForProject(selectedProject.title).map((app, i) => (
                  <div key={i} style={{ background: "#f3f4f6", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}>
                    <p><b>👤 Name:</b> {app.name}</p>
                    <p><b>📧 Email:</b> {app.email}</p>
                    <p><b>💰 Bid:</b> ₹{app.budget}</p>
                    <p><b>📝 Reason:</b> {app.reason}</p>
                    <p><b>📅 Deadline:</b> {app.deadline}</p>
                    <p><b>📌 Status:</b> {app.status || "Pending"}</p>

                    {/* ✅ Show Chat Button when Accepted */}
                    {app.status === "Accepted" && (
                      <button
                        onClick={() => handleChatOpen(selectedProject.title, app.email)}
                        style={{ background: "#28a745", color: "white", padding: "6px 12px", borderRadius: "8px", border: "none", marginTop: "8px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        💬 Chat with Freelancer
                      </button>
                    )}

                    {app.awaitingApproval && (
                      <div style={{ marginTop: "8px", padding: "8px", borderRadius: "8px", background: "#fff8e6", border: "1px solid #ffe6a7" }}>
                        <p style={{ margin: 0 }}><b>🔔 Proposed Status:</b> {app.proposedStatus}</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Proposed on: {app.proposedAt}</p>

                        <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleApproveProposal(app.email, selectedProject.title)}
                            style={{ background: "linear-gradient(145deg, #28a745, #218838)", color: "white", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                          >
                            ✅ Approve
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectProposal(app.email, selectedProject.title)}
                            style={{ background: "linear-gradient(145deg, #dc3545, #c82333)", color: "white", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                          >
                            ❌ Not Approved
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(i, "Accepted", selectedProject.title)}
                        style={{ background: "linear-gradient(145deg, #28a745, #218838)", color: "white", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                      >
                        ✅ Accept
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(i, "Rejected", selectedProject.title)}
                        style={{ background: "linear-gradient(145deg, #dc3545, #c82333)", color: "white", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProject && (
        <div className="modal-overlay" onClick={() => setEditProject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: "20px", borderRadius: "10px", maxWidth: "500px", width: "90%", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }}>
            <h3>✏️ Edit Project</h3>
            <label>Title:</label>
            <input type="text" value={editProject.title} onChange={(e) => setEditProject({ ...editProject, title: e.target.value })} style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />
            <label>Budget:</label>
            <input type="text" value={editProject.budget} onChange={(e) => setEditProject({ ...editProject, budget: e.target.value })} style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />
            <label>Skills:</label>
            <input type="text" value={editProject.skills} onChange={(e) => setEditProject({ ...editProject, skills: e.target.value })} style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />
            <label>Deadline:</label>
            <input type="date" value={editProject.deadline} onChange={(e) => setEditProject({ ...editProject, deadline: e.target.value })} style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />

            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button onClick={handleEditSave} style={{ background: "#28a745", color: "white", padding: "8px 12px", border: "none", borderRadius: "6px", cursor: "pointer" }}>💾 Save</button>
              <button onClick={() => setEditProject(null)} style={{ background: "#dc3545", color: "white", padding: "8px 12px", border: "none", borderRadius: "6px", cursor: "pointer" }}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;
