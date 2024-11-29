const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Store = require("../models/Store");

const messageController = {
  sendMessage: async (req, res) => {
    try {
      const messageContent = req.body.message;
      const store = req.body.store;
      const sender = store ? store : req.user.id;
      const receiver = req.params.id;

      let conversation = await Conversation.findOne({
        $or: [
          { $and: [{ sender: sender }, { receiver: receiver }] },
          { $and: [{ sender: receiver }, { receiver: sender }] },
        ],
      });

      if (!conversation) {
        const user = await User.findById(receiver);
        let refModelReceiver = "User";
        if (!user) {
          const storeReceiver = await Store.findById(receiver);
          if (!storeReceiver) {
            return res.status(404).json({ message: "Receiver not found" });
          }
          refModelReceiver = "Store";
        }
        conversation = new Conversation({
          sender,
          receiver,
          refModelReceiver,
          lastMessage: messageContent,
          lastReceiver: receiver,
          isRead: false,
        });
        await conversation.save();
      } else {
        conversation.lastReceiver = receiver;
        conversation.isRead = false;
        conversation.lastMessage = messageContent;
        conversation.updatedAt = Date.now();
        await conversation.save();
      }

      const newMessage = new Message({
        conversationId: conversation._id,
        sender,
        receiver,
        refModelReceiver: conversation.refModelReceiver,
        message: messageContent,
      });
      await newMessage.save();

      conversation.messages.push(newMessage._id);
      await conversation.save();

      return res.status(201).json(newMessage);
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },

  getConversations: async (req, res) => {
    try {
      const conversations = await Conversation.find({
        $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      })
        .populate("receiver")
        .populate("sender")
        .sort({ updatedAt: -1 });
      return res.status(200).json(conversations);
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },
  getMessages: async (req, res) => {
    try {
      const messages = await Conversation.findById(req.params.id).populate(
        "messages"
      );
      return res.status(200).json(messages);
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },
  readConversation: async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (
        conversation &&
        conversation.lastReceiver.toString() === req.user.id
      ) {
        await Conversation.findByIdAndUpdate(req.params.id, { isRead: true });
        return res.status(200).json("ok");
      }
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },
};

module.exports = messageController;
