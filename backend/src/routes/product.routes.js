const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const multer = require("multer");
const path = require("path");
const { authMiddleware } = require("../middleware/auth.middleware");
const axios = require("axios");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Middleware kiểm tra reCAPTCHA
const RECAPTCHA_SECRET = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // Google test secret
async function verifyRecaptcha(req, res, next) {
  const token = req.body.recaptchaToken || req.body['recaptchaToken'];
  if (!token) {
    return res.status(400).json({ success: false, message: "Thiếu reCAPTCHA token" });
  }
  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`;
    const response = await axios.post(verifyUrl, {}, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    if (response.data.success) {
      next();
    } else {
      return res.status(400).json({ success: false, message: "Xác thực reCAPTCHA thất bại" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Lỗi xác thực reCAPTCHA", error: err.message });
  }
}

router.post("/", authMiddleware, upload.single("image"), verifyRecaptcha, ProductController.createProduct);

router.get("/all", ProductController.getAllProducts);

router.get("/seller/:sellerId", ProductController.getProductBySellerId);

router.put("/:id", authMiddleware, upload.single("image"), ProductController.updateProduct);

router.patch('/:id/show', authMiddleware, async (req, res) => {
  const Product = require('../models/Product');
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { hidden: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating product', error: err.message });
  }
});

router.patch('/:id/hide', authMiddleware, async (req, res) => {
  const Product = require('../models/Product');
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { hidden: true }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating product', error: err.message });
  }
});

module.exports = router;