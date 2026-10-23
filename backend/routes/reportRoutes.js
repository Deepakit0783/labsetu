
const express = require("express");
const router = express.Router();

const {
  uploadReport,
  getMyReports,
  downloadReport,
  releaseReport,
  getAllReports,
} = require("../controllers/reportController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

// ========================================
// ADMIN: Get uploaded reports for review
// GET /api/reports/admin/all
// ========================================
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllReports
);

// ========================================
// CUSTOMER: View released reports only
// GET /api/reports/my
// ========================================
router.get(
  "/my",
  protect,
  authorize("customer"),
  getMyReports
);

// ========================================
// ADMIN / LAB STAFF: Upload report PDF
// POST /api/reports/:bookingId/upload
// ========================================
router.post(
  "/:bookingId/upload",
  protect,
  authorize("admin", "lab"),
  upload.single("report"),
  uploadReport
);

// ========================================
// ADMIN: Release report to customer
// PATCH /api/reports/:id/release
// ========================================
router.patch(
  "/:id/release",
  protect,
  authorize("admin"),
  releaseReport
);

// ========================================
// Download report with authorization checks
// GET /api/reports/:id/download
// ========================================
router.get(
  "/:id/download",
  protect,
  downloadReport
);

module.exports = router;
