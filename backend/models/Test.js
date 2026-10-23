
const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Test name is required"],
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

    price: {
      type: Number,
      required: [true, "Test price is required"],
      min: [0, "Price cannot be negative"],
    },

    duration: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    category: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      default: null,
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

module.exports = mongoose.model("Test", testSchema);
