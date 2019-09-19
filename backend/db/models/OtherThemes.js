var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otherThemesScheme = new Schema({
  id: String,
})
const OtherThemes = mongoose.model("OtherThemes", otherThemesScheme);

module.exports = OtherThemes