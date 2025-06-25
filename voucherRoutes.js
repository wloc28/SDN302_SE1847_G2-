const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Sử dụng controller đã viết
router.post('/', voucherController.createVoucher);
router.get('/', voucherController.getAllVouchers);
router.get('/:productId', voucherController.getVouchersByProduct); // optional

module.exports = router;
