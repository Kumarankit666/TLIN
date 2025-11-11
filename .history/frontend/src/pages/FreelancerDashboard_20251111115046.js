import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as FileSaver from "file-saver"; 
import * as XLSX from "xlsx"; 
import "./FreelancerDashboard.css";
import { FaUserCircle } from "react-icons/fa";


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

  // States for Rating & Earnings
  const [showRatingPopup, setShowRatingPopup] = useState(false); 
  const [currentRatingProject, setCurrentRatingProject] = useState(null); 
  const [totalEarnings, setTotalEarnings] = useState(0); 
  const [averageRating, setAverageRating] = useState(0); 
  // === Profile Menu States ===
const [showProfilePopup, setShowProfilePopup] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [deleteInput, setDeleteInput] = useState("");

const handleLogout = () => {
  if (window.confirm("Are you sure you want to logout?")) {
    navigate("/login");
  }
};

const handleDeleteAccount = () => {
  if (deleteInput.toLowerCase() === "delete") {
    alert("Account deleted permanently!");
    localStorage.clear();
    navigate("/register");
  } else {
    alert("Type 'delete' to confirm account deletion!");
  }
};


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    budget: "",
    deadline: "",
    reason: "",
  });

  const [showAcceptedPopup, setShowAcceptedPopup] = useState(false);
  const [status, setStatus] = useState("In Process");

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const prevAppsRef = useRef([]);
  const notifContainerRef = useRef(null);
  
  // Ref for the notification list scroll
  const notificationListRef = useRef(null); 

  // play a short sound using WebAudio API
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

  // Helper: create a notification object and add it to the list
  const pushNotification = (title, message, type = "info") => {
    const n = {
      id: Date.now() + Math.random().toString(36).slice(2),
      title,
      message,
      type, // "success" | "error" | "info"
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false,
    };
    
    // REQUEST 2 (Initial): Notification count limit (50)
    setNotifications((prev) => {
      const newNotifications = [n, ...prev];
      // Keep only the latest 50 notifications
      return newNotifications.slice(0, 50); 
    });
    
    playNotificationSound();
  };

  // Click anywhere except notification list => hide the list
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

  // Mark notification as read when clicked on the list item
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
    // Ensuring fallback to empty array [] if localStorage item is null or missing
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
    
    // Load notifications from local storage if needed (Optional: uncomment if you want to persist notifications)
    // const storedNotifications = JSON.parse(localStorage.getItem("freelancerNotifications")) || [];
    // setNotifications(storedNotifications.slice(0, 50)); 

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
  
  /* =========================================
    ⭐ RATING REMINDER LOOP
    ========================================= */
  useEffect(() => {
    const checkAndShowRatingPopup = () => {
      if (!showRatingPopup && appliedProjects && appliedProjects.length > 0) {
        const unratedCompletedProject = appliedProjects.find(app => 
          app.status === "Accepted" && 
          app.projectStatus === "Completed" && 
          !app.rated // <-- The freelancer hasn't rated the client yet
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

  /* =========================================
      ⭐ CALCULATE AVERAGE RATING
      ========================================= */
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

  /* =========================
      SEARCH LOGIC 
      ========================= */
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

  /* =========================
      APPLICATION LOGIC 
      ========================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const freelancerApps =
      JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const existingApp = freelancerApps.find(
      (app) => app.projectTitle === selectedProject.title
    );

    // Prevent application if already Pending or Accepted
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
    
    // Clean up old rejected application if re-applying, then add new one
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
    pushNotification(`✅ Application submitted!`, `Your proposal for "${selectedProject.title}" is now pending review.`, "success");

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
    const latest =
      JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const matched =
      latest.find(
        (a) => a.projectTitle === app.projectTitle && a.email === app.email
      ) || app;
    setSelectedProject(matched);
    const initialStatus =
      matched.projectStatus || matched.proposedStatus || "In Process";
    setStatus(initialStatus);
    setShowAcceptedPopup(true);
  };

  // Withdraw Pending Application
  const handleWithdrawApplication = (e, projectTitleToWithdraw, emailToWithdraw) => {
      e.stopPropagation(); 
      
      if (!window.confirm(`Are you sure you want to withdraw your application for "${projectTitleToWithdraw}"?`)) {
          return;
      }

      const freelancerApps =
          JSON.parse(localStorage.getItem("freelancerApplications")) || [];
      const updatedFreelancerApps = freelancerApps.filter(
          (app) => !(app.projectTitle === projectTitleToWithdraw && app.email === emailToWithdraw)
      );
      localStorage.setItem(
          "freelancerApplications",
          JSON.stringify(updatedFreelancerApps)
      );
      setAppliedProjects(updatedFreelancerApps);
      
      const clientApps =
          JSON.parse(localStorage.getItem("applications")) || [];
      const updatedClientApps = clientApps.filter(
          (app) => !(app.projectTitle === projectTitleToWithdraw && app.email === emailToWithdraw)
      );
      localStorage.setItem("applications", JSON.stringify(updatedClientApps));

      pushNotification("↩️ Application Withdrawn", `Your pending application for "${projectTitleToWithdraw}" has been successfully withdrawn.`, "info");
  };
  
  // Move to Trash (Archive)
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

      pushNotification("🗑️ Moved to Trash", `Application for "${projectTitleToArchive}" can be restored from the Trash section.`, "info");
  };
  
  // Restore From Trash
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
      setArchivedProjects(updatedArchivedApps);
      
      const updatedFreelancerApps = [...appliedProjects, appToRestore];
      localStorage.setItem(
          "freelancerApplications",
          JSON.stringify(updatedFreelancerApps)
      );
      setAppliedProjects(updatedFreelancerApps);
      
      const keyToRestore = `${projectTitleToRestore}::${emailToRestore}`;
      setSelectedTrashProjects((prev) => prev.filter(k => k !== keyToRestore));

      pushNotification("✅ Restored", `Application for "${projectTitleToRestore}" has been restored to your Applications list.`, "success");
  };
  
  // Select/Deselect Trash Project
  const handleSelectTrashProject = (projectTitle, email, isChecked) => {
    const key = `${projectTitle}::${email}`;
    if (isChecked) {
      setSelectedTrashProjects((prev) => [...prev, key]);
    } else {
      setSelectedTrashProjects((prev) => prev.filter((k) => k !== key));
    }
  };

  // Select/Deselect All Projects in Trash
  const handleSelectAllTrash = (isChecked) => {
    if (isChecked) {
      const allKeys = archivedProjects.map(app => `${app.projectTitle}::${app.email}`);
      setSelectedTrashProjects(allKeys);
    } else {
      setSelectedTrashProjects([]);
    }
  };

  // Permanently Delete Selected Projects
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

    pushNotification("🔥 Permanently Deleted", `${keysToDeleteSet.size} applications were permanently deleted.`, "error");
  };
  
  // Save (Propose) Status - UPDATED LOGIC (Handles Re-proposal and Resets Rejection Flags)
  const handleSaveStatusProposal = () => {
    if (!selectedProject) return;

    // Check if currently awaiting approval (prevent double submit)
    if (selectedProject.awaitingApproval) {
        alert("⚠️ You have already proposed a status update for this project. Please wait for the client's response.");
        setShowAcceptedPopup(false);
        return;
    }
    
    const currentProjectStatus = selectedProject.projectStatus || 'In Process';
    if (status === currentProjectStatus && !selectedProject.clientRejected) {
        alert(`Status is already set to "${status}". No change proposed.`);
        setShowAcceptedPopup(false);
        return;
    }
    
    if (status === "Completed" && currentProjectStatus === 'Completed') {
        alert("Cannot propose 'Completed' status again.");
        setShowAcceptedPopup(false);
        return;
    }


    const freelancerApps =
      JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const applications =
      JSON.parse(localStorage.getItem("applications")) || [];

    const updatedFreelancer = freelancerApps.map((a) => {
      if (
        a.projectTitle === selectedProject.projectTitle &&
        a.email === selectedProject.email
      ) {
        return {
          ...a,
          proposedStatus: status,
          awaitingApproval: true,
          proposedAt: new Date().toLocaleString(),
          statusUpdateProposed: true, 
          
          // 🚨 NEW: Reset rejection flags for the new proposal
          clientRejected: false, 
          clientRejectionReason: undefined, 
        };
      }
      return a;
    });

    const updatedApplications = applications.map((a) => {
      if (
        a.projectTitle === selectedProject.projectTitle &&
        a.email === selectedProject.email
      ) {
        return {
          ...a,
          proposedStatus: status,
          awaitingApproval: true,
          proposedAt: new Date().toLocaleString(),
          
          // 🚨 NEW: Reset rejection flags for the new proposal
          clientRejected: false, 
          clientRejectionReason: undefined, 
        };
      }
      return a;
    });

    localStorage.setItem(
      "freelancerApplications",
      JSON.stringify(updatedFreelancer)
    );
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    setAppliedProjects(updatedFreelancer);

    const updatedSel = updatedFreelancer.find(
      (a) =>
        a.projectTitle === selectedProject.projectTitle &&
        a.email === selectedProject.email
    );
    setSelectedProject(updatedSel);

    pushNotification("⏳ Status Proposed", "Your status change has been proposed and is awaiting client approval.", "info");
    setShowAcceptedPopup(false);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleChat = () => {
    if (!selectedProject) return;
    const clientEmail = selectedProject.clientEmail || "unknown@example.com";
    navigate(
      `/chat?projectTitle=${encodeURIComponent(
        selectedProject.projectTitle
      )}&clientEmail=${encodeURIComponent(clientEmail)}`
    );
  };

  // Handle Rating Submission (Freelancer rating the Client)
  const handleRatingSubmit = (rating, review) => {
    if (!currentRatingProject) return;

    const projectKey = `${currentRatingProject.projectTitle}::${currentRatingProject.email}`;

    // 1. Update Freelancer's application list
    const freelancerApps =
      JSON.parse(localStorage.getItem("freelancerApplications")) || [];
    const updatedFreelancer = freelancerApps.map((a) => {
      const key = `${a.projectTitle}::${a.email}`;
      if (key === projectKey) {
        return {
          ...a,
          rated: true, // Freelancer rated flag
          freelancerRating: rating,
          freelancerReview: review,
        };
      }
      return a;
    });
    localStorage.setItem(
      "freelancerApplications",
      JSON.stringify(updatedFreelancer)
    );
    setAppliedProjects(updatedFreelancer);

    // 2. Update the main 'applications' list (Client side)
    const applications =
      JSON.parse(localStorage.getItem("applications")) || [];
    const updatedApplications = applications.map((a) => {
       const key = `${a.projectTitle}::${a.email}`;
      if (key === projectKey) {
        return {
          ...a,
          freelancerRating: rating,
          freelancerReview: review,
        };
      }
      return a;
    });
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    
    // Close and Notify
    setShowRatingPopup(false);
    setCurrentRatingProject(null);
    pushNotification("⭐ Feedback Sent", `Thank you for rating the project "${currentRatingProject.projectTitle}"!`, "success");
  };

  /* =========================================
      NOTIFICATION: detect localStorage changes
      ========================================= */
  useEffect(() => {
    const checker = setInterval(() => {
      try {
        const current =
          JSON.parse(localStorage.getItem("freelancerApplications")) || [];
        let prev = prevAppsRef.current || [];

        const mapPrev = {};
        prev.forEach((p) => {
          const key = `${p.projectTitle}::${p.email}`;
          mapPrev[key] = p;
        });

        const mapCurr = {};
        current.forEach((c) => {
          const key = `${c.projectTitle}::${c.email}`;
          mapCurr[key] = c;
        });
        
        let shouldUpdateStorage = false;

        // check for changed entries
        Object.keys(mapCurr).forEach((key) => {
          const currApp = mapCurr[key];
          const prevApp = mapPrev[key];

          if (prevApp) {
            // 1) status changed (Accepted / Rejected) 
            if (prevApp.status !== currApp.status) {
              if (currApp.status === "Accepted") {
                pushNotification(
                  "🤝 Proposal Accepted",
                  `Client accepted your application for "${currApp.projectTitle}". Let's start!`,
                  "success"
                );
              } else if (currApp.status === "Rejected") {
                // Check if client provided rejection reason for proposal rejection
                const reason = currApp.clientRejectionReason ? `. Reason: ${currApp.clientRejectionReason.substring(0, 50)}...` : '';

                pushNotification(
                  "💔 Proposal Rejected",
                  `Client rejected your application for "${currApp.projectTitle}"${reason}.`,
                  "error"
                );
              } else {
                pushNotification(
                  "Application Updated",
                  `Status for "${currApp.projectTitle}" changed to ${
                    currApp.status || "Updated"
                  }.`,
                  "info"
                );
              }
            }

            // 2) approvedByClient flag changed - Project Status Approval
            if (!prevApp.approvedByClient && currApp.approvedByClient) {
                
                // NEW LOGIC FOR EARNINGS & RATING POPUP
                if (currApp.projectStatus === "Completed") {
                    
                    // 3. EARNINGS UPDATE
                    const budget = parseFloat(currApp.budget) || 0;
                    if (budget > 0 && !currApp.earningsAdded) { // Ensure earnings are added only once
                        const newTotal = parseFloat(localStorage.getItem("freelancerTotalEarnings")) || 0;
                        const finalNewTotal = newTotal + budget;

                        setTotalEarnings(finalNewTotal);
                        localStorage.setItem("freelancerTotalEarnings", finalNewTotal.toString());
                        
                        currApp.earningsAdded = true; 
                        shouldUpdateStorage = true;
                        
                        pushNotification(
                            "💰 Payment Received!",
                            `₹${budget} added to your earnings for "${currApp.projectTitle}" completion!`,
                            "success"
                        );
                    }

                    // 1. RATING POPUP - This is the initial one-time popup
                    if (!currApp.rated) {
                      setCurrentRatingProject(currApp);
                      setShowRatingPopup(true);
                    }
                    
                }
                
                pushNotification(
                    "✅ Status Approved",
                    `Client approved your proposed status (${currApp.proposedStatus}) for "${currApp.projectTitle}".`,
                    "success"
                );
            }
            
            // 3) Check for status rejection (UPDATED)
            if (!prevApp.clientRejected && currApp.clientRejected) {
              // 🚨 NEW: Display rejection reason in notification
              const reason = currApp.clientRejectionReason ? `. Reason: ${currApp.clientRejectionReason.substring(0, 50)}...` : '';
              pushNotification(
                "❌ Status Rejected",
                `Client rejected your proposed status for "${currApp.projectTitle}"${reason}.`,
                "error"
              );
            }
            
            // 4) projectStatus changed 
            if (prevApp.projectStatus !== currApp.projectStatus && currApp.projectStatus) {
                pushNotification(
                  "Project Status Update",
                  `Client directly updated the status of "${currApp.projectTitle}" to ${currApp.projectStatus}.`,
                  "info"
                );
            }
          } 
        });

        // Final update to localStorage (to save earningsAdded flag)
        if (shouldUpdateStorage) {
            localStorage.setItem("freelancerApplications", JSON.stringify(current));
        }

        // update snapshot
        prevAppsRef.current = current;
      } catch (err) {
        console.warn("Notification check error:", err);
      }
    }, 1000);

    return () => clearInterval(checker);
  }, [totalEarnings]); 


  /* ============================
      RENDER HELPER
      ============================ */

  // Helper function to get status badge text and color
  const getStatusInfo = (status, proposedStatus, awaitingApproval, clientRejected) => {
    if (clientRejected) return { text: "Rejected ❌ (See Details)", className: "status-rejected" };
    if (awaitingApproval) return { text: `Status Proposed: ${proposedStatus} ⏳`, className: "status-proposed" };
    
    switch (status) {
      case "Accepted":
        return { text: "Accepted ✅", className: "status-accepted" };
      case "Rejected":
        return { text: "Rejected 💔", className: "status-rejected" };
      case "Pending":
        return { text: "Pending 🕒", className: "status-pending" };
      default:
        return { text: status, className: "status-default" };
    }
  };
  
  // Helper to get application status (for Search Results)
  const getApplicationStatus = (projectTitle) => {
    const app = appliedProjects.find((app) => app.projectTitle === projectTitle);
    
    if (!app) {
      return "Not Applied";
    }
    
    if (app.status === "Rejected") {
        return "Rejected"; 
    }
    
    if (app.status === "Accepted") {
        return "Accepted";
    }
    
    if (app.status === "Pending") {
        return "Pending";
    }

    return "Not Applied"; // Fallback
  };
  
  /* =========================================
      REPORT: Export Data to Excel
      ========================================= */
  const exportToExcel = (apiData, fileName) => {
    const reportData = apiData.map(app => ({
        'Project Title': app.projectTitle,
        'Skills Used': app.skills,
        'Proposed Budget (₹)': `₹${app.budget}`,
        'Proposed Deadline': app.deadline,
        'Application Status': app.status,
        'Project Current Status': app.status === 'Accepted' 
                                  ? (app.projectStatus || 'In Process') 
                                  : 'N/A', 
        'Date Applied': app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A',
    }));

    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
    
    pushNotification("📊 Report Generated", "Your project report has been downloaded successfully!", "success");
  };


  return (
    <div className="container">
      {/* 🔔 Notification Icon (Fixed Top Right) */}
      <div
        className="notification-icon-fixed"
        ref={notifContainerRef} 
        onClick={(e) => {
          e.stopPropagation(); 
          setShowNotificationList((prev) => !prev);
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge-fixed">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* 🔽 Notification List Dropdown (CUSTOM STYLING) */}
        {showNotificationList && (
          <div className="notification-list-container" ref={notificationListRef}>
            <h3 className="notification-header-title">Notifications ({notifications.length})</h3>
            
            {notifications.length > 0 ? (
              notifications.map((n) => {
                // Simplified parsing for the requested custom look
                const displayTitle = n.title.includes('Application') ? 'Application Update' : n.title;
                const displayMessage = n.message;
                
                return (
                  <div
                    key={n.id}
                    className={`notification-list-item ${n.type} ${n.isRead ? "read" : "unread"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(n.id);
                      // Optionally navigate or show details here if needed
                    }}
                  >
                    {/* Applying custom styling classes for screenshot look */}
                    <div className="list-item-header-custom">
                      <span className="bell-icon">🔔</span> 
                      <strong className="notification-title-custom">
                        {displayTitle}
                      </strong>
                    </div>
                    <p className="notification-message-custom">
                        {displayMessage}
                    </p>
                    <small className="notification-time-custom">{n.time}</small>
                  </div>
                );
              })
            ) : (
              <p style={{ padding: "10px", textAlign: "center", color: "#666" }}>
                No new notifications.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ====== SIDEBAR ====== */}
      <div className="sidebar">
        <div className="nav-item" onClick={() => {
          navigate("/freelancer-dashboard");
          setShowReports(false);
          setShowTrash(false);
          setShowAppliedList(false);
        }}>
          📊 Dashboard
        </div>
        
        
        {/* Applications List */}
        <div 
          className="nav-item"
          onClick={() => {
            setShowReports(false);
            setShowTrash(false);
            setShowAppliedList(true);
          }}
        >
          💰 Applications
        </div>
        
        {/* 🗑️ Trash Navigation Item */}
        <div 
            className="nav-item"
            onClick={() => {
              setShowReports(false);
              setShowAppliedList(false);
              setShowTrash(true); 
              setSelectedTrashProjects([]); 
            }}
          >
          🗑️ Trash ({archivedProjects.length})
        </div>

        {/* Reports List */}
        <div 
          className="nav-item"
          onClick={() => {
            setShowReports(true);
            setShowAppliedList(false);
            setShowTrash(false);
          }}
        >
          📈 Reports
        </div>
      </div>

      <div className="main">
        
        {/* FIXED SEARCH CONTAINER */}
         <div className="search-container-fixed">
            <input
                type="text"
                placeholder="Search projects by skill and press Enter..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="search-input-field" 
            />
        </div>

        {/* Metric Cards (Updated Earnings Card) */}
        <div className="metrics">
          <div className="metric-card">
            {/* UPDATED EARNINGS DISPLAY */}
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>₹{totalEarnings.toLocaleString('en-IN')}</div> 
            <div>Total Earnings</div>
          </div>

          <div
            className="metric-card" 
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShowReports(false);
              setShowTrash(false);
              setShowAppliedList(!showAppliedList);
            }}
          >
            <div style={{ fontSize: "24px" }}>
              📨 **Total Applied:** {appliedProjects.length}
            </div>
            <div>Click to view applications</div>
          </div>

          {/* ⭐ AVERAGE RATING CARD (UPDATED) */}
          <div className="metric-card">
            <div 
              style={{ 
                fontSize: "32px", 
                fontWeight: "bold", 
                color: averageRating >= 4 ? '#22c55e' : '#f59e0b' 
              }}
            >
              {averageRating > 0 ? `⭐ ${averageRating}` : 'N/A'}
            </div>
            <div>Average Client Rating</div>
          </div>
        </div>


        {/* Applied Projects List */}
        {showAppliedList && !showReports && !showTrash && (
          <div className="applied-list-container">
            <h3>📋 Your Applied Projects</h3>
            {appliedProjects.length > 0 ? (
              <div className="applied-projects-grid">
                {appliedProjects.map((app, i) => {
                  const statusInfo = getStatusInfo(
                    app.status, 
                    app.proposedStatus, 
                    app.awaitingApproval, 
                    app.clientRejected
                  );
                  
                  // Only accepted projects are clickable
                  const isClickable = app.status === "Accepted";
                  // Check if project is completed and rated, if so, it can be trashed/archived
                  const isArchivable = (app.status === "Rejected" || (app.status === "Accepted" && app.projectStatus === "Completed" && app.rated));


                  return (
                    <div
                      key={i}
                      className={`applied-project-card ${
                        isClickable ? "accepted-card" : ""
                      }`}
                      style={{ cursor: isClickable ? 'pointer' : 'default' }}
                      onClick={isClickable ? () => handleAcceptedProjectClick(app) : undefined}
                    >
                      <div className="card-header">
                        <strong className="project-title-large">
                          {app.projectTitle}
                        </strong>
                        <span className={`status-badge ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      
                      <div className="card-details">
                        <p>
                          <span className="detail-icon">💰</span> Budget: ₹{app.budget}
                        </p>
                        <p>
                          <span className="detail-icon">📅</span> Deadline: {app.deadline}
                        </p>
                        <p>
                          <span className="detail-icon">💡</span> Skills: {app.skills}
                        </p>
                        <p className="applied-at-text">
                          Applied on: {app.appliedAt}
                        </p>
                      </div>

                      {app.status === "Accepted" && (
                        <div className="accepted-action-info">
                            Click to manage project status
                        </div>
                      )}
                      
                      {/* 🔄 WITHDRAW BUTTON FOR PENDING PROJECTS */}
                      {app.status === "Pending" && (
                          <div style={{ textAlign: 'center', marginTop: '10px' }}>
                              <button
                                  className="dashboard-btn withdraw" 
                                  style={{ padding: '5px 10px', fontSize: '12px' }} 
                                  onClick={(e) => handleWithdrawApplication(e, app.projectTitle, app.email)}
                              >
                                  ↩️ Withdraw Application
                              </button>
                          </div>
                      )}

                      {/* ❌ MOVE TO TRASH BUTTON (for Rejected or Completed & Rated) */}
                      {isArchivable && (
                          <div style={{ textAlign: 'center', marginTop: '10px' }}>
                              <button
                                  className="dashboard-btn cancel"
                                  style={{ padding: '5px 10px', fontSize: '12px' }}
                                  onClick={(e) => handleMoveToTrash(e, app.projectTitle, app.email)}
                              >
                                  🗑️ Move to Trash
                              </button>
                          </div>
                      )}
                      
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-applications">No active applications 🚫</p>
            )}
          </div>
        )}
        
        {/* TRASH/ARCHIVE SECTION */}
        {showTrash && !showReports && !showAppliedList && (
            <div className="trash-container applied-list-container">
                <h3>🗑️ Archived Projects (Trash)</h3>

                {archivedProjects.length > 0 ? (
                    <>
                        {/* Bulk Action Header */}
                        <div className="trash-bulk-actions">
                            <label className="select-all-label">
                                <input
                                    type="checkbox"
                                    checked={selectedTrashProjects.length === archivedProjects.length && archivedProjects.length > 0}
                                    onChange={(e) => handleSelectAllTrash(e.target.checked)}
                                />
                                Select All ({selectedTrashProjects.length} selected)
                            </label>
                            
                            <button
                                className="dashboard-btn cancel"
                                style={{ 
                                    padding: '8px 15px', 
                                    fontSize: '14px', 
                                    background: '#dc2626', 
                                    opacity: selectedTrashProjects.length > 0 ? 1 : 0.6,
                                    cursor: selectedTrashProjects.length > 0 ? 'pointer' : 'not-allowed'
                                }}
                                onClick={handlePermanentDelete}
                                disabled={selectedTrashProjects.length === 0}
                            >
                                🔥 Permanently Delete Selected
                            </button>
                        </div>
                        
                        <div className="applied-projects-grid" style={{ marginTop: '20px' }}>
                            {/* RENDER ARCHIVED PROJECTS */}
                            {archivedProjects.map((app, i) => {
                                const key = `${app.projectTitle}::${app.email}`;
                                const isSelected = selectedTrashProjects.includes(key);

                                const statusInfo = getStatusInfo(app.status, app.proposedStatus, app.awaitingApproval, app.clientRejected);
                                
                                return (
                                    <div
                                        key={i}
                                        className="applied-project-card archived-card" 
                                        style={{ position: 'relative' }} 
                                    >
                                        {/* Checkbox for selection */}
                                        <div className="card-selection">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => handleSelectTrashProject(app.projectTitle, app.email, e.target.checked)}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                        </div>
                                        
                                        <div className="card-header">
                                            <strong className="project-title-large">
                                                {app.projectTitle}
                                            </strong>
                                            <span className={`status-badge ${statusInfo.className}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        
                                        <div className="card-details">
                                            <p>
                                                <span className="detail-icon">💰</span> Budget: ₹{app.budget}
                                            </p>
                                            <p>
                                                <span className="detail-icon">📅</span> Deadline: {app.deadline}
                                            </p>
                                            <p className="applied-at-text" style={{ color: '#ef4444', fontWeight: '600' }}>
                                                Archived On: {app.archivedAt || 'N/A'}
                                            </p>
                                        </div>

                                        {/* 🔄 RESTORE BUTTON */}
                                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                            <button
                                                className="dashboard-btn" 
                                                style={{ background: '#22c55e', padding: '8px 15px', fontSize: '13px' }}
                                                onClick={(e) => handleRestoreFromTrash(e, app.projectTitle, app.email)}
                                            >
                                                🔄 Restore Project
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <p className="no-applications">Trash is empty 🎉</p>
                )}
            </div>
        )}

        {/* REPORTS SECTION */}
        {showReports && !showAppliedList && !showTrash && (
            <div className="reports-container applied-list-container">
                <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    📋 Applied Projects Report 
                    <button 
                        className="dashboard-btn" 
                        style={{ background: '#10b981', padding: '10px 20px' }}
                        onClick={() => exportToExcel(appliedProjects, 'Freelancer_Project_Report')}
                    >
                        ⬇️ Download as Excel
                    </button>
                </h3>

                {appliedProjects.length > 0 ? (
                    <div className="report-table-wrapper">
                        <table className="report-table" id="project-report-table">
                            <thead>
                                <tr>
                                    <th>Project Title</th>
                                    <th>Skills</th>
                                    <th>Budget</th>
                                    <th>Deadline</th>
                                    <th>Application Status</th>
                                    <th>Project Status</th> 
                                    <th>Applied On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appliedProjects.map((app, i) => (
                                    <tr key={i}>
                                        <td>{app.projectTitle}</td>
                                        <td>{app.skills}</td>
                                        <td>₹{app.budget}</td>
                                        <td>{app.deadline}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusInfo(app.status).className}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td>
                                          {app.status === 'Accepted' ? (
                                              <span className={`status-badge ${app.projectStatus === 'Completed' ? 'status-accepted' : 'status-pending'}`}>
                                                  {app.projectStatus || 'In Process'}
                                              </span>
                                          ) : (
                                              'N/A'
                                          )}
                                        </td>
                                        <td>{app.appliedAt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-applications">No data available for the report 🚫</p>
                )}
            </div>
        )}
           
        {/* SEARCH RESULTS DISPLAY */}
        {searchTerm && (
          <>
            {filtered.length > 0 ? (
              <div>
                {filtered.map((proj, i) => {
                    const appStatus = getApplicationStatus(proj.title); 
                    const canApply = appStatus === "Not Applied" || appStatus === "Rejected";

                    return (
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
                              opacity: appStatus === "Pending" ? 0.8 : 1, 
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

                            {/* Conditional Button/Message */}
                            {canApply ? (
                                <button
                                    className="apply-btn"
                                    onClick={() => {
                                      setSelectedProject(proj);
                                      setShowForm(true);
                                    }}
                                >
                                    {appStatus === "Rejected" ? 'Apply Again' : 'Apply Now'}
                                </button>
                            ) : (
                                <div style={{ textAlign: 'right' }}>
                                    <span 
                                        className="status-badge" 
                                        style={{ 
                                            padding: '8px 15px', 
                                            fontSize: '14px',
                                            backgroundColor: appStatus === "Pending" ? '#ffedc2' : '#d1fae5',
                                            color: appStatus === "Pending" ? '#d97706' : '#059669',
                                        }}
                                    >
                                        {appStatus === "Pending" && "Already Applied ⏳"}
                                        {appStatus === "Accepted" && "Project Accepted ✅"}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
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
          <div className="modal apply-form-modal">
            {/* Project Details Header */}
            <div style={{ padding: '15px', borderBottom: '2px solid #ddd', marginBottom: '15px', background: '#e0f7fa', borderRadius: '8px' }}>
                <h2 style={{ color: "#007bff", marginBottom: '5px' }}>Applying for: {selectedProject?.title}</h2>
                <p style={{ margin: '3px 0' }}>
                    <strong>💡 Skills:</strong> {selectedProject?.skills}
                </p>
                <p style={{ margin: '3px 0' }}>
                    <strong>💰 Client Budget:</strong> ₹{selectedProject?.budget}
                </p>
                <p style={{ margin: '3px 0' }}>
                    <strong>📝 Description:</strong> <span style={{ fontSize: '14px', color: '#555' }}>
                        {selectedProject?.description?.substring(0, 100)}...
                    </span>
                </p>
                <p style={{ margin: '3px 0' }}>
                    <strong>📅 Expected Deadline:</strong> {selectedProject?.deadline}
                </p>
            </div>
            
            <h3 style={{ color: "#4CAF50", marginTop: '0' }}>Your Proposal Details</h3>
            
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
                placeholder="Why should client hire you? (Detailed Proposal)"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Submit Proposal
                </button>
                <button
                  type="button"
                  className="cancel-btn-form"
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
            <h2
              style={{ textAlign: "center", marginBottom: "10px", color: "#007bff" }}
            >
              {selectedProject?.projectTitle}
            </h2>

            <div
              style={{
                background: "#fff",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "12px",
                boxBoxShadow: "0 2px 6px rgba(0,0,0,0.1)", 
              }}
            >
              <p>
                <strong>💰 Budget:</strong> ₹{selectedProject?.budget}
              </p>
              <p>
                <strong>📅 Deadline:</strong> {selectedProject?.deadline}
              </p>
              <p>
                <strong>🧠 Skills:</strong> {selectedProject?.skills}
              </p>
              <p>
                <strong>📝 Description:</strong> {selectedProject?.description}
              </p>

              {selectedProject?.awaitingApproval && (
                <p style={{ marginTop: "8px", color: "#6c757d" }}>
                  ⏳ Proposed: <b>{selectedProject.proposedStatus}</b> (sent on {" "}
                  {selectedProject.proposedAt})
                </p>
              )}
            </div>

            {/* 🚨 NEW: Display Rejection Message */}
            {selectedProject?.clientRejected && selectedProject?.clientRejectionReason && (
                <div 
                    style={{
                        padding: '10px', 
                        backgroundColor: '#fee2e2', 
                        border: '1px solid #ef4444', 
                        color: '#dc2626', 
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontWeight: '600'
                    }}
                >
                    ❌ Last Status Rejected. Reason: <br/>
                    <span style={{ fontWeight: 'normal', fontStyle: 'italic', color: '#b91c1c' }}>
                        "{selectedProject.clientRejectionReason}"
                    </span>
                </div>
            )}
            
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
              // Disabled only if *currently* awaiting approval (Allows re-proposal if rejected)
              disabled={selectedProject?.awaitingApproval ? true : false} 
            >
              <option value="In Process">In Process</option>
              <option value="Completed">Completed</option>
            </select>
            
            {selectedProject?.awaitingApproval && (
              <p style={{ color: '#dc2626', fontSize: '12px', textAlign: 'center', marginBottom: '15px' }}>
                Status cannot be changed: Proposal already sent and awaiting approval.
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                className="dashboard-btn"
                style={{
                  background: (selectedProject?.awaitingApproval)
                    ? "#6c757d"
                    : "#007bff",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: (selectedProject?.awaitingApproval)
                    ? "not-allowed"
                    : "pointer",
                }}
                onClick={handleSaveStatusProposal}
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

      {/* ⭐ RATING AND REVIEW POPUP */}
      {showRatingPopup && currentRatingProject && (
        <RatingReviewPopup
            projectTitle={currentRatingProject.projectTitle}
            onSubmit={handleRatingSubmit}
            onClose={() => {
                setShowRatingPopup(false);
                setCurrentRatingProject(null);
            }}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// ⭐ SUB-COMPONENT: RatingReviewPopup
// ------------------------------------------------------------------
const RatingReviewPopup = ({ projectTitle, onSubmit, onClose }) => {
    const [rating, setRating] = useState(5); 
    const [review, setReview] = useState("");
    const [hover, setHover] = useState(null); 

    const stars = [1, 2, 3, 4, 5];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (review.trim().length < 10) {
            alert("Please write a review of at least 10 characters.");
            return;
        }
        onSubmit(rating, review);
    };

    const starColor = (s) => {
        const value = hover !== null ? hover : rating; 
        return s <= value ? '#f59e0b' : '#ccc'; 
    };


    return (
        <div className="modal-overlay">
            <div className="modal apply-form-modal" style={{ maxWidth: '450px' }}>
                <h2 style={{ color: "#f59e0b" }}>Rate Client for: {projectTitle}</h2>
                <p style={{ textAlign: 'center', color: '#666' }}>
                    Congratulations! Please provide feedback for the client.
                </p>

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                        Your Rating:
                    </label>
                    <div className="star-rating" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        {stars.map((s) => (
                            <span
                                key={s}
                                style={{
                                    fontSize: '30px',
                                    cursor: 'pointer',
                                    color: starColor(s), 
                                    transition: 'color 0.2s',
                                    margin: '0 3px'
                                }}
                                onClick={() => setRating(s)} 
                                onMouseEnter={() => setHover(s)} 
                                onMouseLeave={() => setHover(null)} 
                            >
                                ⭐
                            </span>
                        ))}
                    </div>
                    
                    <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '20px' }}>
                        {rating} Star{rating !== 1 ? 's' : ''} Selected
                    </p>

                    <textarea
                        placeholder="Write your review about the client/project (min 10 characters)"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        required
                        rows="4"
                    />

                    <div className="form-buttons">
                        <button type="submit" className="submit-btn" style={{ background: '#f59e0b' }}>
                            Submit Rating
                        </button>
                        <button
                            type="button"
                            className="cancel-btn-form"
                            onClick={onClose}
                        >
                            Skip (Rate Later)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default FreelancerDashboard;