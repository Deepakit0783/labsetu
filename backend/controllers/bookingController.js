
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Lab = require("../models/Lab");
const Test = require("../models/Test");
const Payment = require("../models/Payment");

// Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const {
      lab,
      tests,
      bookingDate,
      collectionType,
      patientName,
      mobile,
      address,
      city,
      state,
      pincode,
      paymentMethod,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !lab ||
      !Array.isArray(tests) ||
      tests.length === 0 ||
      !bookingDate ||
      !collectionType ||
      !paymentMethod ||
      !patientName?.trim() ||
      !/^[0-9]{10}$/.test(mobile || "")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid patient name, 10-digit mobile number and all required booking details.",
      });
    }

    // Validate IDs
    if (
      !mongoose.isValidObjectId(lab) ||
      !tests.every((item) =>
        mongoose.isValidObjectId(
          typeof item === "string" ? item : item?.test
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab or test ID.",
      });
    }

    if (!["home", "lab"].includes(collectionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection type.",
      });
    }

    if (!["online", "cash"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    // Validate date
    const selectedDate = new Date(bookingDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date.",
      });
    }

    // Compare calendar dates, not just current time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingDay = new Date(selectedDate);
    bookingDay.setHours(0, 0, 0, 0);

    if (bookingDay < today) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past.",
      });
    }

    // Validate home collection details
    if (collectionType === "home") {
      if (
        !address?.trim() ||
        !city?.trim() ||
        !state?.trim() ||
        !/^[1-9][0-9]{5}$/.test(pincode || "")
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid address, city, state and 6-digit PIN code are required for home collection.",
        });
      }
    }

    // Find active lab
    const selectedLab = await Lab.findOne({
      _id: lab,
      isActive: true,
    });

    if (!selectedLab) {
      return res.status(404).json({
        success: false,
        message: "Active lab not found.",
      });
    }

    const testIds = tests.map((item) =>
      typeof item === "string" ? item : item.test
    );

    // Prevent duplicate tests
    if (new Set(testIds.map(String)).size !== testIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate tests are not allowed.",
      });
    }

    // Find active tests
    const selectedTests = await Test.find({
      _id: { $in: testIds },
      isActive: true,
    });

    if (selectedTests.length !== testIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more tests are unavailable.",
      });
    }

    // Validate test/lab relationship
    const wrongLabTest = selectedTests.some(
      (test) =>
        test.lab &&
        test.lab.toString() !== selectedLab._id.toString()
    );

    if (wrongLabTest) {
      return res.status(400).json({
        success: false,
        message: "One or more tests do not belong to the selected lab.",
      });
    }

    // Calculate price on the server
    const totalAmount = selectedTests.reduce(
      (sum, test) => sum + Number(test.price),
      0
    );

    // Create booking
    const booking = await Booking.create({
      customer: req.user._id,
      lab: selectedLab._id,
      patientName: patientName.trim(),
      mobile,
      tests: selectedTests.map((test) => ({
        test: test._id,
        price: test.price,
      })),
      bookingDate: selectedDate,
      collectionType,
      address: collectionType === "home" ? address.trim() : "",
      city: collectionType === "home" ? city.trim() : "",
      state: collectionType === "home" ? state.trim() : "",
      pincode: collectionType === "home" ? pincode : "",
      totalAmount,
      paymentMethod,
      paymentStatus: "pending",
      bookingStatus: "pending",
      notes: notes || "",
    });

    // Create payment record
    try {
      await Payment.create({
        booking: booking._id,
        customer: req.user._id,
        amount: totalAmount,
        paymentMethod,
        paymentStatus: "pending",
      });
    } catch (paymentError) {
      await Booking.findByIdAndDelete(booking._id);
      throw paymentError;
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Get logged-in customer's bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
    })
      .populate("lab", "name address city phone")
      .populate("tests.test", "name description duration")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get one booking owned by the logged-in customer
exports.getBookingById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
      .populate("lab", "name address city phone")
      .populate("tests.test", "name description duration");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel pending booking
exports.cancelBooking = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.bookingStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled.",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Paid booking cancellation requires the refund process.",
      });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    await Payment.updateMany(
      {
        booking: booking._id,
        paymentStatus: { $in: ["pending", "failed"] },
      },
      {
        $set: { paymentStatus: "failed" },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email mobile phone")
      .populate("lab", "name city state phone")
      .populate("tests.test", "name category duration")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "sample-collected",
      "completed",
      "cancelled",
    ];

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be updated.",
      });
    }

    if (
      booking.bookingStatus === "completed" &&
      status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be moved to another status.",
      });
    }

    if (status === "cancelled" && booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Paid booking cancellation requires the refund process.",
      });
    }

    booking.bookingStatus = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name email mobile phone")
      .populate("lab", "name city state phone")
      .populate("tests.test", "name category duration");

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
// Lab Staff: Get completed bookings for their assigned lab
exports.getLabCompletedBookings = async (req, res, next) => {
  try {
    if (req.user.role !== "lab" || !req.user.lab) {
      return res.status(403).json({
        success: false,
        message: "Your account is not assigned to a laboratory.",
      });
    }

    const bookings = await Booking.find({
      lab: req.user.lab,
      bookingStatus: "completed",
    })
      .populate("customer", "name email phone")
      .populate("lab", "name city state")
      .populate("tests.test", "name category duration")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};