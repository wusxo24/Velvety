const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Canceled'], default: 'Pending' },
    amount: { type: Number, required: true, min: 0 }, // Amount for the order
    orderCode: { type: String, unique: true, required: true }, // Unique order code
    description: { type: String, required: true }, // Description of the order
    buyerName: { type: String, required: true }, // Name of the buyer
    buyerEmail: { type: String, required: true }, // Email of the buyer
    buyerPhone: { type: String, required: true }, // Phone of the buyer
    transactionDateTime: { type: Date, default: Date.now }, // Date and time of the transaction
    currency: { type: String, default: 'VND' }, // Currency used for the payment (default to VND)
    paymentMethod: { type: String, default: 'PayOS' }, // Payment method used
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
