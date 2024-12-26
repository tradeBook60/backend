const express = require("express");
const {
  addTrade,
  getAllTrades,
  calculatePnL,
  calculatePnLByPeriod,
  deleteTrade,
  updateTrade,
} = require("../controllers/tradeController");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.post("/", authenticateToken, addTrade);

router.get("/", authenticateToken, getAllTrades);

router.delete("/:id", authenticateToken, deleteTrade);

router.patch("/:id", authenticateToken, updateTrade);

router.get("/pnl", authenticateToken, calculatePnL);

router.get("/pnl/:period", authenticateToken, calculatePnLByPeriod);

module.exports = router;
