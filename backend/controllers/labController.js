
const mongoose = require("mongoose");
const Lab = require("../models/Lab");

// GET: All active labs
exports.getLabs = async (req, res, next) => {
  try {
    const labs = await Lab.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: labs.length,
      labs,
    });
  } catch (error) {
    next(error);
  }
};

// GET: Single lab
exports.getLabById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab ID",
      });
    }

    const lab = await Lab.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }

    res.status(200).json({ success: true, lab });
  } catch (error) {
    next(error);
  }
};

// POST: Create lab (admin only)
exports.createLab = async (req, res, next) => {
  try {
    const {
      name, description, email, phone, address,
      city, state, pincode, logo, openingHours, homeCollection,
    } = req.body || {};

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof city !== "string" ||
      !city.trim() ||
      typeof state !== "string" ||
      !state.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, address, city and state are required",
      });
    }

    if (
      typeof pincode !== "string" ||
      !/^[1-9][0-9]{5}$/.test(pincode.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit PIN code",
      });
    }

    const lab = await Lab.create({
      name: name.trim(),
      description,
      email,
      phone,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      logo,
      openingHours,
      homeCollection: Boolean(homeCollection),
    });

    res.status(201).json({
      success: true,
      message: "Lab created successfully",
      lab,
    });
  } catch (error) {
    next(error);
  }
};

// PUT: Update lab (admin only)
exports.updateLab = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab ID",
      });
    }

    const allowedFields = [
      "name", "description", "email", "phone", "address",
      "city", "state", "pincode", "logo", "openingHours",
      "homeCollection", "isActive",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.pincode !== undefined &&
      (typeof updates.pincode !== "string" ||
        !/^[1-9][0-9]{5}$/.test(updates.pincode.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit PIN code",
      });
    }

    if (typeof updates.name === "string") {
      updates.name = updates.name.trim();
    }

    const lab = await Lab.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lab updated successfully",
      lab,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE: Soft-delete lab (admin only)
exports.deleteLab = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab ID",
      });
    }

    const lab = await Lab.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Lab not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lab deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};
