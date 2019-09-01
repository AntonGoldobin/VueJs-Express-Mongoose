var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const thatBoobsScheme = new Schema({
  id: String,
})
const ThatBoobs = mongoose.model("ThatBoobs", thatBoobsScheme);

module.exports = ThatBoobs