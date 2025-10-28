let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    imageURLs: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);

