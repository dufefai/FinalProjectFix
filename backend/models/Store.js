const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rate: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
  reviews:[{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      rate: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },
      comment: {
        type: String,
      },
      order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
      rateImage:[{
        type: String,
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  openingTime: {
    type: String,
    required: true,
  },
  closingTime: {
    type: String,
    required: true,
  },
  classifications:[{
    type: String,
    lowercase: true,
  }]
  ,
  verified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
