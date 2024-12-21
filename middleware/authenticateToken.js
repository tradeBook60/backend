const jwt = require("jsonwebtoken");
const { SECRET } = require("../config");

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const verified = jwt.verify(token.split(" ")[1], SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = { authenticateToken };
