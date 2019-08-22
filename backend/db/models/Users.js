var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userScheme = new Schema({
  name: String,
  age: Number,
})
const User = mongoose.model("User", userScheme);

module.exports = User