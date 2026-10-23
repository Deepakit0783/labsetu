const Booking = require("../models/Booking");

// Get bookings assigned to the logged-in agent
exports.getAssignedBookings = async (req, res, next) => {
  try {
    const filter = {
      agent: req.user._id,
    };

    if (req.query.status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "sample-collected",
        "completed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status",
        });
      }

      filter.bookingStatus = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate("customer", "name email phone")
      .populate("lab", "name address city state phone")
      .populate("tests.test", "name category duration")
      .sort({ bookingDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Update status of a booking assigned to this agent
exports.updateAssignedBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Agents can collect samples or complete assigned bookings.
    const allowedStatuses = ["sample-collected", "completed"];

    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Agent can only update status to sample-collected or completed",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      agent: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Assigned booking not found",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be updated",
      });
    }

    if (bookingStatus === "sample-collected") {
      if (booking.bookingStatus !== "confirmed") {
        return res.status(400).json({
          success: false,
          message: "Only confirmed bookings can be marked sample-collected",
        });
      }
    }

    if (bookingStatus === "completed") {
      if (booking.bookingStatus !== "sample-collected") {
        return res.status(400).json({
          success: false,
          message: "Collect the sample before completing the booking",
        });
      }
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Assigned booking status updated successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};
// Admin assigns an agent to a booking
exports.assignAgentToBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { agentId } = req.body;

    if (
      !/^[0-9a-fA-F]{24}$/.test(bookingId) ||
      !/^[0-9a-fA-F]{24}$/.test(agentId || "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid booking ID and agent ID are required.",
      });
    }

    const User = require("../models/User");

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (["cancelled", "completed"].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cancelled or completed bookings cannot be assigned.",
      });
    }

    const agent = await User.findOne({
      _id: agentId,
      role: "agent",
      isActive: true,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Active agent not found.",
      });
    }

    booking.agent = agent._id;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name email phone")
      .populate("lab", "name address city state phone")
      .populate("tests.test", "name category duration")
      .populate("agent", "name email phone");

    return res.status(200).json({
      success: true,
      message: "Agent assigned successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};