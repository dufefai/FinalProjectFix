import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axiosJWT from "../../config/axiosJWT";
import io from "socket.io-client";
import { CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";
import { getMessageSuccess, readMessageSuccess } from "../../redux/messageSlice";
import { useNavigate } from "react-router-dom";
import EmojiPicker from 'emoji-picker-react';
import { faSmile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const socket = io.connect("http://localhost:8000");

const MessageDetail = ({ conversation }) => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const readConversation = async (accessToken, conversationId) => {
    try {
      await axiosJWT.post(
        `${process.env.REACT_APP_BACKEND_API}/api/message/readConversation/${conversationId}`,
        {},
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      dispatch(readMessageSuccess({conversationId}))
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  };

  const handleInputFocus = () => {
    if (user?.accessToken && conversation) {
      readConversation(user.accessToken, conversation.id);
    }
  };

  const getMessages = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/message/getMessages/${conversation.id}`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setMessages(res.data.messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      socket.emit("join_room", user._id);
    }
  }, [user]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      dispatch(getMessageSuccess({
        conversationId: data.conversationId,
        message: data.message,
        isRead: false,
        lastReceiver: data.receiverId,
      }));
      if (
        data.senderId === conversation?.partnerId &&
        data.receiverId === user._id
      ) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });
    return () => {
      socket.off("receive_message");
    };
  }, [user, conversation]); // eslint-disable-line

  useEffect(() => {
    const fetchMessages = async () => {
      if (user?.accessToken && conversation?.id) {
        setLoading(true);
        await getMessages(user.accessToken);
        setLoading(false);
      } else {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [user, conversation?.id]); // eslint-disable-line

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await axiosJWT.post(
        `${process.env.REACT_APP_BACKEND_API}/api/message/sendMessage/${conversation?.partnerId}`,
        { message: newMessage },
        {
          headers: { token: `Bearer ${user?.accessToken}` },
        }
      );

      const sentMessage = res.data;

      socket.emit("send_message", {
        message: newMessage,
        senderId: user._id,
        receiverId: conversation?.partnerId,
        conversationId: conversation.id
      });
      
      if(!conversation.id) {
      socket.emit("send_conversation", {
        lastMessage: newMessage,
        isRead: false,
        sender: user?._id,
        senderName: user?.fullName,
        senderAvatar: user?.avatar,
        senderUsername: user?.username,
        receiver: conversation?.partnerId,
        receiverName: conversation?.partnerName,
        receiverAvatar: conversation?.partnerAvatar,
        receiverUsername: conversation?.partnerUsername,
        conversationId: res.data.conversationId
      });
    }


        dispatch(getMessageSuccess({
        conversationId: res.data.conversationId,
        message: newMessage,
        isRead: false,
        lastReceiver: conversation?.partnerId,
      }));

      setMessages([...messages, sentMessage]);
      setNewMessage("");
      setShowEmojiPicker(false);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {conversation ? (
        <>
          <div className="p-4 flex items-start space-x-2 sticky top-0 bg-white">
            <img
              alt={`Profile of ${conversation.partnerName}`}
              className="w-10 h-10 rounded-full hover:cursor-pointer"
              onClick={() => navigate(`/${conversation?.partnerUsername}`)}
              src={
                conversation.partnerAvatar ||
                "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
              }
            />
            <p className="p-1 font-bold hover:underline hover:cursor-pointer" onClick={() => navigate(`/${conversation?.partnerUsername}`)}>{conversation.partnerName}</p>
          </div>
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ maxHeight: "calc(100vh - 150px)" }}
          >
            {loading ? (
              <div className="flex justify-center items-center mt-40">
                <CircularProgress />
              </div>
            ) : (
              messages.map((msg) => {
                const formattedDate = new Date(
                  msg.createdAt
                ).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                const formattedTime = new Date(
                  msg.createdAt
                ).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${
                      msg.sender === user._id ? "items-end" : "items-start"
                    } mb-4`}
                  >
                    <div
                      className={`p-2 rounded-lg max-w-xs ${
                        msg.sender === user._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formattedTime}, {formattedDate}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-300 relative">
            <div className="flex items-center space-x-2">
            <button
                onClick={toggleEmojiPicker}
                className="px-2 py-1 hover:bg-gray-100 rounded-full"
              >
                <FontAwesomeIcon icon={faSmile} />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-4">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                placeholder="Type a message"
                className="flex-1 p-2 border border-gray-300 rounded-lg outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center p-8 pt-[300px] text-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Select a message
            </h1>
            <p className="text-gray-500 mt-2">
              Choose from your existing conversations, start a new one, or just
              keep swimming.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDetail;
