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

  // 🆕 1. New States for Profile Dropdown and Account Deletion (Q3, Q5)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAccountDeletePopup, setShowAccountDeletePopup] = useState(false); 
  const [deleteAccountConfirmInput, setDeleteAccountConfirmInput] = useState(""); // 🆕 (Q6)
  
  // States for Rating & Earnings
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
      // Q4: Hide profile dropdown when clicking outside
      if (showProfileDropdown) {
        // Using the container ref for simplicity, adjust if you use a separate ref for profile icon
        const profileIcon = document.querySelector('.profile-icon-container');
        if (profileIcon && !profileIcon.contains(e.target)) {
          setShowProfileDropdown(false);
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showNotificationList, showProfileDropdown]);

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
  
  // Move to Trash (Archive) (Q7)
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

// 🆕 2. Handle Account Deletion Confirmation Input (Q6)
  const handleAccountDeleteConfirmChange = (e) => {
      setDeleteAccountConfirmInput(e.target.value);
  };

// 🆕 3. Handle Final Account Deletion (Q5, Q6)
  const handleFinalAccountDeletion = () => {
      if (deleteAccountConfirmInput !== "DELETE") {
          alert("Please type 'DELETE' exactly to confirm account deletion.");
          return;
      }

      // 🛑 ACCOUNT DELETION LOGIC 🛑
      // NOTE: Clearing data from localStorage simulates a full account deletion for this demo.
      localStorage.removeItem("clientProjects");
      localStorage.removeItem("freelancerApplications");
      localStorage.removeItem("freelancerArchivedApplications");
      localStorage.removeItem("freelancerTotalEarnings");
      localStorage.removeItem("applications"); 
      // ... Add more localStorage keys if needed ...
      
      pushNotification("Goodbye!", "Your account has been permanently deleted.", "error");
      setShowAccountDeletePopup(false);
      setDeleteAccountConfirmInput("");
      navigate("/login"); // Redirect to login page or home page
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
      {/* 🆕 4. TOP NAVBAR (Q1, Q2, Q8: Notification move) */}
      <div className="top-navbar">
        {/* Left Column: Dashboard and Report (Q1 & Q2) */}
        <div className="nav-left-col">
          <div className="nav-item" onClick={() => {
            navigate("/freelancer-dashboard");
            setShowReports(false);
            setShowTrash(false);
            setShowAppliedList(true); // Default view
          }}>
            📊 **Dashboard**
          </div>
          <div 
            className="nav-item"
            onClick={() => {
              setShowReports(true);
              setShowAppliedList(false);
              setShowTrash(false);
            }}
          >
            📈 **Report**
          </div>
        </div>
        
        {/* Right Corner: Notification (Q8) and Profile Icon (Q3, Q4) */}
        <div className="nav-right-col">
          
          {/* 🔔 Notification Icon (MOVED AND ADAPTED) */}
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
    
            
            {/* 🔽 Notification List Dropdown */}
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

          {/* 🆕 5. Profile Icon with Dropdown (Q3 & Q4) */}
          <div 
            className="profile-icon-container" 
            onClick={(e) => {
              e.stopPropagation(); // Prevents document click handler from immediately closing it
              setShowProfileDropdown(prev => !prev);
            }}
          >
            👤 
            
            {showProfileDropdown && (
              <div className="profile-dropdown">
                {/* a) Edit Profile */}
                <div className="dropdown-item" onClick={() => {
                  setShowProfileDropdown(false);
                  navigate("/edit-profile"); // Replace with actual profile route
                }}>
                  📝 Edit Profile
                </div>
                
                {/* b) Trash (Q7) */}
                <div 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowReports(false);
                    setShowAppliedList(false);
                    setShowTrash(true); 
                    setSelectedTrashProjects([]);
                  }}
                >
                  🗑️ Trash ({archivedProjects.length})
                </div>
                
                {/* c) Account (Q5) - Triggers the delete popup */}
                <div 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowAccountDeletePopup(true); 
                  }}
                >
                  ⚙️ Account
                </div>
                
                <hr className="dropdown-divider"/>
                
                {/* d) Logout */}
                <div className="dropdown-item logout" onClick={() => {
                  setShowProfileDropdown(false);
                  navigate("/logout"); // Replace with actual logout route/logic
                }}>
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 🛑 Q1: DELETED OLD SIDEBAR JSX BLOCK HERE 🛑 */}

      <div className="dashboard-content-area">
        {/* ... (The rest of your existing JSX starts here) ... */}
        
        {showReports && (
          <div className="reports-view">
            <h2>📊 Freelancer Reports</h2>
            <div className="report-stats">
              <div className="stat-card total-earnings">
                <h3>Total Earnings</h3>
                <p>₹{totalEarnings.toFixed(2)}</p>
              </div>
              <div className="stat-card completed-projects">
                <h3>Projects Completed</h3>
                <p>
                  {appliedProjects.filter((a) => a.projectStatus === "Completed").length}
                </p>
              </div>
              <div className="stat-card average-rating">
                <h3>Average Client Rating</h3>
                <p>{averageRating > 0 ? `${averageRating} ⭐` : "N/A"}</p>
              </div>
            </div>

            <div className="report-actions">
              <button
                className="btn-export"
                onClick={() =>
                  exportToExcel(
                    appliedProjects.filter((a) => a.status !== "Pending"),
                    "Freelancer_Report"
                  )
                }
              >
                Download Projects Data (Excel)
              </button>
            </div>

            <div className="report-list">
              <h3>Project History</h3>
              {appliedProjects.length === 0 ? (
                <p>No projects applied yet.</p>
              ) : (
                appliedProjects.map((app) => (
                  <div
                    key={app.projectTitle}
                    className="applied-project-item"
                  >
                    <div className="project-details">
                      <h4>{app.projectTitle}</h4>
                      <p>
                        Applied: ₹{app.budget} | Deadline: {app.deadline}
                      </p>
                    </div>
                    <div className="project-status">
                      <span className={`status-badge ${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                      {app.status === "Accepted" && (
                        <span className={`status-badge ${app.projectStatus ? app.projectStatus.toLowerCase().replace(/\s/g, "-") : "in-process"}`}>
                          {app.projectStatus || "In Process"}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showAppliedList && (
          <div className="applied-list-view">
            <h2>My Applications</h2>
            {appliedProjects.length === 0 ? (
              <p>You have not applied for any projects yet.</p>
            ) : (
              appliedProjects
                .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
                .map((app) => {
                  const { text, className } = getStatusInfo(
                    app.status,
                    app.proposedStatus,
                    app.awaitingApproval,
                    app.clientRejected
                  );

                  return (
                    <div
                      key={app.projectTitle + app.appliedAt}
                      className="applied-project-item"
                      onClick={() =>
                        app.status === "Accepted"
                          ? handleAcceptedProjectClick(app)
                          : null
                      }
                    >
                      <div className="project-details">
                        <h4>{app.projectTitle}</h4>
                        <p>
                          Your Proposal: ₹{app.budget} | Deadline:{" "}
                          {app.deadline}
                        </p>
                        {app.status === "Accepted" && (
                          <p className="current-status-text">
                            Current Project Status:{" "}
                            <strong>{app.projectStatus || "In Process"}</strong>
                          </p>
                        )}
                      </div>
                      <div className="project-actions">
                        <span className={`status-badge ${className}`}>{text}</span>
                        {app.status === "Pending" && (
                          <button
                            className="btn-withdraw"
                            onClick={(e) =>
                              handleWithdrawApplication(e, app.projectTitle, app.email)
                            }
                          >
                            Withdraw
                          </button>
                        )}
                        
                        {/* Q7: Move to Trash button for Rejected/Completed/Pending */}
                        {app.status !== "Accepted" && (
                          <button
                            className="btn-trash"
                            onClick={(e) =>
                              handleMoveToTrash(e, app.projectTitle, app.email)
                            }
                          >
                            🗑️ Archive
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* 🆕 6. TRASH / ARCHIVED VIEW (Q7) */}
        {showTrash && (
          <div className="trash-view">
            <h2>🗑️ Trash / Archived Applications ({archivedProjects.length})</h2>
            
            {archivedProjects.length > 0 && (
              <div className="trash-actions-bar">
                <label>
                  <input 
                    type="checkbox"
                    onChange={(e) => handleSelectAllTrash(e.target.checked)}
                    checked={selectedTrashProjects.length === archivedProjects.length && archivedProjects.length > 0}
                    disabled={archivedProjects.length === 0}
                  />
                  Select All
                </label>
                <button 
                  className="btn-permanent-delete" 
                  onClick={handlePermanentDelete}
                  disabled={selectedTrashProjects.length === 0}
                >
                  🔥 Permanently Delete ({selectedTrashProjects.length})
                </button>
              </div>
            )}
            
            {archivedProjects.length === 0 ? (
              <p>The trash is empty.</p>
            ) : (
              archivedProjects
                .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt))
                .map((app) => {
                  const key = `${app.projectTitle}::${app.email}`;
                  return (
                    <div
                      key={key}
                      className="applied-project-item trash-item"
                    >
                      <div className="project-details">
                        <input 
                          type="checkbox"
                          checked={selectedTrashProjects.includes(key)}
                          onClick={(e) => e.stopPropagation()} // Prevent card click
                          onChange={(e) => handleSelectTrashProject(app.projectTitle, app.email, e.target.checked)}
                        />
                        <h4>{app.projectTitle} (Original Status: {app.status})</h4>
                        <p>
                          Archived: {app.archivedAt} | Proposal: ₹{app.budget}
                        </p>
                      </div>
                      <div className="project-actions">
                        <button
                          className="btn-restore"
                          onClick={(e) =>
                            handleRestoreFromTrash(e, app.projectTitle, app.email)
                          }
                        >
                          ↩️ Restore
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* The rest of your existing project search/list code */}
        {!showReports && !showAppliedList && !showTrash && (
          <div className="project-list-view">
            <h2>Open Projects</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by required skills (e.g., React, Node)"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="projects-grid">
              {(filtered.length > 0 ? filtered : projects).map(
                (project) => {
                  const appStatus = getApplicationStatus(project.title);
                  const isApplied = appStatus !== "Not Applied";
                  return (
                    <div
                      key={project.title}
                      className={`project-card ${
                        isApplied ? "applied" : ""
                      }`}
                      onClick={() => {
                        if (!isApplied) {
                          setSelectedProject(project);
                          setShowForm(true);
                        }
                      }}
                    >
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <p>
                        **Budget:** ₹{project.budget} | **Deadline:**{" "}
                        {project.deadline}
                      </p>
                      <p className="skills">
                        **Skills:** {project.skills}
                      </p>
                      {isApplied && (
                        <span className={`status-tag ${appStatus.toLowerCase()}`}>
                          {appStatus}
                        </span>
                      )}
                    </div>
                  );
              }
              )}
            </div>
          </div>
        )}

        {showForm && (
          <div className="popup-overlay" onClick={() => setShowForm(false)}>
            <div className="popup" onClick={(e) => e.stopPropagation()}>
              <h2>Apply for: {selectedProject.title}</h2>
              <p>Skills: {selectedProject.skills}</p>
              <p>Budget: ₹{selectedProject.budget}</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Proposed Budget (e.g., 50000)"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  required
                />
                <input
                  type="date"
                  placeholder="Proposed Deadline"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Reason for applying (max 300 words)"
                  maxLength={1800} // ~300 words
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                ></textarea>
                <div className="popup-actions">
                  <button type="submit" className="btn-submit">
                    Submit Proposal
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAcceptedPopup && selectedProject && (
          <div
            className="popup-overlay"
            onClick={() => setShowAcceptedPopup(false)}
          >
            <div className="popup" onClick={(e) => e.stopPropagation()}>
              <h2>Project: {selectedProject.projectTitle}</h2>
              <p>
                **Your Proposal:** ₹{selectedProject.budget} by{" "}
                {selectedProject.deadline}
              </p>
              <p>
                **Current Status:**{" "}
                <span
                  className={`status-badge ${selectedProject.projectStatus ? selectedProject.projectStatus.toLowerCase().replace(/\s/g, "-") : "in-process"}`}
                >
                  {selectedProject.projectStatus || "In Process"}
                </span>
              </p>

              {selectedProject.clientRejected && (
                <div className="rejection-box">
                  <strong>❌ Client Rejected Proposal:</strong> 
                  <p>{selectedProject.clientRejectionReason || "No reason provided."}</p>
                  <p>Please update status and re-propose.</p>
                </div>
              )}
              
              <h3>Update Status</h3>
              <select
                value={status}
                onChange={handleStatusChange}
                disabled={selectedProject.projectStatus === "Completed" || selectedProject.awaitingApproval}
              >
                <option value="In Process">In Process (Client approval needed)</option>
                <option value="In Review">In Review (Client approval needed)</option>
                <option value="Completed">Completed (Client final approval needed)</option>
              </select>
              <div className="popup-actions">
                <button
                  onClick={handleSaveStatusProposal}
                  className="btn-submit"
                  disabled={selectedProject.projectStatus === "Completed" || selectedProject.awaitingApproval}
                >
                  {selectedProject.awaitingApproval ? `Awaiting Approval (${selectedProject.proposedStatus})` : 'Propose Status Change'}
                </button>
                <button
                  onClick={handleChat}
                  className="btn-chat"
                >
                  💬 Chat with Client
                </button>
                <button
                  onClick={() => setShowAcceptedPopup(false)}
                  className="btn-cancel"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🆕 7. Account Delete Confirmation Popup (Q5 & Q6) */}
      {showAccountDeletePopup && (
        <div className="popup-overlay">
          <div className="popup account-delete-popup" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Delete Your Account</h3>
            <p>This action is permanent and cannot be undone. All your project data, applications, and earnings will be erased.</p>
            <p>To confirm, please type **DELETE** in the box below:</p>
            <input
              type="text"
              value={deleteAccountConfirmInput}
              onChange={handleAccountDeleteConfirmChange}
              placeholder="Type DELETE"
              className="delete-input"
            />
            <div className="popup-actions">
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowAccountDeletePopup(false);
                  setDeleteAccountConfirmInput("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                disabled={deleteAccountConfirmInput !== "DELETE"}
                onClick={handleFinalAccountDeletion}
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
          <div className="popup-close-area" onClick={() => setShowAccountDeletePopup(false)}></div>
        </div>
      )}
    
      {showRatingPopup && currentRatingProject && (
        <RatingPopup 
          projectName={currentRatingProject.projectTitle}
          onRate={handleRatingSubmit}
          onClose={() => setShowRatingPopup(false)}
        />
      )}
    </div> 
  );
}

// ----------------------------------------------------
// NOTE: Assuming RatingPopup is defined elsewhere or imported
// If RatingPopup is not defined, please add it here:
// const RatingPopup = ({ projectName, onRate, onClose }) => { /* ... implementation ... */ };
// ----------------------------------------------------

export default FreelancerDashboard;