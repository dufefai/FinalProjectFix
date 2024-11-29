const mongoose = require("mongoose");
const hashTag = require("../middlewares/hashTag");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalAuthor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    image: [{ type: String }],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reposts: {
      type: Number,
      default: 0,
    },
    mention: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    hashTags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    isRepost: {
      type: Boolean,
      default: false,
    },
    rePost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: function () {
        return this.isRepost;
      },
    },
    comments: {
      type: Number,
      default: 0,
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    Reply: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: function () {
        return this.isReply;
      },
    },
  },
  { timestamps: true }
);

hashTag.extractNewHashtags(postSchema);
hashTag.extractEditHashtags(postSchema);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
