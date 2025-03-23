const mongoose = require("mongoose");

const ConnectDB = mongoose
    .connect("mongodb://localhost:27017/book")
    .then(() => console.log("MongoDB Connected"))
    .catch(() => console.log("Server Error"));

module.exports = ConnectDB;

