const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    asset: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isOpen: { type: Boolean, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ["active", "completed"], required: true },
    tradedate: { type: Date, required: true },
    tradeType: { type: String, enum: ["buy", "sell"], required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trade", tradeSchema);
