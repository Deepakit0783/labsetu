
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs/promises");

const Report = require("../models/Report");
const Booking = require("../models/Booking");

// POST /api/reports/:bookingId/upload
// Upload a PDF report for a completed booking
exports.uploadReport = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { testId, remarks } = req.body || {};

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (!mongoose.isValidObjectId(testId || "")) {
      return res.status(400).json({
        success: false,
        message: "A valid test ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF report",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Admin can upload for any Lab.
    // Lab Staff can upload only for their assigned Lab.
    const isAssignedLab =
      req.user.role === "lab" &&
      req.user.lab &&
      String(booking.lab) === String(req.user.lab);

    if (req.user.role !== "admin" && !isAssignedLab) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).json({
        success: false,
        message: "You are not authorized to upload this report",
      });
    }

    if (booking.bookingStatus !== "completed") {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: "Reports can only be uploaded for completed bookings",
      });
    }

    const bookingTest = booking.tests.find(
      (item) => String(item.test) === String(testId)
    );

    if (!bookingTest) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: "This test does not belong to the booking",
      });
    }

    const existingReport = await Report.findOne({
      booking: booking._id,
      test: testId,
    });

    if (existingReport) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(409).json({
        success: false,
        message: "A report already exists for this test and booking",
      });
    }

    const report = await Report.create({
      booking: booking._id,
      customer: booking.customer,
      lab: booking.lab,
      test: testId,
      reportFile: req.file.filename,
      remarks: typeof remarks === "string" ? remarks.trim() : "",
      status: "uploaded",
      uploadedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Report uploaded successfully. It is awaiting release.",
      data: report,
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// GET /api/reports/my
// Customers can see only their own released reports.
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({
      customer: req.user._id,
      status: "released",
    })
      .select("-reportFile")
      .populate("booking", "bookingDate bookingStatus")
      .populate("lab", "name")
      .populate("test", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/reports/:id/release
// Only Admin can release an uploaded report.
exports.releaseReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status === "released") {
      return res.status(409).json({
        success: false,
        message: "This report has already been released",
      });
    }

    if (report.status !== "uploaded" && report.status !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Only uploaded or verified reports can be released",
      });
    }

    report.status = "released";
    report.releasedAt = new Date();
    report.releasedBy = req.user._id;

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report released successfully",
      data: {
        id: report._id,
        status: report.status,
        releasedAt: report.releasedAt,
        releasedBy: report.releasedBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/:id/download
// Customers can download only their own released reports.
exports.downloadReport = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const isCustomer =
      req.user.role === "customer" &&
      String(report.customer) === String(req.user._id);

    const isAssignedLab =
      req.user.role === "lab" &&
      req.user.lab &&
      String(report.lab) === String(req.user.lab);

    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isAssignedLab && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to download this report",
      });
    }

    // Never allow a customer to download a report before release.
    if (isCustomer && report.status !== "released") {
      return res.status(403).json({
        success: false,
        message: "This report has not been released yet",
      });
    }

    const filename = path.basename(report.reportFile);
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "reports",
      filename
    );

    // Confirm that the file exists before sending it.
    await fs.access(filePath);

    return res.download(filePath, filename, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Report file not found on the server",
      });
    }

    next(error);
  }
};

// Admin: Get reports awaiting release
exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find({
      status: { $in: ["uploaded", "verified"] },
    })
      .populate("customer", "name email phone")
      .populate("lab", "name city state")
      .populate("test", "name")
      .populate("booking", "patientName bookingStatus")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

