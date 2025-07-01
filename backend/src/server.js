const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const routes = require('./routes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require("./routes/inventoryRoutes");
const messageRoutes = require("./routes/message.routes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const disputeRoutes = require("./routes/dispute.routes");
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', routes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/disputes", disputeRoutes);

const createProductLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 5, // tối đa 5 lần tạo sản phẩm mỗi 10 phút
  message: {
    success: false,
    message: 'Bạn đã tạo quá nhiều sản phẩm. Vui lòng thử lại sau 10 phút.'
  }
});

app.use('/api/products', (req, res, next) => {
  if (req.method === 'POST') {
    return createProductLimiter(req, res, next);
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;