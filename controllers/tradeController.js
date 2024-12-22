const Trade = require("../models/tradeModel");

const createTrade = async (req, res) => {
  try {
    const { asset, isOpen, price, quantity, status, tradedate, tradeType } = req.body;

    const userId = req.user._id;

    const newTrade = new Trade({
      asset,
      isOpen,
      price,
      quantity,
      status,
      tradedate,
      tradeType,
      userId,
    });

    const savedTrade = await newTrade.save();
    res.status(201).json({ message: "Trade created successfully", trade: savedTrade });
  } catch (error) {
    res.status(500).json({ message: "Error creating trade", error });
  }
};

const getTrades = async (req, res) => {
  try {
    const userId = req.user._id; 
    const filters = { userId, ...req.query }; 

    const trades = await Trade.find(filters);
    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trades", error });
  }
};

const updateTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const trade = await Trade.findOne({ _id: id, userId });
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    const updatedTrade = await Trade.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Trade updated successfully", trade: updatedTrade });
  } catch (error) {
    res.status(500).json({ message: "Error updating trade", error });
  }
};

const deleteTrade = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user._id;

    const trade = await Trade.findOne({ _id: id, userId });
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    await Trade.findByIdAndDelete(id);
    res.status(200).json({ message: "Trade deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting trade", error });
  }
};

module.exports = { createTrade, getTrades, updateTrade, deleteTrade };
