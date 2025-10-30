let mongoose = require('mongoose');

let orderItemSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Tính tổng phụ trước khi lưu
// Tính tổng phụ trước khi validate (để đảm bảo field `subtotal` có giá trị trước khi chạy các validator `required`)
orderItemSchema.pre('validate', function(next) {
    // đảm bảo price và quantity đã có giá trị hợp lệ trước khi tính
    if (this.price !== undefined && this.quantity !== undefined) {
        this.subtotal = this.price * this.quantity;
    }
    next();
});

module.exports = mongoose.model('orderItem', orderItemSchema);

