
const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getUsers,
  getActiveAgents,
  updateUserStatus,
  getAllBookings,
  assignAgent,
  updateBookingStatus,
  createAgent,
  createLabStaff,
} = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// All routes below are accessible only to logged-in admins.
router.use(protect, authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Users
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);

// Agents
router.get("/agents", getActiveAgents);
router.post("/agents", createAgent);

// Lab Staff
router.post("/lab-staff", createLabStaff);

// Bookings
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/assign-agent", assignAgent);
router.patch("/bookings/:id/status", updateBookingStatus);

module.exports = router;
