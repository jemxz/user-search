const mongoose = require("mongoose");
const { Schema } = mongoose;

const users = new Schema({
  userName: String,
  userLink: String,
  aboutUser: Object,
  date: String,
});

const Users = mongoose.model("Users", users);

module.exports = Users;
