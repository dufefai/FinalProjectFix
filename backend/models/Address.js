const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'ownerModel',
  },
  ownerModel: {
    type: String,
    required: true,
    enum: ['User', 'Store'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  address: {
    type: String,
    required: true,
  }
});

addressSchema.index({ location: "2dsphere" });

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
