const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    message: {
        type: String,
        required : true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    peopleID:[{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    post:{
        type: Schema.Types.ObjectId,
        ref: "Post",
    },
    order:{
        type: Schema.Types.ObjectId,
        ref: "Order",
    },
    viewed:{
        type: Boolean,
        default: false
    },
    read:{
        type: Boolean,
        default: false
    },
    type:{
        type: String,
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports =  Notification