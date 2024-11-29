import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    message: {
      conversations: [],
      isFetching: false,
      error: false,
    },
  },
  reducers: {
    getConversationStart: (state) => {
      state.message.isFetching = true;
      state.message.error = false;
    },
    getConversationSuccess: (state, action) => {
      state.message.conversations = action.payload;
      state.message.isFetching = false;
      state.message.error = false;
    },
    getConversationFailed: (state) => {
      state.message.isFetching = false;
      state.message.error = true;
    },
    addTemporaryConversation: (state, action) => {
        const { conversationId, senderName, senderAvatar, senderUsername, partnerUsername, partnerName, partnerAvatar, partnerId, currentUserId, isRead, message } = action.payload;
        state.message.conversations.unshift({
          _id: conversationId || null,
          sender: {
            _id: currentUserId,
            fullName: senderName || null,
            avatar: senderAvatar || null,
            username: senderUsername || null,

          },
          receiver: {
            _id: partnerId,
            fullName: partnerName,
            avatar: partnerAvatar,
            username: partnerUsername,
          },
          lastMessage: message || "",
          isRead: isRead,
          lastReceiver: partnerId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      },      
    getMessageSuccess: (state, action) => {
      const { conversationId, message, isRead, lastReceiver } = action.payload;

      const conversation = state.message.conversations.find(
        (conv) =>
          conv._id === conversationId ||
          (!conv._id && conv.receiver._id === lastReceiver)
      );

      if (conversation) {
        conversation._id = conversationId;
        conversation.lastMessage = message;
        conversation.isRead = isRead;
        conversation.lastReceiver = lastReceiver;
        conversation.updatedAt = new Date().toISOString();
      }
    },
    readMessageSuccess: (state, action) => {
      const { conversationId } = action.payload;
      const conversation = state.message.conversations.find(
        (conv) => conv._id === conversationId
      );

      if (conversation) {
        conversation.isRead = true;
      }
    },
  },
});

export const {
  getConversationStart,
  getConversationSuccess,
  getConversationFailed,
  getMessageSuccess,
  readMessageSuccess,
  addTemporaryConversation
} = messageSlice.actions;

export default messageSlice.reducer;
