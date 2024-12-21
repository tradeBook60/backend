const router = require("express").Router();
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/trades", authenticateToken, (req, res) => {
    return "Trades are here"
});
  

module.exports = router;
