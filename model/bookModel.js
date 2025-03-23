const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    bookname: {
        type: String,
    },
    author: {
        type: String,
    },
    date: {
        type: String,
    },
    price: {
        type: String,
    },
    quantity: {
        type: String,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
    },
});

module.exports = mongoose.model("book", UserSchema);
