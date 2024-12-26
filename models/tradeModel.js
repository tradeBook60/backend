const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    asset: { type: String, required: true },
    tradeType: { type: String, enum: ["buy", "sell"], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    gross: { type: Number }, // Calculated as quantity * price
    commission: { type: Number, default: 0 }, 
    fees: { type: Number, default: 0 }, 
    netValue: { type: Number }, // Gross - commission - fees
    tradeDate: { type: Date, required: true },
    tags: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trade", tradeSchema);
