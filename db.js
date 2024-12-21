const mongoose = require("mongoose");
const config = require("./config");

var mongoURL = config.DB;

mongoose.connect(mongoURL);

var db = mongoose.connection;

db.on("connected", () => {
  console.log(`Mongodb connection successful`);
});

db.on("error", () => {
  console.log(`Mongodb connection failed`);
});

module.exports = mongoose;