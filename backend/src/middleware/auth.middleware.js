const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * - Kiểm tra token trong header Authorization
 * - Gắn thông tin user đã decode vào req.user
 */
exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Authorization denied.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Nếu muốn truy vấn user từ DB, bật đoạn này lên:
    /*
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
    req.user = user;
    */

    req.user = decoded; // Giữ nguyên payload: { id, role }
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Role-based authorization middleware
 * Dùng để kiểm tra user có quyền truy cập không
 * @param  {...string} roles - Các role được phép
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${req.user?.role || 'unknown'}`,
      });
    }
    next();
  };
};
