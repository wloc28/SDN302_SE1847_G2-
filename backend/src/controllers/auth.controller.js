const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Address, Store } = require("../models");
const logger = require("../utils/logger");

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      avatarURL,
      phone,
      fullName,
      street,
      city,
      state,
      country,
    } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }

    const user = await User.create({
      username,
      fullName,
      email,
      password,
      role: role || "buyer",
      avatarURL: avatarURL || "",
    });

    if (phone && street && city && state && country) {
      await Address.create({
        userId: user._id,
        fullName,
        phone,
        street,
        city,
        state,
        country,
        isDefault: true,
      });
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    if (user.action === "lock") {
      return res.status(403).json({
        success: false,
        message: "Account is locked. Please contact support.",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 * @access Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    logger.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting user data",
      error: error.message,
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * Create a store for a seller
 * @route POST /api/auth/create-store
 * @access Private
 */
exports.createStore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeName, description, bannerImageURL } = req.body;

    if (!storeName) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingStore = await Store.findOne({ sellerId: userId });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "You already have a store",
      });
    }

    user.role = "seller";
    await user.save();

    const store = await Store.create({
      sellerId: userId,
      storeName,
      description: description || "",
      bannerImageURL: bannerImageURL || "",
      status: "pending",
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Store created successfully and pending approval",
      token,
      store,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    logger.error("Create store error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating store",
      error: error.message,
    });
  }
};

/**
 * Get store details for a seller
 * @route GET /api/auth/store
 * @access Private (Seller only)
 */
exports.getStore = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = await Store.findOne({ sellerId: userId });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found for this seller",
        store: null,
      });
    }

    res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    logger.error("Get store error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting store information",
      error: error.message,
    });
  }
};
