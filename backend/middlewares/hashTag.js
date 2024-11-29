module.exports.extractNewHashtags = function (schema) {
  schema.pre("save", function (next) {
    const post = this;
    const hashTags = post.content.match(/#\p{L}+/gu);
    if (hashTags) {
      post.hashTags = hashTags.map((tag) => tag.toLowerCase().substring(1));
    } else {
      post.hashTags = [];
    }
    next();
  });
};

module.exports.extractEditHashtags = function (schema) {
  schema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.content) {
      const hashTags = update.content.match(/#\p{L}+/gu);
      if (hashTags) {
        this.set({
          hashTags: hashTags.map((tag) => tag.toLowerCase().substring(1)),
        });
      } else {
        this.set({ hashTags: [] });
      }
    }
    next();
  });
};
