const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true }, // số tiền hoặc %
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  expiry: { type: Date }
});

module.exports = mongoose.model('Voucher', VoucherSchema);