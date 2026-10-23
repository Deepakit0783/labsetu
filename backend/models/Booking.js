
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
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

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Patient details
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      maxlength: 100,
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"],
    },

    tests: [
      {
        test: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Test",
          required: [true, "Test is required"],
        },
        price: {
          type: Number,
          required: [true, "Test price is required"],
          min: [0, "Test price cannot be negative"],
        },
      },
    ],

    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
    },

    collectionType: {
      type: String,
      enum: ["home", "lab"],
      required: [true, "Please select a collection type"],
    },

    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    city: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    state: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
      match: [
        /^$|^[1-9][0-9]{5}$/,
        "Enter a valid 6-digit Indian PIN code",
      ],
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "sample-collected",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
      required: [true, "Please select a payment method"],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ lab: 1, bookingDate: 1 });
bookingSchema.index({ agent: 1, bookingDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
