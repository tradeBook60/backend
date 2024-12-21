require("dotenv").config();
const express = require("express");
const db = require("./db");
const config = require("./config");
const port = config.PORT || 8000;

const app = express();

app.use(express.json());
app.use("/v1/", require("./routes/userRoutes"));
app.use("/v1/trades", require("./routes/tradeRoutes"));

app.get("/", (req, res) => {
  res.send("Server working !!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
