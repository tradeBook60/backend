const express = require("express");
const { createTrade, getTrades, updateTrade, deleteTrade } = require("../controllers/tradeController");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.post("/", authenticateToken, createTrade);

router.get("/", authenticateToken, getTrades);

router.patch("/:id", authenticateToken, updateTrade);

router.delete("/:id", authenticateToken, deleteTrade);

module.exports = router;
