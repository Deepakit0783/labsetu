
const mongoose = require("mongoose");
const Test = require("../models/Test");
const Lab = require("../models/Lab");

// GET: List active tests
exports.getTests = async (req, res, next) => {
  try {
    const tests = await Test.find({ isActive: true })
      .populate("lab", "name city state")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (error) {
    next(error);
  }
};

// GET: Single test
exports.getTestById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const test = await Test.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("lab", "name city state");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    res.status(200).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

// POST: Create test (admin only)
exports.createTest = async (req, res, next) => {
  try {
    const { name, description, price, duration, category, lab } =
      req.body || {};

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid test name and price are required",
      });
    }

    if (lab && !mongoose.isValidObjectId(lab)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab ID",
      });
    }

    if (lab) {
      const existingLab = await Lab.findOne({
        _id: lab,
        isActive: true,
      });

      if (!existingLab) {
        return res.status(400).json({
          success: false,
          message: "Selected lab does not exist or is inactive",
        });
      }
    }

    const test = await Test.create({
      name: name.trim(),
      description,
      price: Number(price),
      duration,
      category,
      lab: lab || null,
    });

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      test,
    });
  } catch (error) {
    next(error);
  }
};

// PUT: Update test (admin only)
exports.updateTest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const allowedFields = [
      "name", "description", "price", "duration",
      "category", "lab", "isActive",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.price !== undefined &&
      (updates.price === "" ||
        !Number.isFinite(Number(updates.price)) ||
        Number(updates.price) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }

    if (updates.lab) {
      if (!mongoose.isValidObjectId(updates.lab)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lab ID",
        });
      }

      const labExists = await Lab.findOne({
        _id: updates.lab,
        isActive: true,
      });

      if (!labExists) {
        return res.status(400).json({
          success: false,
          message: "Selected lab does not exist or is inactive",
        });
      }
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE: Soft-delete test (admin only)
exports.deleteTest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Test deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};
