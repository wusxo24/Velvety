const BookingRequest = require('../models/BookingRequest');
const Consultant = require("../models/Consultant");
const mongoose = require('mongoose');

exports.createBookingRequest = async (req, res) => {
  const { serviceID, customerID, date, time, consultantID } = req.body;

  if (!serviceID || !customerID || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newBooking = new BookingRequest({
      serviceID,
      customerID,
      date,
      time,
      consultantID,
      status: req.body.status || "Pending",
      isConsultantAssignedByCustomer: req.body.isConsultantAssignedByCustomer || false,
    });

    const bookingRequest = await newBooking.save();
    res.status(201).json(bookingRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create booking request" });
  }
};


exports.getAllBookingRequests = async (req, res) => {
  try {
    const bookingRequests = await BookingRequest.find()
      .populate("serviceID", "name")
      .populate("consultantID", "firstName lastName email");
    res.status(200).json(bookingRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignConsultant = async (req, res) => {
  try {
    const { consultantID } = req.body;
    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { consultantID },
      { new: true }
    );

    if (!bookingRequest) {
      return res.status(404).json({ message: "Booking Request not found" });
    }

    await logUserActivity("Assigned Consultant")(req, res, () => { });
    res.status(200).json(bookingRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignService = async (req, res) => {
  try {
    const { serviceID } = req.body;
    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { serviceID },
      { new: true }
    );
    if (!bookingRequest) return res.status(404).json({ message: 'Booking Request not found' });
    await logUserActivity("Assigned Service")(req, res, () => { });
    res.status(200).json(bookingRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBookingRequestStatus = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { status: newStatus } = req.body;
    if (!newStatus) {
      return res.status(400).json({ message: "Status is required" });
    }

    const bookingRequest = await BookingRequest.findById(req.params.id);
    if (!bookingRequest) {
      return res.status(404).json({ message: "Booking Request not found" });
    }

    const validTransitions = {
      "Pending": ["Confirmed"],
      "Confirmed": ["Completed"],
      "Cancelled": [],  // No valid transitions from Cancelled
      "Completed": [],  // No valid transitions from Completed
    };

    const currentStatus = bookingRequest.status;

    console.log(`Current Status: ${currentStatus}, New Status: ${newStatus}`);

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'`
      });
    }

    bookingRequest.status = newStatus;
    await bookingRequest.save();
    res.status(200).json({ message: "Status updated successfully", bookingRequest });

  } catch (error) {
    console.error("Error upx`dating status:", error); 
    res.status(500).json({ error: error.message });
  }
};

// API: Lấy danh sách booking của consultant theo ngày
exports.getBookingsByConsultantAndDate = async (req, res) => {
  try {
    const { consultantID, date } = req.query;

    if (!consultantID || !date) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const bookings = await BookingRequest.find({
      consultantID,
      date: new Date(date).toISOString().split("T")[0] // Chỉ lấy ngày, bỏ giờ phút giây
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};


exports.getConsultantBookings = async (req, res) => {
  console.log(" Checking req.user:", req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }

  try {
    const bookings = await BookingRequest.find({ consultantID: req.user.id }) // Lấy userId từ token
      .populate("customerID", "firstName lastName")
      .populate("serviceID", "name");
      
    res.json({ bookings });
  } catch (error) {
    console.error(" Error fetching consultant bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getCustomerBookings = async (req, res) => {
  console.log("🔍 Checking req.user:", req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }

  try {
    const bookings = await BookingRequest.find({ customerID: req.user.id }) // Lấy lịch sử đặt lịch của khách hàng
      .populate("consultantID", "firstName lastName")
      .populate("serviceID", "name");

    res.json({ bookings });
  } catch (error) {
    console.error(" Error fetching customer bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelBookingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Request ID:", id);

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Find the booking request
    const booking = await BookingRequest.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking Request not found" });
    }

    // Ensure the user is the owner of the booking request
    if (booking.customerID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only cancel your own booking request" });
    }

    // Define allowed status transitions
    const cancellableStatuses = ["Pending", "Confirmed"];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel booking with status '${booking.status}'` });
    }

    // Update the status to "Cancelled"
    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking request canceled successfully", booking });

  } catch (error) {
    console.error("Error canceling booking request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateBookingRequest = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID booking từ URL
    const updateData = req.body; // Dữ liệu cập nhật từ request body

    console.log("Updating BookingRequest ID:", id, "with data:", updateData);

    // Kiểm tra ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    // Cập nhật booking
    const updatedBooking = await BookingRequest.findByIdAndUpdate(id, updateData, { new: true });

    // Kiểm tra nếu booking không tồn tại
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking Request not found" });
    }

    res.status(200).json({
      message: "Booking Request updated successfully",
      booking: updatedBooking,
    });

  } catch (error) {
    console.error("Error updating booking request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
      const { id } = req.params;
      const booking = await BookingRequest.findById(id);

      if (!booking) {
          return res.status(404).json({ message: "Booking request not found" });
      }

      if (booking.status !== "Pending") {
          return res.status(400).json({ message: "Only pending bookings can be confirmed" });
      }

      booking.status = "Confirmed";
      await booking.save();
      res.status(200).json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
      res.status(500).json({ message: "Error confirming booking", error: error.message });
  }
};

// Function to update status to Completed (only if currently Confirmed)
exports.completeBooking = async (req, res) => {
  try {
      const { id } = req.params;
      const booking = await BookingRequest.findById(id);

      if (!booking) {
          return res.status(404).json({ message: "Booking request not found" });
      }

      if (booking.status !== "Confirmed") {
          return res.status(400).json({ message: "Only confirmed bookings can be marked as completed" });
      }

      booking.status = "Completed";
      await booking.save();
      res.status(200).json({ message: "Booking marked as completed", booking });
  } catch (error) {
      res.status(500).json({ message: "Error completing booking", error: error.message });
  }
};

// Function to update status to Cancelled (only if currently Pending)
exports.cancelBooking = async (req, res) => {
  try {
      const { id } = req.params;
      const booking = await BookingRequest.findById(id);

      if (!booking) {
          return res.status(404).json({ message: "Booking request not found" });
      }

      if (booking.status !== "Pending") {
          return res.status(400).json({ message: "Only pending bookings can be cancelled" });
      }

      booking.status = "Cancelled";
      await booking.save();
      res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
      res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};

// Function to get booking details
exports.getBookingById = async (req, res) => {
  try {
      const { id } = req.params;
      const booking = await BookingRequest.findById(id).populate("serviceID customerID consultantID");

      if (!booking) {
          return res.status(404).json({ message: "Booking request not found" });
      }

      res.status(200).json(booking);
  } catch (error) {
      res.status(500).json({ message: "Error retrieving booking details", error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
      const { id, newStatus } = req.params;

      // Find the booking request
      const booking = await BookingRequest.findById(id);
      if (!booking) {
          return res.status(404).json({ message: "Booking request not found." });
      }

      // Define valid status transitions
      const validTransitions = {
          Pending: ["Confirmed", "Cancelled"],
          Confirmed: ["Completed"],
      };

      // Check if the requested status update is valid
      if (!validTransitions[booking.status] || !validTransitions[booking.status].includes(newStatus)) {
          return res.status(400).json({ message: `Invalid status transition from ${booking.status} to ${newStatus}.` });
      }

      // Update status
      booking.status = newStatus;
      await booking.save();

      res.status(200).json({ message: `Booking status updated to ${newStatus}`, booking });
  } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
      const { bookingId, action } = req.body; // action = 'cancel', 'checkin', 'checkout'
      let newStatus;

      switch (action) {
          case 'cancel':
              newStatus = 'cancelled';
              break;
          case 'checkin':
              newStatus = 'confirmed';
              break;
          case 'checkout':
              newStatus = 'completed';
              break;
          default:
              return res.status(400).json({ message: 'Invalid action' });
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { status: newStatus },
          { new: true }
      );

      if (!updatedBooking) {
          return res.status(404).json({ message: 'Booking not found' });
      }

      res.json(updatedBooking);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};