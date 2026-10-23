
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: [true, "Lab is required"],
    },

    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: [true, "Test is required"],
    },

    reportFile: {
      type: String,
      required: [true, "Report file path is required"],
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["pending", "uploaded", "verified", "released"],
      default: "uploaded",
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    releasedAt: {
      type: Date,
      default: null,
    },

    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ customer: 1, createdAt: -1 });
reportSchema.index({ booking: 1 });

module.exports = mongoose.model("Report", reportSchema);
