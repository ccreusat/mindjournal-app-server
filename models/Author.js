const { model, Schema } = require("mongoose");

const authorSchema = new Schema({
  name: String,
});

module.exports = model("Author", authorSchema);
