const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Canceled'], default: 'Pending' },
    amount: { type: Number, required: true, min: 0 },
    orderCode: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    buyerAddress: { type: String, required: true },
    transactionDateTime: { type: Date, default: Date.now },
    currency: { type: String, default: 'VND' },
    paymentMethod: { type: String, default: '' },
    paymentStatus: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
