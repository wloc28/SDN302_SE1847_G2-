const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
