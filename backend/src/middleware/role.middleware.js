exports.isSeller = (req, res, next) => {
  return req.user?.role === 'seller'
    ? next()
    : res.status(403).json({
        success: false,
        message: "Access denied. Seller role required.",
      });
};

exports.isAdmin = (req, res, next) => {
  return req.user?.role === 'admin'
    ? next()
    : res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
};
