const mongoose = require("mongoose");

var mongoURL = process.env.DB_STRING;

mongoose.connect(mongoURL);

var db = mongoose.connection;

db.on("connected", () => {
  console.log(`Mongodb connection successful`);
});

db.on("error", () => {
  console.log(`Mongodb connection failed`);
});

module.exports = mongoose;