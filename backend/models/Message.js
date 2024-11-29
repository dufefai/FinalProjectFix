const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        refPath: 'refModelReceiver',
        required: true
    },
    refModelReceiver: {
        type: String,
        required: true,
        enum: ['User', 'Store']
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
