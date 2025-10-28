let mongoose = require('mongoose');

let reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index để đảm bảo mỗi user chỉ đánh giá 1 lần cho mỗi sản phẩm
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('review', reviewSchema);

