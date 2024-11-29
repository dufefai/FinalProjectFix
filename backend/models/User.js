const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: {
      type: String,
      match: [/^\S+$/, "Username should not contain spaces"],
      minLength: 4,
      maxLength: 30,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      required: true,
      minLength: 4,
      unique: true,
    },
    password: {
      type: String,
      match: [/^\S+$/, "Password should not contain spaces"],
      minLength: 4,
    },
    role: {
      type: String,
      default: "user",
    },
    token: {
      type: String,
      default: null,
    },
    fullName: {
      type: String,
      default: function () {
        return "user" + Math.floor(100000 + Math.random() * 900000);
      },
    },
    birthDay: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    background: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
        default: null,
      },
    ],
    phoneNumber: {
      type: Number,
      default: null,
    },
    following: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    follower: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
