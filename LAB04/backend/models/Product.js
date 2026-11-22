const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);