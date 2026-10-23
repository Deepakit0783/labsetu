const express = require("express");
const router = express.Router();

const {
  getAssignedBookings,
  updateAssignedBookingStatus,
} = require("../controllers/agentController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.use(protect, authorize("agent"));

router.get("/bookings", getAssignedBookings);
router.patch("/bookings/:id/status", updateAssignedBookingStatus);

module.exports = router;