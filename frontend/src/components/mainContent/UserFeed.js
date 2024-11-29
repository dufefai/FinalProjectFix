import React, { useEffect, useRef, useState } from "react";
import SideBar from "../sidebar/SideBar";
import Profile from "../profile/Profile";
import SidebarRight from "../sidebarRight/SidebarRight";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import axiosJWT from "../../config/axiosJWT";
import {
  getProfilePost,
  deletePost,
  likePost,
  rePost,
} from "../../redux/apiRequest";
import EditForm from "./EditForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRetweet,
  faHeart,
  faLink,
  faEllipsisH,
  faPen,
  faTrash,
  faStar as fullStar,
  faStarHalfAlt as halfStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  faComment as faRegularComment,
  faHeart as faRegularHeart,
  faStar as emptyStar,
} from "@fortawesome/free-regular-svg-icons";
import { CircularProgress } from "@mui/material";

const UserFeed = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const profile = useSelector((state) => state.user?.user.currentProfile);
  const username = useParams().username;
  const profilePosts = useSelector((state) => state.post.posts.profilePosts);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [loading, setLoading] = useState(false);

  const profileRef = useRef(null);

  const renderStars = (rate) => {
    const stars = [];
    const fullStars = Math.floor(rate);
    const halfStars = rate % 1 >= 0.5 ? 1 : 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          icon={fullStar}
          className="text-yellow-500"
          key={`full-${i}`}
        />
      );
    }

    if (halfStars) {
      stars.push(
        <FontAwesomeIcon
          icon={halfStar}
          className="text-yellow-500"
          key="half"
        />
      );
    }

    for (let i = fullStars + halfStars; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon
          icon={emptyStar}
          className="text-yellow-500"
          key={`empty-${i}`}
        />
      );
    }
    return stars;
  };

  const scrollToBottom = () => {
    profileRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [username]);

  const handleOpenEditPopup = (post) => {
    setEditPopupOpen(true);
    setDropdownOpen(null);
    setPostToEdit(post);
  };

  const handleCloseEditPopup = () => {
    setEditPopupOpen(false);
    setPostToEdit(null);
  };

  const handleViewPost = (username, postId, event) => {
    if (window.getSelection().toString() === "") {
      navigate(`/${username}/post/${postId}`);
    }
  };

  useEffect(() => {
    setLoading(true);
    getProfilePost(user?.accessToken, dispatch, username, axiosJWT);
    setLoading(false);
    // eslint-disable-next-line
  }, [dispatch, username]);

  const handleRepost = async (postId) => {
    await rePost(user?.accessToken, dispatch, postId, axiosJWT);
  };

  const handleLikePost = async (postId) => {
    await likePost(user?.accessToken, dispatch, postId, axiosJWT);
  };

  const handleCopyLink = (post) => {
    const link = `${window.location.origin}/${post.author.username}/post/${post._id}`;
    navigator.share({ title: "Post", text: link, url: link });
  };

  const toggleDropdown = (postId) => {
    setDropdownOpen(dropdownOpen === postId ? null : postId);
  };

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setDropdownOpen(null);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    deletePost(user?.accessToken, dispatch, postToDelete, axiosJWT);
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[57%] md:w-[39%]">
        <div className="border-b border-gray-300">
        <div ref={profileRef} />
          <div className="flex items-start pb-4">
            <Profile />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : profilePosts && profilePosts.length > 0 ? (
          profilePosts.map((post) => {
            const author =
              post.isRepost && post.originalAuthor
                ? post.originalAuthor
                : post.author;

            return (
              <div
                key={post._id}
                onClick={(e) => handleViewPost(author.username, post._id, e)}
                className="relative border-b border-gray-300 py-4 hover:bg-gray-100 cursor-pointer"
              >
                {post.isRepost && (
                  <div className="ml-6 mb-4 flex items-center text-gray-500">
                    <FontAwesomeIcon icon={faRetweet} className="mr-2" />
                    <p className="text-sm">
                      {username === user?.username
                        ? "You reposted"
                        : `${username} reposted`}
                    </p>
                  </div>
                )}

                <div className="flex items-center ml-6 justify-between">
                  <div className="flex items-center">
                    <img
                      src={
                        author.avatar ||
                        "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                      }
                      alt={author.fullName}
                      className="w-10 h-10 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${author.username}`);
                      }}
                    />
                    <div className="ml-3">
                      <div className="flex flex-col">
                        <div className="flex items-top">
                          <h2
                            className="font-bold mr-2 hover:underline hover:cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/${author.username}`);
                            }}
                          >
                            {author.fullName}
                          </h2>
                          <p
                            className="text-gray-500 hover:underline hover:cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/${author.username}`);
                            }}
                          >
                            @{author.username}
                          </p>
                        </div>
                        <div className="text-gray-500 text-sm">
                          <span>
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(!post.hasReposted && (user._id === profile._id || user.role === "admin")) && (
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faEllipsisH}
                        className="cursor-pointer mr-6 mb-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(post._id);
                        }}
                      />
                      {dropdownOpen === post._id && (
                        <div className="absolute right-0 mr-4 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 hover:rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditPopup(post);
                            }}
                          >
                            <FontAwesomeIcon icon={faPen} className="mr-2" />
                            Edit
                          </button>
                          <button
                            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 hover:rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post._id);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="mr-2 text-red-600"
                            />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {post.mention && (
                <div className="ml-20 mt-2 mb-2">
                  <span className="text-sm text-gray-400 mr-1">at:</span>
                  <span
                    className="font-semibold text-xl hover:underline hover:cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurant/${post.mention._id}`);
                    }}
                  >
                    {post.mention.name}
                  </span>

                  <div className="mt-1">
                    {renderStars(
                      post.mention.rate ? post.mention.rate.$numberDecimal : 0
                    )}
                  </div>
                </div>
              )}

                <div className="ml-20 mt-2 mr-5">
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.content.replace(
                        /#(\p{L}+)/gu,
                        '<span style="color: #1DA1F2">#$1</span>'
                      ),
                    }}
                  ></p>
                  {post.image && post.image.length > 0 && (
                    <div className="mt-2 overflow-x-auto">
                      <div className="flex space-x-2">
                        {post.image.map((imgSrc, index) => (
                          <img
                            key={index}
                            src={imgSrc}
                            alt={`Post content ${index + 1}`}
                            className="w-full max-h-[300px] object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between ml-20 mt-4 mr-5 text-gray-500 text-sm">
                  <button className="flex items-center hover:text-[#1DA1F2]">
                    <FontAwesomeIcon
                      icon={faRegularComment}
                      className="w-5 h-5 hover:bg-blue-200 rounded-full p-2"
                    />
                    <span>{post.comments}</span>
                  </button>
                  <div className="flex flex-grow justify-evenly ">
                    <button
                      className={`flex items-center ${
                        post.hasReposted
                          ? "text-green-500"
                          : "hover:text-[#1df232]"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRepost(post._id);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faRetweet}
                        className="w-5 h-5 hover:bg-green-200 rounded-full p-2"
                      />
                      <span>{post.reposts}</span>
                    </button>
                    <button
                      className={`flex items-center ${
                        post.likes.includes(user?._id)
                          ? "text-red-500"
                          : "hover:text-[#f21d1d]"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikePost(post._id);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={
                          post.likes.includes(user?._id)
                            ? faHeart
                            : faRegularHeart
                        }
                        className="w-5 h-5 hover:bg-red-200 rounded-full p-2"
                      />
                      <span>{post.likes.length}</span>
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(post);
                    }}
                    className="hover:text-blue-500 flex items-center"
                  >
                    <FontAwesomeIcon icon={faLink} className="w-5 h-5 mr-1" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="flex justify-center items-center">No posts available</p>
        )}
      </div>
      <div className="w-[25%] border-l border-gray-300">
        <SidebarRight />
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-center">Delete post?</h2>
            <p className="mb-4 text-center">
              This can’t be undone and it will be removed from your profile, the
              timeline of any accounts that follow you, and from search results.
            </p>
            <div className="flex flex-col space-y-4">
              <button
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <EditForm
        isOpen={isEditPopupOpen}
        onClose={handleCloseEditPopup}
        post={postToEdit}
      />
    </div>
  );
};

export default UserFeed;
