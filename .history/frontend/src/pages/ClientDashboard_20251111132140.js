import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { FaUserCircle } from "react-icons/fa";

// --- START: UI Style Constants (COLORFUL & ATTRACTIVE PALETTE) ---
const colors = {
    primary: '#6f42c1', 
    secondary: '#fd7e14', 
    success: '#20c997', 
    danger: '#dc3545', 
    info: '#007bff', 
    warning: '#ffc107', 
    background: '#f0f7f8ff', 
    cardBackground: '#ffffff', 
    text: '#343a40', 
    lightText: '#6c757d', 
};

// Z-INDEX HIERARCHY:
// 1000: Notification List, Base Modal (View Applications, Edit Project)
// 1050: Top Modal Overlay (Rejection/Rating)
// 1100: Top Modal Content (Rejection/Rating)
const styles = {
    dashboardContainer: {
        padding: "40px 30px",
        background: 'linear-gradient(135deg, #e0f7fa 0%, #f9fbe7 100%)', 
        minHeight: "100vh",
        position: "relative",
        fontFamily: 'Arial, sans-serif', 
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        color: colors.text,
    },
    notificationIconContainer: {
        position: 'relative',
        cursor: 'pointer',
        fontSize: '22px', 
        padding: '12px',
        marginRight: '20px',
        display: 'inline-block',
        backgroundColor: colors.cardBackground,
        borderRadius: '50%',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, background-color 0.3s',
        color: colors.primary, 
        zIndex: 950, 
    },
    badge: {
        position: 'absolute',
        top: '0px',
        right: '0px',
        background: colors.danger, 
        color: 'white',
        borderRadius: '50%',
        padding: '3px 7px',
        fontSize: '11px',
        fontWeight: 'bold',
        minWidth: '20px',
        textAlign: 'center',
        boxShadow: '0 0 5px rgba(0,0,0,0.3)',
    },
    // PROFESSIONAL SCROLLABLE NOTIFICATION LIST
    notificationList: {
        position: 'absolute',
        top: '55px', 
        right: '0',
        width: '320px', 
        maxHeight: '400px', // Fixed max height for scroll
        overflowY: 'auto', // Scrollable content
        background: colors.cardBackground,
        borderRadius: '10px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${colors.primary}20`,
        zIndex: 1000, 
        transformOrigin: 'top right',
        animation: 'fadeInScale 0.2s ease-out',
        padding: '0',
    },
    notificationHeader: {
        padding: '15px',
        backgroundColor: colors.primary,
        color: 'white',
        fontWeight: 'bold',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        position: 'sticky', 
        top: 0,
        zIndex: 1001,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
    },
    // STYLE FOR MARK ALL AS READ BUTTON IN HEADER
    markAllReadButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'normal',
        transition: 'background-color 0.2s',
        marginLeft: '10px',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)', 
        }
    },
    listItemUnread: {
        padding: '15px',
        borderBottom: `1px solid ${colors.background}`,
        backgroundColor: colors.background, 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    listItemRead: {
        padding: '15px',
        borderBottom: `1px solid ${colors.background}`,
        backgroundColor: colors.cardBackground, 
        color: colors.lightText,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    // View Applications / Edit Project Modal Overlay (Base Modal)
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, 
    },
    modalContent: {
        background: 'linear-gradient(to bottom right, #ffffff, #f7f7f7)',
        padding: "35px", 
        borderRadius: "15px",
        maxWidth: "800px", 
        width: "95%",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)", 
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    // REJECTION/RATING/PROPOSAL MODAL OVERLAY (Higher Z-index for overlaying base modal)
    topModalOverlay: { 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050, 
    },
    rejectionModal: {
        background: 'white',
        padding: "30px",
        borderRadius: "10px",
        maxWidth: "400px",
        width: "90%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        textAlign: 'left',
        zIndex: 1100, // Highest Z-index for content
    },
    textarea: {
        width: '100%',
        minHeight: '100px',
        padding: '10px',
        margin: '10px 0 20px 0',
        borderRadius: '8px',
        border: `1px solid ${colors.lightText}60`,
        boxSizing: 'border-box',
        fontSize: '14px',
        resize: 'vertical',
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
        color: colors.cardBackground,
        border: 'none',
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: 'background-color 0.2s, transform 0.1s',
    },
    buttonDanger: {
        backgroundColor: colors.danger,
        color: colors.cardBackground,
        border: 'none',
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: 'background-color 0.2s, transform 0.1s',
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
        color: colors.cardBackground,
        border: 'none',
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: 'background-color 0.2s, transform 0.1s',
    },
    buttonSuccess: {
        backgroundColor: colors.success,
        color: colors.cardBackground,
        border: 'none',
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: 'background-color 0.2s, transform 0.1s',
    },
    projectCardBase: {
        background: colors.cardBackground,
        padding: "20px",
        borderRadius: "15px",
        border: `1px solid #e9ecef`,
        width: 'calc(25% - 15px)', 
        minWidth: '250px', 
        flexGrow: 0,
        flexShrink: 0, 
        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)", 
        transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        cursor: 'pointer',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 0, 
    },
    projectGridContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '30px',
    },
    summaryCard: {
        padding: "25px 20px", 
        borderRadius: "15px", 
        flex: "1",
        textAlign: "center",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)", 
        transition: 'transform 0.2s',
        minWidth: '200px',
        border: '1px solid #eee',
    },
    summaryColors: {
        total: { background: '#fff0f5', color: colors.primary }, 
        active: { background: '#e6ffed', color: colors.success }, 
        completed: { background: '#fff7e6', color: colors.secondary }, 
    },
    buttonExcel: {
        backgroundColor: '#1E7543', 
        color: colors.cardBackground,
        border: 'none',
        padding: "8px 14px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: 'background-color 0.2s, transform 0.1s',
        boxShadow: '0 4px 6px rgba(30, 117, 67, 0.3)',
        fontSize: '14px',
    },
    ratingModalContent: {
        background: 'linear-gradient(145deg, #ffffff, #f0f8ff)', 
        padding: "40px", 
        borderRadius: "20px", 
        maxWidth: "450px",
        width: "90%",
        textAlign: 'center',
        boxShadow: "0 15px 40px rgba(0,0,0,0.5), 0 0 0 10px #6f42c130", 
        transform: 'scale(0.8)', 
        transition: 'transform 0.4s ease-out',
        zIndex: 1100, 
    },
    starsContainer: {
        fontSize: '35px',
        margin: '20px 0',
        cursor: 'pointer',
        color: '#ccc',
    },
    starIcon: {
        color: '#FFD700', 
        transition: 'transform 0.1s ease-in-out, opacity 0.2s',
        padding: '0 5px',
    },
    reviewTextarea: {
        width: '100%',
        minHeight: '100px',
        padding: '10px',
        borderRadius: '10px', 
        border: `2px solid ${colors.primary}40`, 
        marginTop: '15px',
        marginBottom: '20px',
        resize: 'vertical',
        fontFamily: 'inherit',
        fontSize: '14px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
    },
    submitButton: {
        backgroundColor: colors.success,
        color: colors.cardBackground,
        border: 'none',
        padding: "12px 25px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: 'background-color 0.2s, transform 0.1s',
        fontSize: '16px',
        boxShadow: '0 4px 8px rgba(32, 201, 151, 0.3)',
    },
    skipButton: {
        backgroundColor: colors.lightText,
        color: colors.cardBackground,
        border: 'none',
        padding: "12px 25px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: 'background-color 0.2s, transform 0.1s',
        fontSize: '16px',
    },
    editModalContent: {
        background: 'linear-gradient(to bottom right, #ffffff, #f7f7f7)',
        padding: "35px", 
        borderRadius: "15px",
        maxWidth: "550px",
        width: "90%",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '8px 0 15px 0',
        borderRadius: '8px',
        border: `1px solid ${colors.lightText}60`,
        boxSizing: 'border-box',
        fontSize: '14px',
    },
};
// --- END: UI Style Constants ---

