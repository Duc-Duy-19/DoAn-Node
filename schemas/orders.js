let mongoose = require('mongoose');

let orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    orderNumber: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'address', required: true },
    paymentMethod: { 
        type: String, 
        enum: ['COD', 'bank_transfer', 'credit_card', 'e_wallet'],
        default: 'COD'
    },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);

