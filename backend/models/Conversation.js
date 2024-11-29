const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: Schema.Types.ObjectId,
        refPath: 'refModelReceiver',
        required: true,
    },
    refModelReceiver: {
        type: String,
        required: true,
        enum: ['User', 'Store'],
    },
    lastMessage: {
        type: String,
        required: true,
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: [],
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    lastReceiver: {
        type: Schema.Types.ObjectId,
        required: true,
    },
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
