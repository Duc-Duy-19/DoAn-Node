let mongoose = require('mongoose');

let cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
}, { _id: false });

let cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Tính tổng tiền trước khi lưu
cartSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.totalAmount = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    } else {
        this.totalAmount = 0;
    }
    next();
});

module.exports = mongoose.model('cart', cartSchema);

