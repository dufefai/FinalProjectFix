import React, { useState, useEffect } from "react";
import SideBar from "../sidebar/SideBar";
import MessageDetail from "./MessageDetail";
import { useSelector } from "react-redux";
import axiosJWT from "../../config/axiosJWT";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { addTemporaryConversation, readMessageSuccess } from "../../redux/messageSlice";

const Messenger = () => {
  const conversations = useSelector(
    (state) => state.message.message.conversations
  );
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {

    if (location.state?.partnerId) {
      const existingConversation = conversations.find(
        (conv) =>
          (conv.sender._id === location.state.partnerId && conv.receiver._id === user._id) ||
          (conv.receiver._id === location.state.partnerId && conv.sender._id === user._id)
      );

      if (existingConversation) {
        setSelectedConversation({
          id: existingConversation._id,
          partnerName: getConversationPartner(existingConversation).fullName,
          partnerAvatar: getConversationPartner(existingConversation).avatar,
          partnerId: location.state.partnerId,
        });
      } else {
        dispatch(addTemporaryConversation({
          partnerName: location.state.partnerName,
          partnerAvatar: location.state.partnerAvatar,
          partnerUsername: location.state.partnerUsername,
          partnerId: location.state.partnerId,
          isRead: true,
          currentUserId: user._id
        }));
      }
    }
  }, [location.state, conversations, user, dispatch]); // eslint-disable-line

  const getConversationPartner = (conversation) => {
    return conversation.sender._id === user._id
      ? conversation.receiver
      : conversation.sender;
  };

  const handleConversationClick = (conversationData) => {
    setSelectedConversation(conversationData);
    readConversation(user?.accessToken, conversationData.id);
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

  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[29%] hidden md:block">
        <div className="py-6 font-semibold pl-4 text-xl">Message</div>
        {conversations.length === 0 ? (
          <div className="p-14 text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to your inbox!
            </h1>
            <p className="text-gray-500 mt-2">
              Drop a line, share posts and more with private conversations
              between you and others.
            </p>
          </div>
        ) : (
          <div>
            {conversations.map((conversation) => {
              const partner = getConversationPartner(conversation);
              const isSelected =
                selectedConversation &&
                conversation._id === selectedConversation.id;
              const isUnread =
                !conversation.isRead && conversation.lastReceiver === user._id;
              return (
                <div
                  key={conversation._id}
                  className={`flex items-start space-x-3 cursor-pointer p-4 hover:bg-gray-200 ${
                    isSelected ? "bg-gray-300" : isUnread ? "bg-gray-200" : ""
                  }`}
                  onClick={() =>
                    handleConversationClick({
                      id: conversation._id,
                      partnerName: partner.fullName || partner.name,
                      partnerAvatar: partner.avatar || partner.image,
                      partnerUsername: partner?.username || "",
                      partnerId: partner._id,
                    })
                  }
                >
                  <img
                    alt={`Profile of ${partner.fullName || partner.name}`}
                    className="w-12 h-12 rounded-full"
                    src={
                      partner.avatar ||
                      partner.image ||
                      "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                    }
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold">
                        {partner.fullName || partner.name}
                      </span>
                      <span className="text-gray-500">
                        {partner.username ? `@${partner.username}` : ""}
                      </span>
                      <span className="text-gray-500 hidden lg:block">
                        •{" "}
                        {new Date(conversation.updatedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <p className="text-gray-600 truncate max-w-[100px] xl:max-w-[280px]">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="border-l border-gray-300 flex-1">
        <MessageDetail conversation={selectedConversation} />
      </div>
    </div>
  );
};

export default Messenger;
