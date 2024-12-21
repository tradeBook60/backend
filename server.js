require("dotenv").config();
const express = require("express");
const db = require("./db");
const port = process.env.PORT || 8000


const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server working !!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

