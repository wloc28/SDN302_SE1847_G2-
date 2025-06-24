const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authMiddleware, authController.getCurrentUser);
router.post("/logout", authMiddleware, authController.logout);

// Create store: chỉ khi đã đăng nhập
router.post("/create-store", authMiddleware, authController.createStore);

// Get store info: chỉ seller mới xem được
router.get("/store", authMiddleware, authorizeRoles("seller"), authController.getStore);

module.exports = router;
