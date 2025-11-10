import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import "./FreelancerDashboard.css";

function FreelancerDashboard() {
  const navigate = useNavigate();
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
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [currentRatingProject, setCurrentRatingProject] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    budget: "",
    deadline: "",
    reason: "",
  });
  const [showAcceptedPopup, setShowAcceptedPopup] = useState(false);
  const [status, setStatus] = useState("In Process");
  const [notifications, setNotifications] = useState([]);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const prevAppsRef = useRef([]);
  const notifContainerRef = useRef(null);
  const notificationListRef = useRef(null);

  // NEW STATES FOR PROFILE MENU & DELETE ACCOUNT
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(880, ctx.currentTime);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      o.stop(ctx.currentTime + 0.36);
    } catch (e) {
      console.warn("Audio not supported:", e);
    }
  };

  const pushNotification = (title, message, type = "info") => {
    const n = {
      id: Date.now() + Math.random().toString(36).slice(2),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false,
    };
    setNotifications((prev) => {
      const newNotifications = [n, ...prev];
      return newNotifications.slice(0, 50);
    });
    playNotificationSound();
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        showNotificationList &&
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target)
      ) {
        setShowNotificationList(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showNotificationList]);

  const handleNotificationClick = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* ===========
  DATA LOADING LOGIC
  =========== */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("clientProjects")) || [];
    setProjects(stored);
    const applied =
      JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    setAppliedProjects(applied);
    const archived =
      JSON.parse(localStorage.getItem("freelancerArchivedApplications")) || [];
    setArchivedProjects(archived);
    const storedEarnings = parseFloat(localStorage.getItem("freelancerTotalEarnings")) || 0;
    setTotalEarnings(storedEarnings);
    prevAppsRef.current = applied;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedApps =
        JSON.parse(localStorage.getItem("freelancerApplications")) || [];
      setAppliedProjects(updatedApps);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* RATING REMINDER LOGIC */
  useEffect(() => {
    const checkAndShowRatingPopup = () => {
      if (!showRatingPopup && appliedProjects && appliedProjects.length > 0) {
        const unratedCompletedProject = appliedProjects.find(app =>
          app.status === "Accepted" &&
          app.projectStatus === "Completed" &&
          !app.rated
        );
        if (unratedCompletedProject) {
          setCurrentRatingProject(unratedCompletedProject);
          setShowRatingPopup(true);
        }
      }
    };
    checkAndShowRatingPopup();
    const interval = setInterval(checkAndShowRatingPopup, 10000);
    return () => clearInterval(interval);
  }, [appliedProjects, showRatingPopup]);

  /* AVERAGE RATING */
  useEffect(() => {
    const ratedProjects = appliedProjects.filter(app =>
      app.status === "Accepted" &&
      app.projectStatus === "Completed" &&
      app.clientRating > 0
    );
    if (ratedProjects.length > 0) {
      const totalRating = ratedProjects.reduce((sum, app) => sum + (app.clientRating || 0), 0);
      const avg = totalRating / ratedProjects.length;
      setAverageRating(parseFloat(avg.toFixed(1)));
    } else {
      setAverageRating(0);
    }
  }, [appliedProjects]);

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
    const freelancerApps =
      JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const existingApp = freelancerApps.find(
      (app) => app.projectTitle === selectedProject.title
    );

    if (existingApp) {
      if (existingApp.status === "Accepted") {
        alert("You are already in this project");
        setShowForm(false);
        return;
      } else if (existingApp.status === "Pending") {
        alert("You have already applied for this project");
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

    let storedApps = JSON.parse(localStorage.getItem("applications")) || [];
    let updatedFreelancerApps = freelancerApps.filter(
      (app) => !(app.projectTitle === selectedProject.title && app.email === formData.email)
    );
    updatedFreelancerApps.push(application);
    storedApps = storedApps.filter(
      (app) => !(app.projectTitle === selectedProject.title && app.email === formData.email)
    );
    storedApps.push(application);
    localStorage.setItem("applications", JSON.stringify(storedApps));
    localStorage.setItem(
      "freelancerApplications",
      JSON.stringify(updatedFreelancerApps)
    );
    setAppliedProjects(updatedFreelancerApps);
    pushNotification(`Application submitted!`, `Your proposal for "${selectedProject.title}" is now pending review.`, "success");
    setFormData({ name: "", email: "", budget: "", deadline: "", reason: "", });
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

  const handleWithdrawApplication = (e, projectTitleToWithdraw, emailToWithdraw) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to withdraw your application for "${projectTitleToWithdraw}"?`)) {
      return;
    }
    const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const updatedFreelancerApps = freelancerApps.filter(
      (app) => !(app.projectTitle === projectTitleToWithdraw && app.email === emailToWithdraw)
    );
    localStorage.setItem(
      "freelancerApplications",
      JSON.stringify(updatedFreelancerApps)
    );
    setAppliedProjects(updatedFreelancerApps);
    const clientApps = JSON.parse(localStorage.getItem("applications")) || [];
    const updatedClientApps = clientApps.filter(
      (app) => !(app.projectTitle === projectTitleToWithdraw && app.email === emailToWithdraw)
    );
    localStorage.setItem("applications", JSON.stringify(updatedClientApps));
    pushNotification("Application Withdrawn", `Your pending application for "${projectTitleToWithdraw}" has been successfully withdrawn.`, "info");
  };

  const handleMoveToTrash = (e, projectTitleToArchive, emailToArchive) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to move the application for "${projectTitleToArchive}" to Trash?`)) {
      return;
    }
    const appToMove = appliedProjects.find(
      (app) => app.projectTitle === projectTitleToArchive && app.email === emailToArchive
    );
    if (!appToMove) return;
    const updatedFreelancerApps = appliedProjects.filter(
      (app) => !(app.projectTitle === projectTitleToArchive && app.email === emailToArchive)
    );
    localStorage.setItem(
      "freelancerApplications",
      JSON.stringify(updatedFreelancerApps)
    );
    setAppliedProjects(updatedFreelancerApps);
    const updatedArchivedApps = [...archivedProjects, {...appToMove, archivedAt: new Date().toLocaleString()}];
    localStorage.setItem(
      "freelancerArchivedApplications",
      JSON.stringify(updatedArchivedApps)
    );
    setArchivedProjects(updatedArchivedApps);
    setSelectedTrashProjects([]);
    pushNotification("Moved to Trash", `Application for "${projectTitleToArchive}" can be restored from the Trash section.`, "info");
  };

  const handleRestoreFromTrash = (e, projectTitleToRestore, emailToRestore) => {
    e.stopPropagation();
    const appToRestore = archivedProjects.find(
      (app) => app.projectTitle === projectTitleToRestore && app.email === emailToRestore
    );
    if (!appToRestore) return;
    const updatedArchivedApps = archivedProjects.filter(
      (app) => !(app.projectTitle === projectTitleToRestore && app.email === emailToRestore)
    );
    localStorage.setItem(
      "freelancerArchivedApplications",
      JSON.stringify(updatedArchivedApps)
    );
    setArchivedProjects(updatedArchivedApps);  // FIXED: Removed "подум"
    const updatedFreelancerApps = [...appliedProjects, appToRestore];
    localStorage.setItem(
      "freelancerApplications",
      JSON.stringify(updatedFreelancerApps)
    );
    setAppliedProjects(updatedFreelancerApps);
    const keyToRestore = `${projectTitleToRestore}::${emailToRestore}`;
    setSelectedTrashProjects((prev) => prev.filter(k => k !== keyToRestore));
    pushNotification("Restored", `Application for "${projectTitleToRestore}" has been restored to your Applications list.`, "success");
  };

  const handleSelectTrashProject = (projectTitle, email, isChecked) => {
    const key = `${projectTitle}::${email}`;
    if (isChecked) {
      setSelectedTrashProjects((prev) => [...prev, key]);
    } else {
      setSelectedTrashProjects((prev) => prev.filter((k) => k !== key));
    }
  };

  const handleSelectAllTrash = (isChecked) => {
    if (isChecked) {
      const allKeys = archivedProjects.map(app => `${app.projectTitle}::${app.email}`);
      setSelectedTrashProjects(allKeys);
    } else {
      setSelectedTrashProjects([]);
    }
  };

  const handlePermanentDelete = () => {
    if (selectedTrashProjects.length === 0) {
      alert("Please select at least one project to delete permanently.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedTrashProjects.length} selected applications? This action cannot be undone.`)) {
      return;
    }
    const keysToDeleteSet = new Set(selectedTrashProjects);
    const updatedArchivedApps = archivedProjects.filter(app => {
      const key = `${app.projectTitle}::${app.email}`;
      return !keysToDeleteSet.has(key);
    });
    localStorage.setItem(
      "freelancerArchivedApplications",
      JSON.stringify(updatedArchivedApps)
    );
    setArchivedProjects(updatedArchivedApps);
    setSelectedTrashProjects([]);
    pushNotification("Permanently Deleted", `Selected applications have been permanently deleted.`, "error");
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    const updatedApps = appliedProjects.map((app) =>
      app.projectTitle === selectedProject.projectTitle && app.email === selectedProject.email
        ? { ...app, projectStatus: newStatus }
        : app
    );
    setAppliedProjects(updatedApps);
    localStorage.setItem("freelancerApplications", JSON.stringify(updatedApps));
    if (newStatus === "Completed") {
      const earnings = parseFloat(selectedProject.budget) || 0;
      const newTotal = totalEarnings + earnings;
      setTotalEarnings(newTotal);
      localStorage.setItem("freelancerTotalEarnings", newTotal.toString());
      pushNotification("Project Completed!", `You earned $${earnings} from "${selectedProject.projectTitle}". Total earnings: $${newTotal}.`, "success");
    }
  };

  const exportToExcel = () => {
    const data = appliedProjects.map((app) => ({
      Project_Title: app.projectTitle,
      Skills: app.skills,
      Budget: app.budget,
      Deadline: app.deadline,
      Status: app.status,
      Applied_At: app.appliedAt,
      Project_Status: app.projectStatus || "N/A",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, "Freelancer_Reports.xlsx");
  };

  const handleRatingSubmit = (rating) => {
    if (rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5.");
      return;
    }
    const updatedApps = appliedProjects.map((app) =>
      app.projectTitle === currentRatingProject.projectTitle &&
      app.email === currentRatingProject.email
        ? { ...app, rated: true, clientRating: rating }
        : app
    );
    setAppliedProjects(updatedApps);
    localStorage.setItem("freelancerApplications", JSON.stringify(updatedApps));
    setShowRatingPopup(false);
    pushNotification("Rating Submitted", `You rated the client ${rating} stars for "${currentRatingProject.projectTitle}".`, "success");
  };

  useEffect(() => {
    if (appliedProjects.length > prevAppsRef.current.length) {
      const newApp = appliedProjects[appliedProjects.length - 1];
      pushNotification("New Application", `You applied for "${newApp.projectTitle}". Status: Pending.`, "info");
    } else {
      appliedProjects.forEach((app, i) => {
        const prev = prevAppsRef.current[i];
        if (prev && app.status !== prev.status) {
          if (app.status === "Accepted") {
            pushNotification("Accepted!", `Your application for "${app.projectTitle}" has been accepted!`, "success");
          } else if (app.status === "Rejected") {
            pushNotification("Rejected", `Your application for "${app.projectTitle}" was rejected. You can reapply.`, "error");
          }
        }
      });
    }
    prevAppsRef.current = appliedProjects;
  }, [appliedProjects]);

  useEffect(() => {
    if (showNotificationList && notificationListRef.current) {
      notificationListRef.current.scrollTop = notificationListRef.current.scrollHeight;
    }
  }, [showNotificationList, notifications]);

  // NEW: Toggle Profile Menu
  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
  };

  // NEW: Handle Account Delete
  const handleDeleteAccount = () => {
    if (deleteConfirmInput.toLowerCase() === "delete") {
      localStorage.removeItem("freelancerApplications");
      localStorage.removeItem("freelancerArchivedApplications");
      localStorage.removeItem("freelancerTotalEarnings");
      setShowDeleteAccountPopup(false);
      setDeleteConfirmInput("");
      pushNotification("Account Deleted", "Your account has been deleted.", "error");
      navigate("/login");
    } else {
      alert("Type 'Delete' to confirm.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* TOP NAVBAR - LEFT: Dashboard, Report | RIGHT: Profile Icon */}
      <div className="top-navbar">
        <div className="navbar-left">
          <button
            className={showAppliedList ? "active" : ""}
            onClick={() => {
              setShowAppliedList(true);
              setShowReports(false);
              setShowTrash(false);
            }}
          >
            Dashboard
          </button>
          <button
            className={showReports ? "active" : ""}
            onClick={() => {
              setShowReports(true);
              setShowAppliedList(false);
              setShowTrash(false);
            }}
          >
            Report
          </button>
        </div>
        <div className="navbar-right">
          <div className="profile-icon" onClick={toggleProfileMenu}>
            Profile
          </div>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div onClick={() => { alert("Edit Profile - Coming Soon"); setShowProfileMenu(false); }}>Edit Profile</div>
              <div onClick={() => { setShowTrash(true); setShowAppliedList(false); setShowReports(false); setShowProfileMenu(false); }}>Trash</div>
              <div onClick={() => { setShowDeleteAccountPopup(true); setShowProfileMenu(false); }}>Account</div>
              <div onClick={() => { navigate("/login"); setShowProfileMenu(false); }}>Logout</div>
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by skills..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="notification-container" ref={notifContainerRef}>
          <div
            className="notification-bell"
            onClick={() => setShowNotificationList(!showNotificationList)}
          >
            Bell {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
          </div>
          {showNotificationList && (
            <div className="notification-list" ref={notificationListRef}>
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.type} ${n.isRead ? "read" : "unread"}`}
                    onClick={() => handleNotificationClick(n.id)}
                  >
                    <h4>{n.title}</h4>
                    <p>{n.message}</p>
                    <span className="time">{n.time}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {showAppliedList && (
          <>
            <h2>My Applications</h2>
            <ul className="applied-list">
              {appliedProjects.map((app, index) => (
                <li
                  key={index}
                  className={`applied-item ${app.status.toLowerCase()}`}
                  onClick={() =>
                    app.status === "Accepted" ? handleAcceptedProjectClick(app) : null
                  }
                >
                  <h3>{app.projectTitle}</h3>
                  <p>Skills: {app.skills}</p>
                  <p>Budget: ${app.budget}</p>
                  <p>Deadline: {app.deadline}</p>
                  <p>Status: {app.status}</p>
                  {app.status === "Pending" && (
                    <button
                      className="withdraw-btn"
                      onClick={(e) => handleWithdrawApplication(e, app.projectTitle, app.email)}
                    >
                      Withdraw
                    </button>
                  )}
                  {app.status !== "Pending" && (
                    <button
                      className="trash-btn"
                      onClick={(e) => handleMoveToTrash(e, app.projectTitle, app.email)}
                    >
                      Trash
                    </button>
                  )}
                  {app.status === "Accepted" && app.projectStatus && (
                    <p>Project Status: {app.projectStatus}</p>
                  )}
                  {app.status === "Accepted" &&
                    app.projectStatus === "Completed" &&
                    app.clientRating > 0 && (
                      <p>Client Rating: {app.clientRating} Stars</p>
                    )}
                </li>
              ))}
            </ul>
          </>
        )}

        {showReports && (
          <div className="reports-section">
            <h2>Reports</h2>
            <div className="stats">
              <p>Total Earnings: ${totalEarnings.toFixed(2)}</p>
              <p>Average Rating: {averageRating} Stars</p>
            </div>
            <button className="export-btn" onClick={exportToExcel}>
              Export to Excel
            </button>
            <ul className="report-list">
              {appliedProjects.map((app, index) => (
                <li key={index}>
                  <h3>{app.projectTitle}</h3>
                  <p>Status: {app.status}</p>
                  <p>Project Status: {app.projectStatus || "N/A"}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showTrash && (
          <div className="trash-section">
            <h2>Trash</h2>
            <div className="trash-controls">
              <label>
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAllTrash(e.target.checked)}
                  checked={
                    selectedTrashProjects.length === archivedProjects.length &&
                    archivedProjects.length > 0
                  }
                />
                Select All
              </label>
              <button
                className="permanent-delete-btn"
                onClick={handlePermanentDelete}
                disabled={selectedTrashProjects.length === 0}
              >
                Permanently Delete Selected
              </button>
            </div>
            <ul className="trash-list">
              {archivedProjects.map((app, index) => {
                const key = `${app.projectTitle}::${app.email}`;
                return (
                  <li key={index} className="trash-item">
                    <input
                      type="checkbox"
                      checked={selectedTrashProjects.includes(key)}
                      onChange={(e) =>
                        handleSelectTrashProject(app.projectTitle, app.email, e.target.checked)
                      }
                    />
                    <div className="trash-details" onClick={(e) => handleRestoreFromTrash(e, app.projectTitle, app.email)}>
                      <h3>{app.projectTitle}</h3>
                      <p>Archived At: {app. archivedAt}</p>
                      <p>Status: {app.status}</p>
                    </div>
                    <button
                      className="restore-btn"
                      onClick={(e) => handleRestoreFromTrash(e, app.projectTitle, app.email)}
                    >
                      Restore
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="project-list">
            <h2>Available Projects</h2>
            {filtered.map((proj, index) => (
              <div key={index} className="project-card">
                <h3>{proj.title}</h3>
                <p>Skills: {proj.skills}</p>
                <p>Budget: ${proj.budget}</p>
                <p>Deadline: {proj.deadline}</p>
                <p>Description: {proj.description}</p>
                <button onClick={() => { setSelectedProject(proj); setShowForm(true); }}>
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="popup">
            <form onSubmit={handleSubmit}>
              <h2>Apply for {selectedProject.title}</h2>
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
                placeholder="Proposed Budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
              <input
                type="date"
                placeholder="Proposed Deadline"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
              <textarea
                placeholder="Why should you be hired?"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
              <button type="submit">Submit Application</button>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {showAcceptedPopup && (
          <div className="popup">
            <h2>{selectedProject.projectTitle} - Update Status</h2>
            <select value={status} onChange={handleStatusChange}>
              <option value="In Process">In Process</option>
              <option value="Completed">Completed</option>
            </select>
            <button onClick={() => setShowAcceptedPopup(false)}>Close</button>
          </div>
        )}

        {showRatingPopup && currentRatingProject && (
          <div className="popup">
            <h2>Rate the Client for {currentRatingProject.projectTitle}</h2>
            <p>How would you rate your experience with the client? (1-5 stars)</p>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => handleRatingSubmit(star)}>
                {star} Stars
              </button>
            ))}
            <button onClick={() => setShowRatingPopup(false)}>Remind Me Later</button>
          </div>
        )}

        {/* DELETE ACCOUNT POPUP */}
        {showDeleteAccountPopup && (
          <div className="popup">
            <h2>Delete Your Account</h2>
            <p>To confirm, type <strong>Delete</strong> below:</p>
            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="Type 'Delete'"
            />
            <button onClick={handleDeleteAccount}>Confirm Delete</button>
            <button onClick={() => { setShowDeleteAccountPopup(false); setDeleteConfirmInput(""); }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FreelancerDashboard;