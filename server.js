const express = require("express");
const app = express();
const port = 8000

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server working !!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

