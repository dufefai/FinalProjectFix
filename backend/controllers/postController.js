const Post = require("../models/Post");
const Notification = require("../models/Notification");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();

const postController = {
  post: async (req, res) => {
    try {
      const newPost = new Post({
        content: req.body.content,
        author: req.user.id,
        image: req.body.image,
        mention: req.body.mention
      });
      const savedPost = await newPost.save();

      const populatedPost = await Post.findById(savedPost._id).populate(
        "author",
        "username fullName avatar"
      ).populate("mention", "name image rate");

      res.status(200).json(populatedPost);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  editPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json("Post not found");
      if (post.isRepost) return res.status(403).json("You can't edit a repost");
      if (req.body.content === "")
        return res.status(400).json("Content can't be empty");

      if (post.author == req.user.id) {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            content: req.body.content,
            image: req.body.image,
            updatedAt: Date.now(),
          },
          { new: true }
        ).populate("author", "fullName username avatar").populate("mention", "name image rate");

        res.status(200).json(updatedPost);
      } else {
        return res.status(403).json("You can only edit your post");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
  rePost: async (req, res) => {
    try {
      const userId = req.user.id;
      const currentPost = await Post.findById(req.params.id);
      if (!currentPost) {
        return res.status(404).json("Post not found");
      }

      const originalPost = currentPost.isRepost
        ? currentPost.rePost
        : currentPost._id;
      const originalAuthor = currentPost.isRepost
        ? currentPost.originalAuthor
        : currentPost.author;

      const existingRepost = await Post.findOne({
        author: req.user.id,
        rePost: originalPost,
      });

      let originalPostObj;

      if (existingRepost) {
        await Post.findByIdAndDelete(existingRepost._id);
        originalPostObj = await Post.findById(originalPost).populate(
          "author",
          "fullName username avatar"
        );
        originalPostObj.reposts -= 1;
        await originalPostObj.save();

        originalPostObj = originalPostObj.toObject();
        originalPostObj.hasReposted = false;

        return res.status(200).json(originalPostObj);
      }

      const repost = new Post({
        content: currentPost.content,
        author: req.user.id,
        image: currentPost.image,
        isRepost: true,
        rePost: originalPost,
        originalAuthor: originalAuthor,
      });

      await repost.save();

      originalPostObj = await Post.findById(originalPost).populate(
        "author",
        "fullName username avatar"
      );
      originalPostObj.reposts += 1;
      await originalPostObj.save();

      originalPostObj = originalPostObj.toObject();
      originalPostObj.hasReposted = true;

      res.status(201).json(originalPostObj);

      const notification = await Notification.findOne({
        post: originalPostObj._id,
        type: "repost",
      });
      if(originalPostObj.author._id.toString() !== req.user.id){
      if (notification && !notification.peopleID.includes(req.user.id)) {
        const totalPeople = notification.peopleID.length ;
        const updatedMessage = `<b>${req.user.fullName}</b> and <b>${totalPeople}</b> others have reposted your post.`;
        notification.message = updatedMessage;
        notification.viewed = false;
        notification.read = false;
        notification.updatedAt = Date.now();
        notification.peopleID.push(req.user.id);
        await notification.save();
      } else if(!notification) {
        const newNotification = new Notification({
          message: `<b>${req.user.fullName}</b> has reposted your post.`,
          user: originalPostObj.author,
          peopleID: [req.user.id],
          post: originalPostObj._id,
          type: "repost",
        });
        await newNotification.save();
      }
    }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  viewPost: async (req, res) => {
    try {
      const userId = req.user.id; 
      const post = await Post.findById(req.params.id)
        .populate("author", "username fullName avatar")
        .populate("mention", "name image rate");
      if (!post) {
        return res.status(404).json("Post not found");
      }
      const hasRepostedPost = await Post.findOne({
        author: userId,
        rePost: post.isRepost ? post.rePost : post._id,
      });
      const postWithRepostStatus = {
        ...post.toObject(),
        hasReposted: !!hasRepostedPost,
      };
      let repliedPostWithRepostStatus = null;

      if(post.isReply){
      const repliedPost = await Post.findById(post.Reply)
            .populate("author", "username fullName avatar")
            .populate("mention", "name image rate");
            const hasRepostedRepliedPost = await Post.findOne({
              author: userId,
              rePost: repliedPost.isRepost ? repliedPost.rePost : repliedPost._id,
            });
        repliedPostWithRepostStatus = {
          ...repliedPost.toObject(),
          hasReposted: !!hasRepostedRepliedPost,
        };
      }
      const replies = await Post.find({ Reply: req.params.id, isReply: true })
        .populate("author", "username fullName avatar")
        .populate("mention", "name image rate")
        .select("content image author comments likes reposts createdAt")
        .sort({ createdAt: -1 });
      const repliesWithRepostStatus = await Promise.all(
        replies.map(async (reply) => {
          const hasRepostedReply = await Post.findOne({
            author: userId,
            rePost: reply._id,
          });
          return {
            ...reply.toObject(),
            hasReposted: !!hasRepostedReply,
          };
        })
      );
      res.status(200).json({
        post: postWithRepostStatus,
        replies: repliesWithRepostStatus,
        repliedPost: repliedPostWithRepostStatus,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  
  deletePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json("Post not found");
      }
      if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
        return res
          .status(403)
          .json("You do not have permission to delete this post");
      }
      await Post.deleteMany({ rePost: post._id });
      await Post.deleteMany({ Reply: post._id });
      await Post.findByIdAndDelete(post._id);

      if (post.isReply) {
        const orginalPost = await Post.findById(post.Reply);
        orginalPost.comments -= 1;
        await orginalPost.save();
      }
      await Notification.deleteMany({ post: post._id });

      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
  likePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json("Post not found");
      }

      const alreadyLiked = post.likes.some((like) => like.equals(req.user.id));

      if (alreadyLiked) {
        post.likes = post.likes.filter((like) => !like.equals(req.user.id));
        await post.save();
        return res.status(200).json({
          userId: req.user.id,
          postId: post._id
        });
      } else {
        post.likes.push(req.user.id);
        await post.save();

        const notification = await Notification.findOne({
          post: post._id,
          type: "like",
        });
        if(post.author.toString() !== req.user.id){
        if (notification && !notification.peopleID.includes(req.user.id)) {
          const totalPeople = notification.peopleID.length;
          const updatedMessage = `<b>${req.user.fullName}</b> and <b>${totalPeople}</b> others have liked your post.`;
          notification.viewed = false;
          notification.read = false;
          notification.message = updatedMessage;
          notification.updatedAt = Date.now();
          notification.peopleID.unshift(req.user.id);
          await notification.save();
        } else if(!notification) {
          const newNotification = new Notification({
            message: `<b>${req.user.fullName}</b> has liked your post.`,
            user: post.author,
            peopleID: [req.user.id],
            post: post._id,
            type: "like",
          });
          await newNotification.save();
        }
      }
        return res.status(201).json({
          userId: req.user.id,
          postId: post._id
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
  commentPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json("Post not found");
      }

      const newComment = new Post({
        content: req.body.content,
        author: req.user.id,
        image: req.body.image,
        isReply: true,
        Reply: post._id,
      });
      const savedComment = await newComment.save();
      post.comments += 1;
      await post.save();
      const populatedComment = await Post.findById(savedComment._id).populate(
        "author",
        "username fullName avatar"
      );
      const notification = await Notification.findOne({
        post: post._id,
        type: "comment",
      });
      if(post.author.toString() !== req.user.id){
      if (notification && !notification.peopleID.includes(req.user.id)) {
        const totalPeople = notification.peopleID.length ;
        const updatedMessage = `<b>${req.user.fullName}</b> and <b>${totalPeople}</b> others have commented on your post.`;
        notification.updatedAt = Date.now();
        notification.message = updatedMessage;
        notification.viewed = false;
        notification.read = false;
        notification.peopleID.unshift(req.user.id);
        await notification.save();
      } else if(!notification) {
        const newNotification = new Notification({
          message: `<b>${req.user.fullName}</b> has commented on your post.`,
          user: post.author,
          peopleID: [req.user.id],
          post: post._id,
          type: "comment",
        });
        await newNotification.save();
      }
      }
      res.status(201).json(populatedComment);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getNews: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select("following");
      const followingIds = user.following;

      const trendingPosts = await Post.find({ isRepost: false, isReply: false })
        .sort({ likes: -1, reposts: -1, createdAt: -1 })
        .limit(8)
        .populate("author", "fullName username avatar")
        .populate("mention", "name image rate")
        .lean()
        .exec();

      let followingPosts = [];
      if (followingIds.length > 0) {
        followingPosts = await Post.find({
          author: { $in: followingIds },
          isReply: false,
          isRepost: false,
        })
          .sort({ createdAt: -1 })
          .limit(2)
          .populate("author", "fullName username avatar")
          .populate("mention", "name image rate")
          .lean()
          .exec();
      }


      const allPosts = [...trendingPosts, ...followingPosts];

      const uniquePosts = allPosts.filter(
        (post, index, self) =>
          index ===
          self.findIndex((p) => p._id.toString() === post._id.toString())
      );

      const postsWithRepostStatus = await Promise.all(
        uniquePosts.map(async (post) => {
          const hasReposted = await Post.findOne({
            author: userId,
            rePost: post.isRepost ? post.rePost : post._id,
          });
          return { ...post, hasReposted: !!hasReposted };
        })
      );

      const shuffledPosts = postsWithRepostStatus
        .sort(() => 0.5 - Math.random())

      res.status(200).json(shuffledPosts);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },

  getUserPosts: async (req, res) => {
    try {
      const { username } = req.params;
  
      // Find the user by their username
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Fetch the user's posts, excluding replies
      let posts = await Post.find({ author: user._id, isReply: false })
        .populate("author", "username fullName avatar")
        .populate("mention", "name image rate")
        .populate({
          path: "originalAuthor",
          select: "username fullName avatar",
        })
        .sort({ createdAt: -1 });
  
      // Check if the logged-in user (from req.user.id) has reposted each post
      const loggedInUserId = req.user.id;
  
      // Iterate over posts to handle reposted posts
      const postsWithRepostStatus = await Promise.all(
        posts.map(async (post) => {
          if (post.isRepost && post.rePost) {
            // If it's a repost, get the original post
            const originalPost = await Post.findById(post.rePost)
              .populate("author", "username fullName avatar")
              .populate("mention", "name image rate")
              .lean(); // Convert to plain object for modification
      
            // Check if the logged-in user has reposted this original post
            const hasReposted = await Post.exists({
              author: loggedInUserId,
              rePost: originalPost._id, // Check against the original post ID
            });
      
            return {
              ...originalPost,
              isRepost: true, // Mark the post as a repost
              hasReposted: !!hasReposted, // true if reposted, false otherwise
            };
          } else {
            // If it's not a repost, just return the post as it is
            const hasReposted = await Post.exists({
              author: loggedInUserId,
              rePost: post._id, // Check if user has reposted this post
            });
      
            return {
              ...post.toObject(),
              isRepost: false, // Mark the post as not a repost
              hasReposted: !!hasReposted, // Default false if not a repost
            };
          }
        })
      );
      // Respond with the posts with the repost status
      res.status(200).json(postsWithRepostStatus);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while retrieving posts", error });
    }
  },
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ user: req.user.id }).sort({ updatedAt: -1 });
      const updatedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          const firstPerson = await User.findById(notification.peopleID[0]).lean();
          return { ...notification._doc, avatarComment: firstPerson?.avatar, fullNameComment: firstPerson?.fullName, usernameComment: firstPerson?.username };
        })
      );
      res.status(200).json(updatedNotifications);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  viewNotification: async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(req.params.id, { viewed: true }, { new: true });
      if (!notification) {
        return res.status(404).json("Notification not found");
      }
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  readNotification: async (req, res) => {
    try {
      const notifications = await Notification.updateMany(
        { user: req.user.id },
        { read: true },
        { new: true }
      );
      if (!notifications) {
        return res.status(404).json("Notifications not found");
      }
      res.status(200).json("All notifications marked as read.");
    } catch (error) {
      res.status(500).json(error);
    }
  },
  

  searchPost: async (req, res) => {
    try {
      let posts = await Post.find({
         isRepost: false, content: { $regex: req.query.text, $options: "i" },
      }).populate("author", "username fullName avatar").populate("mention", "name image rate").lean();
            const loggedInUserId = req.user.id;
            const postsWithRepostStatus = await Promise.all(
              posts.map(async (post) => {
                  const hasReposted = await Post.exists({
                    author: loggedInUserId,
                    rePost: post._id, 
                  });
                  return {
                    ...post,
                    isRepost: false, 
                    hasReposted: !!hasReposted,
                  };   
              })
            );
      return res.status(200).json(postsWithRepostStatus);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  getMorePost : async (req, res) => {
    
  }
  
  
  
};

module.exports = postController;