// --- NOTIFICATION CONSTANT ---
const MAX_NOTIFICATIONS = 50; 

// =========================================================================
// CUSTOM MODAL 1: Application Rejection Reason 
// =========================================================================
const RejectionReasonModal = ({ isOpen, onClose, onSubmit, targetApp }) => {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (reason.trim() === "") {
            alert("Please provide a rejection reason.");
            return;
        }
        onSubmit(reason);
        setReason("");
    };

    if (!isOpen || !targetApp) return null;

    return (
        <div style={styles.topModalOverlay} onClick={() => { setReason(""); onClose(); }}> 
            <div style={styles.rejectionModal} onClick={(e) => e.stopPropagation()}>
                <h4 style={{ color: colors.danger, margin: '0 0 10px 0' }}>❌ Reject Application</h4>
                <p style={{ color: colors.text, fontSize: '14px', marginBottom: '15px' }}>
                    **Freelancer: {targetApp.email}**
                </p>
                <label style={{ fontWeight: 'bold', color: colors.text }}>
                    Reason for Rejection (This will be visible to the Freelancer):
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={styles.textarea}
                    placeholder="E.g., Budget too high, lack of relevant experience, etc."
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={handleSubmit} style={styles.buttonDanger}>
                        Submit Rejection
                    </button>
                    <button onClick={() => { setReason(""); onClose(); }} style={{ ...styles.buttonSecondary, backgroundColor: colors.lightText }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// CUSTOM MODAL 2: Proposal Rejection Reason 
// =========================================================================
const ProposalRejectionModal = ({ isOpen, onClose, onSubmit, targetApp }) => {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (reason.trim() === "") {
            alert("Please provide a rejection reason.");
            return;
        }
        onSubmit(reason);
        setReason("");
    };

    if (!isOpen || !targetApp) return null;

    return (
        <div style={styles.topModalOverlay} onClick={() => { setReason(""); onClose(); }}> 
            <div style={styles.rejectionModal} onClick={(e) => e.stopPropagation()}>
                <h4 style={{ color: colors.danger, margin: '0 0 10px 0' }}>❌ Reject Status Proposal</h4>
                <p style={{ color: colors.text, fontSize: '14px', marginBottom: '15px' }}>
                    **Freelancer: {targetApp.email}** proposed status: **{targetApp.proposedStatus}**
                </p>
                <label style={{ fontWeight: 'bold', color: colors.text }}>
                    Reason for Rejecting Proposal (This will be visible to the Freelancer):
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={styles.textarea}
                    placeholder="E.g., Task not fully complete, work quality not satisfactory, etc."
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={handleSubmit} style={styles.buttonDanger}>
                        Submit Rejection
                    </button>
                    <button onClick={() => { setReason(""); onClose(); }} style={{ ...styles.buttonSecondary, backgroundColor: colors.lightText }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


/**
 * Component for the Rate and Review Popup. 
 */
const RatingReviewPopup = memo(({
    showRatingPopup,
    currentRatingProject,
    rating,
    setRating,
    review,
    setReview,
    handleSubmitRating,
    setShowRatingPopup
}) => {
    if (!showRatingPopup || !currentRatingProject) return null;

    const starElements = [];
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= rating;
        starElements.push(
            <span
                key={i}
                style={{
                    ...styles.starIcon,
                    opacity: isActive ? 1 : 0.4,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
                onClick={() => setRating(i)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.opacity = 1; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = isActive ? 'scale(1.1)' : 'scale(1)'; e.currentTarget.style.opacity = isActive ? 1 : 0.4; }}
            >
                ★
            </span>
        );
    }

    const handleReviewChange = (e) => setReview(e.target.value);

    return (
        <div style={{ ...styles.topModalOverlay, zIndex: 1050, opacity: showRatingPopup ? 1 : 0 }}> 
            <div style={{ ...styles.ratingModalContent, transform: showRatingPopup ? 'scale(1)' : 'scale(0.8)' }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ color: colors.primary, marginBottom: '5px' }}>🌟 Rate and Review 🌟</h3>
                <p style={{ color: colors.lightText, marginBottom: '20px' }}>
                    Thank you for successfully completing the project **{currentRatingProject.title}**.
                </p>
                <h4 style={{ color: colors.text }}>How many stars would you give?</h4>
                <div style={styles.starsContainer}>
                    {starElements}
                </div>
                
                <textarea
                    style={styles.reviewTextarea}
                    placeholder="Write about your experience (e.g., quality of work, communication, timely delivery)..."
                    value={review}
                    onChange={handleReviewChange} 
                ></textarea>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button
                        type="button"
                        onClick={handleSubmitRating}
                        style={styles.submitButton}
                    >
                        Submit Rating
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowRatingPopup(false)}
                        style={styles.skipButton}
                    >
                        Not Now
                    </button>
                </div>
            </div>
        </div>
    );
});


const EditProjectModal = ({ project, onClose, onSave }) => {
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description);
    const [budget, setBudget] = useState(project.budget);
    const [deadline, setDeadline] = useState(project.deadline);

    const handleSave = () => {
        if (!title || !description || !budget || !deadline) {
            alert("All fields must be filled.");
            return;
        }
        onSave({ 
            ...project, 
            title: project.title, 
            description, 
            budget, 
            deadline 
        });
        onClose();
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.editModalContent} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ color: colors.primary }}>✏️ Edit Project: {project.title}</h3>
                <hr />

                <div>
                    <label style={{ fontWeight: 'bold', color: colors.text }}>Title (Cannot be changed)</label>
                    <input type="text" value={title} readOnly style={{...styles.input, backgroundColor: '#f5f5f5'}} />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', color: colors.text }}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={styles.textarea}></textarea>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', color: colors.text }}>Budget ($)</label>
                    <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} style={styles.input} />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', color: colors.text }}>Deadline (YYYY-MM-DD)</label>
                    <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={styles.input} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                    <button onClick={handleSave} style={styles.buttonSuccess}>
                        💾 Save Changes
                    </button>
                    <button onClick={onClose} style={{...styles.buttonDanger, backgroundColor: colors.lightText}}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


