const BookingRequest = require('../models/BookingRequest');

exports.createBookingRequest = async (req, res) => {
  try {
    const bookingRequest = await BookingRequest.create(req.body);
    res.status(201).json(bookingRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBookingRequests = async (req, res) => {
  try {
    const bookingRequests = await BookingRequest.find()
    res.status(200).json(bookingRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignConsultant = async (req, res) => {
  try {
    const { consultantId } = req.body;
    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { consultantId },
      { new: true }
    );

    if (!bookingRequest) return res.status(404).json({ message: 'Booking Request not found' });

    await logUserActivity("Assigned Consultant")(req, res, () => {});
    res.status(200).json(bookingRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignService = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { serviceId },
      { new: true }
    );
    if (!bookingRequest) return res.status(404).json({ message: 'Booking Request not found' });
    await logUserActivity("Assigned Service")(req, res, () => {});
    res.status(200).json(bookingRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBookingRequestStatus = async (req, res) => {
  try {
    const bookingRequest = await BookingRequest.findById(req.params.id);
  
    if (!bookingRequest) {
      return res.status(404).json({ message: 'Booking Request not found' });
    }
    const validTransitions = {
      "not yet": "progressing",
      "progressing": "finishing",
    };
    const currentStatus = bookingRequest.status;
    const newStatus = req.body.status;
    if (validTransitions[currentStatus] !== newStatus) {
      return res.status(400).json({ message: `Invalid status transition from '${currentStatus}' to '${newStatus}'` });
    }
    bookingRequest.status = newStatus;
    await bookingRequest.save();
    await logUserActivity("Booking Request Status Updated")(req, res, () => {});
    res.status(200).json(bookingRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
