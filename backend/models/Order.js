const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  items: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      store: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: true,
      },
      name:{
        type: String,
        required: true,
      },
      image:{
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  fullName:{
    type: String,
    required: true,
  },
  phoneNumber:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  sellerConfirmed: {
    type: Boolean,
    default: false,
  },
  reviewed: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    default: "paypal",
  },
  createdAt: {
    type: Date,
    default: new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format()),
  },
  updatedAt: {
    type: Date,
    default: new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format()),
  },
  cancelledAt: {
    type: Date,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
