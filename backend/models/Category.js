const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
