
const mongoose = require("mongoose");

const labSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lab name is required"],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 254,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },

    address: {
      type: String,
      required: [true, "Lab address is required"],
      trim: true,
      maxlength: 500,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
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
      required: [true, "PIN code is required"],
      trim: true,
      match: [
        /^[1-9][0-9]{5}$/,
        "Enter a valid 6-digit Indian PIN code",
      ],
    },

    logo: {
      type: String,
      default: "",
    },

    openingHours: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    homeCollection: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lab", labSchema);
