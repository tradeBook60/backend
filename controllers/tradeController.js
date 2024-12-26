const Trade = require("../models/tradeModel");
const mongoose = require("mongoose");

const addTrade = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      asset,
      tradeType,
      quantity,
      price,
      commission = 0,
      fees = 0,
      tags = [],
    } = req.body;

    const gross = quantity * price;
    const netValue = gross - commission - fees;

    const newTrade = new Trade({
      asset,
      tradeType,
      quantity,
      price,
      gross,
      commission,
      fees,
      netValue,
      tradeDate: new Date(),
      tags,
      userId,
    });

    const savedTrade = await newTrade.save();
    res
      .status(201)
      .json({ message: "Trade executed successfully", trade: savedTrade });
  } catch (error) {
    res.status(500).json({ message: "Error executing trade", error });
  }
};

const getAllTrades = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tags } = req.query;

    let query = { userId };

    if (tags) {
      const tagsArray = tags.split(",");
      query.tags = { $in: tagsArray };
    }

    const trades = await Trade.find(query).sort({ tradeDate: -1 });

    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trades", error });
  }
};

const updateTrade = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    if (updates.userId) {
      return res.status(400).json({ message: "Cannot update userId" });
    }

    const trade = await Trade.findOneAndUpdate(
      { _id: id, userId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!trade) {
      return res
        .status(404)
        .json({ message: "Trade not found or unauthorized" });
    }

    res.status(200).json({ message: "Trade updated successfully", trade });
  } catch (error) {
    res.status(500).json({ message: "Error updating trade", error });
  }
};

const deleteTrade = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const trade = await Trade.findOneAndDelete({ _id: id, userId });

    if (!trade) {
      return res
        .status(404)
        .json({ message: "Trade not found or unauthorized" });
    }

    res.status(200).json({ message: "Trade deleted successfully", trade });
  } catch (error) {
    res.status(500).json({ message: "Error deleting trade", error });
  }
};

const calculatePnL = async (req, res) => {
  try {
    const userId = req.user._id;
    const trades = await Trade.find({ userId });

    const assetPnL = trades.reduce((acc, trade) => {
      const asset = acc[trade.asset] || {
        buy: 0,
        sell: 0,
        quantity: 0,
        profit: 0,
      };
      if (trade.tradeType === "buy") {
        asset.buy += trade.netValue;
        asset.quantity += trade.quantity;
      } else if (trade.tradeType === "sell") {
        asset.sell += trade.netValue;
        asset.quantity -= trade.quantity;
      }
      asset.profit = asset.sell - asset.buy;
      acc[trade.asset] = asset;
      return acc;
    }, {});

    res.status(200).json(assetPnL);
  } catch (error) {
    res.status(500).json({ message: "Error calculating PnL", error });
  }
};

const calculatePnLByPeriod = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period } = req.params; // "month" or "year"

    const startDate = new Date();
    if (period === "month") {
      startDate.setDate(1);
    } else if (period === "year") {
      startDate.setMonth(0, 1);
    }

    const trades = await Trade.find({ userId, tradeDate: { $gte: startDate } });

    const profit = trades.reduce((acc, trade) => {
      acc += trade.tradeType === "sell" ? trade.netValue : -trade.netValue;
      return acc;
    }, 0);

    res.status(200).json({ period, profit });
  } catch (error) {
    res.status(500).json({ message: "Error calculating PnL by period", error });
  }
};

module.exports = {
  addTrade,
  getAllTrades,
  updateTrade,
  deleteTrade,
  calculatePnL,
  calculatePnLByPeriod,
};
