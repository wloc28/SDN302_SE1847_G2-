const { Feedback } = require("../models");

// Tạo feedback
exports.createFeedback = async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    console.error("Error creating feedback:", err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách feedback theo sellerId
exports.getListBySellerId = async (req, res) => {
  const { sellerId } = req.params;
  try {
    const feedbacks = await Feedback.find({ sellerId }).sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ error: err.message });
  }
};
