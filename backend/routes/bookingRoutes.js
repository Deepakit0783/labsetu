
const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getLabCompletedBookings,
} = require("../controllers/bookingController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Admin routes
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllBookings
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateBookingStatus
);

// Lab Staff routes
router.get(
  "/lab/completed",
  protect,
  authorize("lab"),
  getLabCompletedBookings
);

// Customer routes
router.post(
  "/",
  protect,
  authorize("customer"),
  createBooking
);

router.get(
  "/my",
  protect,
  authorize("customer"),
  getMyBookings
);

router.get(
  "/:id",
  protect,
  authorize("customer"),
  getBookingById
);

router.patch(
  "/:id/cancel",
  protect,
  authorize("customer"),
  cancelBooking
);

module.exports = router;
