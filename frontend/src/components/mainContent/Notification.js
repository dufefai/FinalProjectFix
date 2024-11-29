import React from "react";
import SideBar from "../sidebar/SideBar";
import SidebarRight from "../sidebarRight/SidebarRight";
import { formatDistanceToNow } from "date-fns";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRetweet,
  faHeart,
  faComment,
  faListAlt,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";

import { viewNotification } from "../../redux/apiRequest";
import axiosJWT from "../../config/axiosJWT";

const Notification = () => {
  const notifications = useSelector(
    (state) => state.notification.notification.notifications
  );
  const user = useSelector((state) => state.auth.login?.currentUser);
  const navigate = useNavigate();
  const messageHTML = (message) => {
    return <div dangerouslySetInnerHTML={{ __html: message }} />;
  };

  const dispatch = useDispatch();

  const handleViewNotification = async (id) => {
    try {
      await viewNotification(user?.accessToken, dispatch, id, axiosJWT);
    } catch (error) {
      console.error("Error viewing notification:", error);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[57%] md:w-[39%]">
        <div className="py-6 font-semibold pl-4 text-xl border-b border-gray-300">
          Notifications
        </div>
        {notifications?.length < 1 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-2xl">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() =>{
                handleViewNotification(notification._id);
                navigate(
                  notification.type === "follow"
                    ? `/${notification.usernameComment}`
                    : notification.type === "order"
                    ? `/order/${notification.order}`
                    : `/${user?.username}/post/${notification.post}`
                );
              }
              }
              className={`border-b border-gray-300 py-4 hover:bg-gray-200 cursor-pointer ${
                notification.viewed === false ? "bg-gray-100" : ""
              }`}
            >
              {notification.type !== "order" ? (
                <div className="flex items-center ml-6">
                  <div className="relative">
                    <img
                      src={
                        notification.avatarComment
                          ? notification.avatarComment
                          : `https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg`
                      }
                      alt={notification.avatarComment}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="absolute -bottom-9 right-3">
                      {notification.type === "like" && (
                        <FontAwesomeIcon
                          icon={faHeart}
                          className="text-red-500 size-5"
                        />
                      )}
                      {notification.type === "repost" && (
                        <FontAwesomeIcon
                          icon={faRetweet}
                          className="text-green-500 size-5"
                        />
                      )}
                      {notification.type === "comment" && (
                        <FontAwesomeIcon
                          icon={faComment}
                          className="text-blue-500 size-5"
                        />
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="flex flex-col">
                      <div className="flex items-top">
                        <h2 className="font-bold mr-2">
                          {notification.fullNameComment}
                        </h2>
                        <p className="text-gray-500">
                          @{notification.usernameComment}
                        </p>
                      </div>
                      <div className="text-gray-500 text-sm">
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.updatedAt)
                          )}{" "}
                          ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center ml-6">
                  <div className="relative">
                    <div className="absolute -bottom-11 -right-[30px]">
                      <FontAwesomeIcon
                        icon={faListAlt}
                        className="text-gray-500 size-5"
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="flex flex-col">
                      <div className="text-gray-500 text-sm translate-x-10">
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.updatedAt)
                          )}{" "}
                          ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="ml-[75px] mt-2 mr-5">
                <p>{messageHTML(notification.message)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="w-[25%] border-l border-gray-300">
        <SidebarRight />
      </div>
    </div>
  );
};

export default Notification;
