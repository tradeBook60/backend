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
      const trades = await Trade.find({ userId: req.user._id });
  
      let assetData = {};
      trades.forEach(trade => {
        const { asset, tradeType, quantity, price, netValue, commission, fees, createdAt } = trade;
  
        if (!assetData[asset]) {
          assetData[asset] = {
            asset,
            totalBuyValue: 0,
            totalSellValue: 0,
            totalBuyQuantity: 0,
            totalSellQuantity: 0,
            averageBuyPrice: 0,
            profit: 0,
            remainingQuantity: 0,
            open: true, // Initially trade is open
            totalBuyCommission: 0,
            totalBuyFees: 0,
            totalSellCommission: 0,
            totalSellFees: 0,
            createdAt: createdAt
          };
        }
  
        if (tradeType === "buy") {
          assetData[asset].totalBuyValue += netValue;
          assetData[asset].totalBuyQuantity += quantity;
          assetData[asset].remainingQuantity += quantity;
          assetData[asset].totalBuyCommission += commission;
          assetData[asset].totalBuyFees += fees;
        }
  
        if (tradeType === "sell") {
          // Calculate profit only for the sold quantity based on the average buy price
          if (assetData[asset].remainingQuantity > 0) {
            const sellPrice = price;
            const averageBuyPrice = assetData[asset].totalBuyValue / assetData[asset].totalBuyQuantity;
            const soldQuantity = quantity;
  
            // Profit for sold quantity
            const sellValue = sellPrice * soldQuantity;
            const profit = (sellValue - (soldQuantity * averageBuyPrice)) - commission - fees;
            assetData[asset].profit += profit;
  
            // Update remaining quantity after sale
            assetData[asset].remainingQuantity -= soldQuantity;
            assetData[asset].totalSellValue += sellValue;
            assetData[asset].totalSellQuantity += soldQuantity;
            assetData[asset].totalSellCommission += commission;
            assetData[asset].totalSellFees += fees;
            assetData[asset].createdAt = createdAt;
          }
        }
  
        // Close trade if buy quantity matches sell quantity
        if (assetData[asset].remainingQuantity === 0) {
          assetData[asset].open = false;
        }
      });
  
      // Calculate average buy price and PnL for each asset
      for (let asset in assetData) {
        const assetInfo = assetData[asset];
        
        // If there are any buys, calculate the average buy price
        if (assetInfo.totalBuyQuantity > 0) {
          assetInfo.averageBuyPrice = assetInfo.totalBuyValue / assetInfo.totalBuyQuantity;
        }
  
        // If remaining quantity is 0, close the trade
        if (assetInfo.remainingQuantity === 0) {
          assetInfo.open = false;
        }
      }
  
      // Return PnL data for each asset
      res.status(200).json({
        status: "success",
        data: Object.values(assetData),
      });
  
    } catch (error) {
      console.error("Error calculating PnL:", error);
      res.status(500).json({
        status: "error",
        message: "Something went wrong while calculating PnL",
      });
    }
  };

// const calculatePnLByPeriod = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { period } = req.params; // "month" or "year"

//     const startDate = new Date();
//     if (period === "month") {
//       startDate.setDate(1);
//     } else if (period === "year") {
//       startDate.setMonth(0, 1);
//     }

//     const trades = await Trade.find({ userId, tradeDate: { $gte: startDate } });

//     const profit = trades.reduce((acc, trade) => {
//       acc += trade.tradeType === "sell" ? trade.netValue : -trade.netValue;
//       return acc;
//     }, 0);

//     res.status(200).json({ period, profit });
//   } catch (error) {
//     res.status(500).json({ message: "Error calculating PnL by period", error });
//   }
// };

const calculatePnLByPeriod = async (req, res) => {
    try {
      const userId = req.user._id;
      const { period } = req.params; // "month" or "year"
  
      const startDate = new Date();
      if (period === "month") {
        startDate.setDate(1); // Start of the current month
      } else if (period === "year") {
        startDate.setMonth(0, 1); // Start of the current year
      }
  
      const trades = await Trade.find({ 
        userId, 
        tradeDate: { $gte: startDate } 
      });
  
      let assetData = {};
  
      trades.forEach(trade => {
        const { asset, tradeType, quantity, price, netValue, commission, fees } = trade;
  
        if (!assetData[asset]) {
          assetData[asset] = {
            asset,
            totalBuyValue: 0,
            totalBuyQuantity: 0,
            totalSellValue: 0,
            totalSellQuantity: 0,
            averageBuyPrice: 0,
            profitBooked: 0,
            remainingQuantity: 0,
          };
        }
  
        if (tradeType === "buy") {
          assetData[asset].totalBuyValue += netValue;
          assetData[asset].totalBuyQuantity += quantity;
          assetData[asset].remainingQuantity += quantity;
        }
  
        if (tradeType === "sell" && assetData[asset].remainingQuantity > 0) {
          const averageBuyPrice = assetData[asset].totalBuyValue / assetData[asset].totalBuyQuantity;
          const sellPrice = price;
          const soldQuantity = quantity;
  
          const sellValue = sellPrice * soldQuantity;
          const profit = (sellValue - (soldQuantity * averageBuyPrice)) - commission - fees;
  
          assetData[asset].profitBooked += profit;
  
          assetData[asset].remainingQuantity -= soldQuantity;
          assetData[asset].totalSellValue += sellValue;
          assetData[asset].totalSellQuantity += soldQuantity;
        }
      });
  
      const totalProfit = Object.values(assetData).reduce((acc, asset) => acc + asset.profitBooked, 0);
  
      res.status(200).json({
        period,
        profitBooked: totalProfit,
      });
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
