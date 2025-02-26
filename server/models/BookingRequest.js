  const mongoose = require('mongoose');
  const { Schema } = mongoose;
  const bookingRequestSchema = new Schema({
      serviceID: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
      date: { type: Date, required: true },
      time: { type: String, required: true },
      therapistID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Therapist reference
      status: { type: String, enum: ["Pending", "Confirmed", "Completed", "Cancelled"], required: true },
      isTherapistAssignedByCustomer: { type: Boolean, default: false },
    });
    
    module.exports = mongoose.model("BookingRequest", bookingRequestSchema);
    