// =========================================================================
// MAIN COMPONENT
// =========================================================================

function ClientDashboard() {
    const [projects, setProjects] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editProject, setEditProject] = useState(null); 
    const [notifications, setNotifications] = useState([]);
    const [showNotificationList, setShowNotificationList] = useState(false);

    const [hoveredProjectIndex, setHoveredProjectIndex] = useState(null); 
    
    // Rating/Review States 
    const [showRatingPopup, setShowRatingPopup] = useState(false);
    const [currentRatingProject, setCurrentRatingProject] = useState(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState(''); 
    
    // States for Rejection Modals
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingAppIndex, setRejectingAppIndex] = useState(null); 
    const [showProposalRejectModal, setShowProposalRejectModal] = useState(false);
    const [rejectingProposalApp, setRejectingProposalApp] = useState(null);


    const navigate = useNavigate();
    
    const notificationRef = useRef(null);
    const iconRef = useRef(null);

    const previousApplicationsRef = useRef([]);

    // Data Loading and Storage Listeners
    useEffect(() => {
        const loadInitialData = () => {
            const savedProjects = JSON.parse(localStorage.getItem("clientProjects")) || [];
            const savedApplications = JSON.parse(localStorage.getItem("applications")) || [];
            let savedNotifications = JSON.parse(localStorage.getItem("clientNotifications")) || [];
            
            // Limit notifications upon initial load
            if (savedNotifications.length > MAX_NOTIFICATIONS) {
                // Keep the newest (highest ID) notifications, which are at the start of the array
                savedNotifications = savedNotifications.slice(0, MAX_NOTIFICATIONS);
                localStorage.setItem("clientNotifications", JSON.stringify(savedNotifications));
            }
            
            setProjects(savedProjects);
            setApplications(prevApps => {
                if (JSON.stringify(prevApps) !== JSON.stringify(savedApplications)) {
                    previousApplicationsRef.current = prevApps; 
                }
                return savedApplications;
            });
            setNotifications(savedNotifications);
        };

        loadInitialData();

        const handleStorageChange = (event) => {
            if (event.key === 'applications' || event.key === 'clientProjects') {
                loadInitialData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); 
    
    // Notification Generation Logic
    useEffect(() => {
        const currentApplications = applications; 
        const oldApplications = previousApplicationsRef.current; 
        
        const existingProjectTitles = new Set(projects.map(p => p.title));


        // 1. Check for NEW Application
        if (currentApplications.length > oldApplications.length) {
            const newApp = currentApplications.find(app => 
                !oldApplications.some(oldApp => 
                    oldApp.projectTitle === app.projectTitle && oldApp.email === app.email
                ) && existingProjectTitles.has(app.projectTitle) 
            );
            if (newApp) {
                addNotification(`🔔 New Application for: ${newApp.projectTitle} from ${newApp.name}`, 'application', newApp.projectTitle);
            }
        }
        
        // 2. Check for STATUS CHANGE (or Proposal)
        currentApplications.forEach(currentApp => {
            if (!existingProjectTitles.has(currentApp.projectTitle)) {
                return;
            }

            const previousApp = oldApplications.find(prevApp => 
                prevApp.projectTitle === currentApp.projectTitle && prevApp.email === currentApp.email
            );

            if (previousApp) {
                const statusChanged = currentApp.projectStatus && previousApp.projectStatus !== currentApp.projectStatus;
                const proposalMade = currentApp.awaitingApproval && !previousApp.awaitingApproval;

                if (statusChanged) {
                    addNotification(
                        `📌 Status Updated: Freelancer for ${currentApp.projectTitle} changed status to ${currentApp.projectStatus}`,
                        'info',
                        currentApp.projectTitle
                    );
                } else if (proposalMade) {
                    addNotification(
                        `✍️ New Proposal: Freelancer for ${currentApp.projectTitle} is awaiting your approval on a status change to ${currentApp.proposedStatus}.`,
                        'warning',
                        currentApp.projectTitle
                    );
                }
            }
        });

        previousApplicationsRef.current = currentApplications; 
        
    }, [applications, projects]); 
    
    // Click outside notification list listener
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target) &&
                iconRef.current && !iconRef.current.contains(event.target)) {
                setShowNotificationList(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    // Helper functions
    const saveNotifications = (updated) => {
        // Sort notifications: Unread first, then by ID (newest first)
        const sorted = updated.sort((a, b) => {
            if (a.isRead !== b.isRead) {
                return a.isRead ? 1 : -1; // Unread comes first
            }
            return b.id - a.id; // Newest comes first
        });
        
        // NEW LOGIC: Limit the array length to MAX_NOTIFICATIONS
        const limitedNotifications = sorted.slice(0, MAX_NOTIFICATIONS);

        setNotifications(limitedNotifications);
        localStorage.setItem("clientNotifications", JSON.stringify(limitedNotifications));
    };

    const addNotification = (message, type = 'info', projectTitle = null) => {
        const newNotification = {
            id: Date.now(),
            message: message,
            type: type,
            isRead: false,
            timestamp: new Date().toLocaleTimeString(),
            projectTitle: projectTitle 
        };

        setNotifications(prevNotifications => {
            const updatedNotifications = [newNotification, ...prevNotifications];
            
            // Apply the saving/limiting logic here as well
            const sorted = updatedNotifications.sort((a, b) => {
                if (a.isRead !== b.isRead) {
                    return a.isRead ? 1 : -1; 
                }
                return b.id - a.id; 
            });
            
            // NEW LOGIC: Truncate array to MAX_NOTIFICATIONS
            const limitedNotifications = sorted.slice(0, MAX_NOTIFICATIONS);
            
            localStorage.setItem("clientNotifications", JSON.stringify(limitedNotifications));
            return limitedNotifications;
        });
    };

    // MARK ALL AS READ FUNCTION
    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        saveNotifications(updated); // saveNotifications handles sorting and limiting
    };

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

    const handleEditSave = (updatedProject) => {
        const updated = projects.map((p) =>
            p.title === updatedProject.title ? updatedProject : p
        );
        saveProjects(updated);
        setEditProject(null); 
        alert(`Project "${updatedProject.title}" updated successfully!`);
    };

    const getApplicationsForProject = (title) =>
        applications.filter((app) => app.projectTitle === title);

    const handleChatOpen = (projectTitle, freelancerEmail) => {
        navigate(`/chat?projectTitle=${encodeURIComponent(projectTitle)}&freelancerEmail=${encodeURIComponent(freelancerEmail)}`);
    };

    // Notification click -> Open Project Modal Fix
    const handleNotificationClick = (notification) => {
        if ((notification.type === 'application' || notification.type === 'info' || notification.type === 'warning') && notification.projectTitle) {
            
            const updatedNotifications = notifications.map(n => 
                n.id === notification.id ? { ...n, isRead: true } : n
            );
            saveNotifications(updatedNotifications); // saveNotifications handles sorting and limiting
            
            const project = projects.find(p => p.title === notification.projectTitle);
            if (project) {
                setSelectedProject(project);
                setShowModal(true); // Open the View Applications Modal
            } else {
                alert(`Project "${notification.projectTitle}" not found or may have been deleted.`);
            }
        }
        
        setShowNotificationList(false);
    };


    // Application Rejection Modal Trigger
    const handleRejectClick = (i, title) => {
        const projectApps = getApplicationsForProject(title);
        const targetApp = projectApps[i]; 
        if (!targetApp) return;
        if (targetApp.status === "Accepted") {
            alert("⚠️ Cannot reject this application. It has already been ACCEPTED.");
            return;
        }

        setRejectingAppIndex(i);
        setShowRejectModal(true);
    };

    // Final Application Rejection Logic (Called from RejectionReasonModal)
    const handleFinalApplicationRejection = (reason) => {
        const title = selectedProject.title;
        const i = rejectingAppIndex;
        const projectApps = getApplicationsForProject(title);
        const targetApp = projectApps[i]; 

        // 1. Update Client's Application List (Applications in Client Dashboard)
        const newAppList = applications.map((app) =>
            app.projectTitle === title && app.email === targetApp.email
                ? { ...app, status: "Rejected", rejectionReason: reason } 
                : app
        );
        
        setApplications(newAppList);
        localStorage.setItem("applications", JSON.stringify(newAppList)); 

        // 2. Update Freelancer's Application List (***CRITICAL STEP FOR FREELANCER FEEDBACK***)
        const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
        const updatedFreelancerApps = freelancerApps.map((app) =>
            app.projectTitle === title && app.email === targetApp.email
                ? { ...app, status: "Rejected", rejectionReason: reason } // **REJECTION REASON ADDED HERE**
                : app
        );
        localStorage.setItem("freelancerApplications", JSON.stringify(updatedFreelancerApps));

        alert(`Application Rejected successfully! Reason: ${reason}`);
        setShowRejectModal(false);
        setRejectingAppIndex(null);
    };
    
    // Application Acceptance Logic
    const handleAcceptClick = (i, title) => {
        const projectApps = getApplicationsForProject(title);
        const targetApp = projectApps[i]; 

        if (!targetApp) return;

        // 1. Update Client Applications
        const newAppList = applications.map((app) =>
            app.projectTitle === title && app.email === targetApp.email
                ? { ...app, status: "Accepted", rejectionReason: undefined, projectStatus: 'Active' } 
                : app
        );
        
        setApplications(newAppList);
        localStorage.setItem("applications", JSON.stringify(newAppList)); 

        // 2. Update Freelancer Applications (Clear rejection reason if it was set)
        const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
        const updatedFreelancerApps = freelancerApps.map((app) =>
            app.projectTitle === title && app.email === targetApp.email
                ? { ...app, status: "Accepted", rejectionReason: undefined, projectStatus: 'Active' } 
                : app
        );
        localStorage.setItem("freelancerApplications", JSON.stringify(updatedFreelancerApps));

        // 3. Update Client Projects status
        const updatedProjects = projects.map((p) => {
            if (p.title === title && p.status !== 'Completed') {
                return { ...p, status: 'Active' };
            }
            return p;
        });
        saveProjects(updatedProjects);

        alert(`Application Accepted successfully!`);
    };


    // Proposal Approval Logic
    const handleApproveProposal = (email, title) => {
        const apps = JSON.parse(localStorage.getItem("applications")) || [];
        const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];
        const clientProjects = JSON.parse(localStorage.getItem("clientProjects")) || [];

        const approvedApp = apps.find((a) => a.projectTitle === title && a.email === email);
        const newStatus = approvedApp?.proposedStatus || approvedApp?.projectStatus || 'Active';

        const updatedApps = apps.map((a) => {
            if (a.projectTitle === title && a.email === email) {
                return {
                    ...a,
                    projectStatus: newStatus,
                    awaitingApproval: false,
                    approvedByClient: true,
                    proposedStatus: undefined,
                    proposalRejectionReason: undefined, 
                    clientRejected: false,
                };
            }
            return a;
        });

        const updatedFreelancerApps = freelancerApps.map((a) => {
            if (a.projectTitle === title && a.email === email) {
                return {
                    ...a,
                    projectStatus: newStatus,
                    awaitingApproval: false,
                    approvedByClient: true,
                    proposedStatus: undefined,
                    proposalRejectionReason: undefined, 
                    clientRejected: false,
                };
            }
            return a;
        });

        const updatedProjects = clientProjects.map((p) => {
            if (p.title === title) {
                if (p.status !== newStatus) {
                    p.status = newStatus;
                }
            }
            return p;
        });

        localStorage.setItem("applications", JSON.stringify(updatedApps));
        localStorage.setItem("freelancerApplications", JSON.stringify(updatedFreelancerApps));
        localStorage.setItem("clientProjects", JSON.stringify(updatedProjects));
        
        setApplications(updatedApps);
        setProjects(updatedProjects);

        alert("✅ Freelancer status approved and project status updated.");
        addNotification(`✅ Status Approved: Project ${title} is now ${newStatus}`, 'success', title);
        
        if (newStatus === 'Completed') {
            setCurrentRatingProject({ title, email });
            setShowModal(false); 
            setTimeout(() => {
                setShowRatingPopup(true); 
            }, 300);
        }
    };
    
    // Proposal Rejection Modal Trigger
    const handleRejectProposalClick = (app) => {
        setRejectingProposalApp(app);
        setShowProposalRejectModal(true);
    };

    // Final Proposal Rejection Logic (Called from ProposalRejectionModal)
    const handleFinalProposalRejection = (reason) => {
        const { email, projectTitle } = rejectingProposalApp;

        const apps = JSON.parse(localStorage.getItem("applications")) || [];
        const freelancerApps = JSON.parse(localStorage.getItem("freelancerApplications")) || [];

        const updatedApps = apps.map((a) => {
            if (a.projectTitle === projectTitle && a.email === email) {
                return {
                    ...a,
                    awaitingApproval: false,
                    clientRejected: true,
                    proposedStatus: undefined,
                    proposalRejectionReason: reason, 
                };
            }
            return a;
        });

        const updatedFreelancerApps = freelancerApps.map((a) => {
            if (a.projectTitle === projectTitle && a.email === email) {
                return {
                    ...a,
                    awaitingApproval: false,
                    clientRejected: true,
                    proposedStatus: undefined,
                    proposalRejectionReason: reason, 
                };
            }
            return a;
        });

        localStorage.setItem("applications", JSON.stringify(updatedApps));
        localStorage.setItem("freelancerApplications", JSON.stringify(updatedFreelancerApps));
        
        setApplications(updatedApps);
        
        alert(`❌ Freelancer's proposed status was not approved. Reason: ${reason}`);
        addNotification(`❌ Status Rejected: Proposal for Project ${projectTitle} was not approved`, 'error', projectTitle);
        
        setShowProposalRejectModal(false);
        setRejectingProposalApp(null);
    };


    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return colors.success;
            case 'Active':
                return colors.primary;
            case 'Pending':
                return colors.secondary;
            default:
                return colors.lightText;
        }
    };

    const handleSubmitRating = useCallback(() => {
        if (rating === 0) {
            alert("Please select a rating (1-5 stars)!");
            return;
        }

        const newRatingData = {
            projectTitle: currentRatingProject.title,
            freelancerEmail: currentRatingProject.email,
            rating: rating,
            review: review,
            timestamp: new Date().toLocaleString()
        };
        
        const allRatings = JSON.parse(localStorage.getItem("clientRatings")) || [];
        allRatings.push(newRatingData);
        localStorage.setItem("clientRatings", JSON.stringify(allRatings));

        setRating(0);
        setReview('');
        setCurrentRatingProject(null);
        setShowRatingPopup(false);
        alert("Thank you! Your rating and review have been submitted successfully.");
    }, [rating, review, currentRatingProject]);

    // CSV Download Logic (remains the same)
    const handleDownloadApplications = useCallback((projectTitle) => {
        const projectApplications = getApplicationsForProject(projectTitle);
        
        if (projectApplications.length === 0) {
            alert("No applications available to download for this project.");
            return;
        }

        const headers = [
            "Project Name", 
            "Freelancer Name", 
            "Freelancer Email ID", 
            "Proposed Amount", 
            "Deadline", 
            "Reason",
            "Application Status" 
        ];
        
        const csvRows = projectApplications.map(app => {
            return [
                `"${projectTitle.replace(/"/g, '""')}"`, 
                `"${(app.name || 'N/A').replace(/"/g, '""')}"`, 
                `"${app.email.replace(/"/g, '""')}"`,    
                `"${(app.proposedAmount ? app.proposedAmount : 'N/A').replace(/"/g, '""')}"`, 
                `"${(app.deadline ? app.deadline : 'N/A').replace(/"/g, '""')}"`, 
                `"${(app.reason ? app.reason : 'No reason provided').replace(/"/g, '""')}"`,
                `"${app.status.replace(/"/g, '""')}"` 
            ].join(',');
        });

        const csvContent = [
            headers.join(','),
            ...csvRows
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        if (link.download !== undefined) { 
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${projectTitle.replace(/\s/g, '_')}_Applications.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert(`✅ Applications for "${projectTitle}" downloaded successfully!`);
        } else {
            alert('Your browser does not support automatic CSV download. Please save the page source as a CSV file.');
        }

    }, [applications]); 

    // Find the currently rejecting application for the Rejection Modal
    const currentRejectingApp = selectedProject && rejectingAppIndex !== null 
        ? getApplicationsForProject(selectedProject.title)[rejectingAppIndex] 
        : null;

    return (
        <div style={styles.dashboardContainer}>
            
            {/* RENDER CUSTOM REJECTION MODALS (Always at the top layer) */}
            <RejectionReasonModal 
                isOpen={showRejectModal && currentRejectingApp}
                onClose={() => setShowRejectModal(false)}
                onSubmit={handleFinalApplicationRejection}
                targetApp={currentRejectingApp}
            />
            <ProposalRejectionModal
                isOpen={showProposalRejectModal && rejectingProposalApp}
                onClose={() => setShowProposalRejectModal(false)}
                onSubmit={handleFinalProposalRejection}
                targetApp={rejectingProposalApp}
            />

            {/* RENDER MEMOIZED RATING POPUP */}
            <RatingReviewPopup 
                showRatingPopup={showRatingPopup}
                currentRatingProject={currentRatingProject}
                rating={rating}
                setRating={setRating}
                review={review}
                setReview={setReview}
                handleSubmitRating={handleSubmitRating}
                setShowRatingPopup={setShowRatingPopup}
            />

            {/* RENDER EDIT PROJECT MODAL */}
            {editProject && (
                <EditProjectModal
                    project={editProject}
                    onClose={() => setEditProject(null)}
                    onSave={handleEditSave}
                />
            )}
            
            {/* Header and Notification Icon Wrapper */}
            <div style={styles.header}>
                <h2 style={{ margin: 0, color: colors.primary }}>📊 Client Dashboard</h2>
                
                {/* Notification Icon and List Container */}
                <div style={{ position: "absolute", top: "20px", right: "20px", display: 'flex', alignItems: 'center' }}>
                    
                    {/* Notification Icon */}
                    <div
                        ref={iconRef} 
                        onClick={() => { 
                            setShowNotificationList(!showNotificationList); 
                        }}
                        style={styles.notificationIconContainer}
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span style={styles.badge}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    
                    {/* Notification List Dropdown (Scrollable) */}
                    {showNotificationList && (
                        <div ref={notificationRef} style={styles.notificationList}>
                            {/* UPDATED NOTIFICATION HEADER WITH MARK ALL AS READ BUTTON */}
                            <div style={styles.notificationHeader}>
                                <span>Notifications ({notifications.length})</span>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllAsRead} 
                                        style={styles.markAllReadButton}
                                    >
                                        Mark All as Read
                                    </button>
                                )}
                            </div>
                            {/* END UPDATED HEADER */}

                            {notifications.length === 0 ? (
                                <div style={{ padding: '15px', color: colors.lightText }}>No new notifications.</div>
                            ) : (
                                notifications.map((n) => ( 
                                    <div 
                                        key={n.id} 
                                        style={n.isRead ? styles.listItemRead : styles.listItemUnread}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <p style={{ margin: '0 0 5px 0', fontWeight: n.isRead ? 'normal' : 'bold', color: n.isRead ? colors.lightText : colors.text }}>
                                            {n.message}
                                        </p>
                                        <small style={{ color: colors.lightText }}>{n.timestamp}</small>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => navigate("/post-project")}
                        style={{ ...styles.buttonPrimary, marginLeft: '20px', padding: '10px 20px', fontSize: '14px' }}
                    >
                        ➕ Create Project
                    </button>
                </div>
            </div>
            
            <div style={{ clear: 'both' }}></div>

            {/* Summary Cards */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
                <div style={{ ...styles.summaryCard, background: styles.summaryColors.total.background, color: styles.summaryColors.total.color }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>Total Projects</h3>
                    <p style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{projects.length}</p>
                </div>
                <div style={{ ...styles.summaryCard, background: styles.summaryColors.active.background, color: styles.summaryColors.active.color }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>Active Projects</h3>
                    <p style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{projects.filter(p => p.status === 'Active').length}</p>
                </div>
                <div style={{ ...styles.summaryCard, background: styles.summaryColors.completed.background, color: styles.summaryColors.completed.color }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>Completed Projects</h3>
                    <p style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{projects.filter(p => p.status === 'Completed').length}</p>
                </div>
            </div>
            
            <hr style={{ border: `0.5px solid ${colors.lightText}20`, marginBottom: '30px' }} />

            {/* Project List */}
            <h2 style={{ color: colors.text, marginBottom: '20px' }}>Your Posted Projects 📝</h2>
            
            <div style={styles.projectGridContainer}>
                {projects.length === 0 ? (
                    <p style={{ color: colors.lightText }}>You have not posted any projects yet. Click 'Create Project' to start!</p>
                ) : (
                    projects.map((project, index) => {
                        const projectApplications = getApplicationsForProject(project.title);
                        
                        return (
                            <div
                                key={index}
                                style={{
                                    ...styles.projectCardBase,
                                    borderLeft: `5px solid ${getStatusColor(project.status)}`
                                }}
                                onMouseEnter={() => setHoveredProjectIndex(index)}
                                onMouseLeave={() => setHoveredProjectIndex(null)}
                            >
                                <div>
                                    <h4 style={{ color: colors.primary, marginTop: 0, marginBottom: '10px' }}>{project.title}</h4>
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: colors.lightText }}>
                                        Budget: **${project.budget}**
                                    </p>
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: colors.lightText }}>
                                        Deadline: **{project.deadline}**
                                    </p>
                                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                        Applications: **{projectApplications.length}**
                                    </p>
                                    <p style={{ 
                                        margin: '15px 0 10px 0', 
                                        fontWeight: 'bold', 
                                        color: getStatusColor(project.status),
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        backgroundColor: `${getStatusColor(project.status)}15`,
                                        display: 'inline-block',
                                        fontSize: '13px',
                                    }}>
                                        Status: {project.status}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setSelectedProject(project); 
                                            setShowModal(true); 
                                        }}
                                        style={styles.buttonSecondary}
                                    >
                                        View Applications ({projectApplications.length})
                                    </button>
                                    {/* EDIT BUTTON */}
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setEditProject(project); 
                                        }}
                                        style={{ ...styles.buttonPrimary, backgroundColor: colors.info, padding: '10px 14px' }}
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(index); }}
                                        style={{ ...styles.buttonDanger, padding: '10px 14px' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Applications Modal (Base layer, Z-index 1000) */}
            {showModal && selectedProject && (
                <div style={styles.modalOverlay} onClick={() => {
                    // Prevent closing base modal if higher z-index modals are open
                    if (!showRejectModal && !showProposalRejectModal) {
                        setShowModal(false);
                    }
                }}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ color: colors.primary, borderBottom: `2px solid ${colors.primary}30`, paddingBottom: '10px' }}>
                            Applications for: {selectedProject.title}
                        </h3>
                        
                        {/* Download Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                             <button
                                onClick={() => handleDownloadApplications(selectedProject.title)}
                                style={styles.buttonExcel}
                            >
                                💾 Download Applications to Excel (.csv)
                            </button>
                        </div>

                        {getApplicationsForProject(selectedProject.title).length === 0 ? (
                            <p style={{ color: colors.lightText }}>No applications received yet for this project.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: colors.background }}>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${colors.primary}` }}>Freelancer</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${colors.primary}` }}>Proposed Amount</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${colors.primary}` }}>Deadline</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${colors.primary}` }}>Status / Reason</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${colors.primary}` }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getApplicationsForProject(selectedProject.title).map((app, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${colors.background}` }}>
                                            {/* Freelancer Column */}
                                            <td style={{ padding: '10px', verticalAlign: 'top', fontSize: '14px', color: colors.text }}>
                                                <strong>{app.name || 'N/A'}</strong><br />
                                                <span style={{ color: colors.lightText }}>{app.email}</span>
                                            </td>
                                            {/* Proposed Amount Column */}
                                            <td style={{ padding: '10px', verticalAlign: 'top', fontSize: '14px', color: colors.text, fontWeight: 'bold' }}>
                                                ${app.proposedAmount || 'N/A'}
                                            </td>
                                            {/* Deadline Column */}
                                            <td style={{ padding: '10px', verticalAlign: 'top', fontSize: '14px', color: colors.lightText }}>
                                                {app.deadline || 'N/A'}
                                            </td>
                                            {/* Status / Reason Column */}
                                            <td style={{ padding: '10px', verticalAlign: 'top', fontSize: '14px' }}>
                                                <span style={{ 
                                                    color: app.status === 'Accepted' ? colors.success : app.status === 'Rejected' ? colors.danger : colors.info,
                                                    fontWeight: 'bold',
                                                }}>
                                                    {app.status}
                                                </span>
                                                {/* Display Application Rejection Reason */}
                                                {app.status === 'Rejected' && app.rejectionReason && (
                                                     <p style={{ 
                                                        marginTop: '8px', 
                                                        marginBottom: '0', 
                                                        fontSize: '12px', 
                                                        color: colors.danger,
                                                        borderLeft: `3px solid ${colors.danger}50`,
                                                        paddingLeft: '5px',
                                                        fontStyle: 'italic',
                                                    }}>
                                                        Client Rejection Reason: {app.rejectionReason}
                                                    </p>
                                                )}
                                                
                                                {/* Display Project Status and Proposal Info */}
                                                {app.projectStatus && app.status === 'Accepted' && (
                                                    <div style={{ marginTop: '5px', fontSize: '12px', color: colors.text }}>
                                                        <span style={{ color: colors.primary, fontWeight: 'bold' }}>Project Status:</span> {app.projectStatus}
                                                        {app.awaitingApproval && (
                                                            <span style={{ color: colors.warning, marginLeft: '5px', fontWeight: 'bold' }}>
                                                                (Proposal: {app.proposedStatus})
                                                            </span>
                                                        )}
                                                        {/* Display Proposal Rejection Reason */}
                                                        {app.clientRejected && app.proposalRejectionReason && (
                                                            <p style={{ 
                                                                marginTop: '8px', 
                                                                marginBottom: '0', 
                                                                fontSize: '12px', 
                                                                color: colors.danger,
                                                                borderLeft: `3px solid ${colors.danger}50`,
                                                                paddingLeft: '5px',
                                                                fontStyle: 'italic',
                                                            }}>
                                                                Proposal Rejected: {app.proposalRejectionReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Original Reason for application */}
                                                <p style={{ 
                                                    marginTop: '8px', 
                                                    marginBottom: '0', 
                                                    fontSize: '12px', 
                                                    color: colors.lightText,
                                                    borderLeft: `3px solid ${colors.info}50`,
                                                    paddingLeft: '5px',
                                                    fontStyle: 'italic',
                                                }}>
                                                    Freelancer's App Reason: {app.reason ? app.reason.substring(0, 100) + (app.reason.length > 100 ? '...' : '') : 'No reason provided.'}
                                                </p>
                                            </td>
                                            {/* Actions Column */}
                                            <td style={{ padding: '10px', verticalAlign: 'top', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {app.status === 'Pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAcceptClick(i, selectedProject.title)}
                                                            style={{ ...styles.buttonPrimary, padding: '8px 12px', fontSize: '12px' }}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectClick(i, selectedProject.title)}
                                                            style={{ ...styles.buttonDanger, padding: '8px 12px', fontSize: '12px' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {app.status === 'Accepted' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleChatOpen(selectedProject.title, app.email)}
                                                            style={{ ...styles.buttonSuccess, padding: '8px 12px', fontSize: '12px', backgroundColor: colors.success }}
                                                        >
                                                            💬 Chat Now
                                                        </button>
                                                        {app.awaitingApproval && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApproveProposal(app.email, selectedProject.title)}
                                                                    style={{ ...styles.buttonPrimary, backgroundColor: colors.warning, padding: '8px 12px', fontSize: '12px' }}
                                                                >
                                                                    ✅ Approve '{app.proposedStatus}'
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectProposalClick(app)}
                                                                    style={{ ...styles.buttonDanger, padding: '8px 12px', fontSize: '12px' }}
                                                                >
                                                                    ❌ Reject Proposal
                                                                </button>
                                                            </>
                                                        )}
                                                        {!app.awaitingApproval && app.clientRejected && (
                                                            <span style={{ color: colors.danger, fontSize: '12px', fontWeight: 'bold' }}>Proposal Rejected</span>
                                                        )}
                                                    </>
                                                )}
                                                {app.status === 'Rejected' && (
                                                    <span style={{ color: colors.danger, fontSize: '12px', fontWeight: 'bold' }}>Application Rejected</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <button
                            onClick={() => setShowModal(false)}
                            style={{ ...styles.buttonSecondary, marginTop: '20px', backgroundColor: colors.lightText }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default ClientDashboard;