import React, { useEffect, useState, useRef } from "react";
import SideBar from "../sidebar/SideBar";
import SidebarRight from "../sidebarRight/SidebarRight";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { viewPost, reply, rePost, likePost } from "../../redux/apiRequest";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CircularProgress } from "@mui/material";
import axiosJWT from "../../config/axiosJWT";
import {
  faRetweet,
  faHeart,
  faLink,
  faChevronLeft,
  faChevronRight,
  faArrowLeft,
  faFileImage,
  faBold,
  faItalic,
  faClose,
  faStar as fullStar,
  faStarHalfAlt as halfStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  faComment as faRegularComment,
  faHeart as faRegularHeart,
  faStar as emptyStar,
} from "@fortawesome/free-regular-svg-icons";
import { format } from "date-fns";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { app } from "../../firebase";

const PostDetails = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const id = useParams().id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentReplyImageIndex, setCurrentReplyImageIndex] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  const contentEditableRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    if (!user) navigate("/");
    if (user?.accessToken) viewPost(user?.accessToken, dispatch, id, axiosJWT);
  }, [user, dispatch, navigate, id]);

  const loading = useSelector((state) => state.post.loading);
  const post = useSelector((state) => state.post.post.currentPost.post);
  const replies = useSelector((state) => state.post.post.currentPost.replies);
  const repliedPost = useSelector(
    (state) => state.post.post.currentPost.repliedPost
  );

  const handleCopyLink = (post) => {
    const link = `${window.location.origin}/${post.author.username}/post/${post._id}`;
    navigator.share({ title: "Post", text: link, url: link });
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid date"; // Prevent invalid date formatting
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid date" : format(date, "HH:mm, dd/MM/yyyy");
  };

  const handleViewReply = (username, postId, event) => {
    if (window.getSelection().toString() === "") {
      navigate(`/${username}/post/${postId}`);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : post.image.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < post.image.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePrevReplyImage = (replyId, length) => {
    setCurrentReplyImageIndex((prevState) => ({
      ...prevState,
      [replyId]: prevState[replyId] > 0 ? prevState[replyId] - 1 : length - 1,
    }));
  };

  const handleNextReplyImage = (replyId, length) => {
    setCurrentReplyImageIndex((prevState) => ({
      ...prevState,
      [replyId]: prevState[replyId] < length - 1 ? prevState[replyId] + 1 : 0,
    }));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleRepost = async (postId) => {
    await rePost(user?.accessToken, dispatch, postId, axiosJWT);
  };

  const handleLikePost = async (postId) => {
    await likePost(user?.accessToken, dispatch, postId, axiosJWT);
  };

  const handlePostSubmit = async () => {
    setIsSubmitting(true);
    const uploadPromises = selectedImages.map(async (image) => {
      const storage = getStorage(app);
      const storageRef = ref(storage, `images/${user?.username}/${Date.now()}`);
      const response = await fetch(image);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    });
    const imageUrls = await Promise.all(uploadPromises);
    const processedContent = contentEditableRef.current.innerHTML;
    const newReply = {
      content: processedContent,
      image: imageUrls,
    };
    await reply(user?.accessToken, dispatch, id, newReply, axiosJWT);

    contentEditableRef.current.innerHTML = "";
    setIsSubmitting(false);
    setIsEmpty(true);
    setSelectedImages([]);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const imagePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      setSelectedImages([...selectedImages, ...images]);
      setCurrentImageIndex(0);
    });
  };

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.offsetHeight;
      setLineHeight(contentHeight - 5);
    }
  }, [repliedPost]);

  const insertHTMLTag = (tag) => {
    document.execCommand(tag, false, null);
  };

  const handleInput = () => {
    const content = contentEditableRef.current.innerHTML;
    setIsEmpty(content.trim() === "" || content.trim() === "<br>");
  };

  const handleDeleteImage = () => {
    setSelectedImages((prevImages) =>
      prevImages.filter((_, index) => index !== currentImageIndex)
    );
    setCurrentImageIndex(0);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[57%] md:w-[39%]">
        {loading || !post ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Back Button */}
            <div className="flex items-center mb-4 mt-4">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 mr-8 p-3"
                aria-label="Back"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
              </button>
              <span className="text-xl font-semibold">Post</span>
            </div>
            {repliedPost && (
              <div className="flex items-start px-4 text-xs xl:text-base">
                <img
                  src={
                    repliedPost?.author?.avatar ||
                    "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                  }
                  alt={repliedPost?.author?.fullName}
                  className="w-12 h-12 rounded-full mr-4 cursor-pointer"
                  onClick={() => navigate(`/${repliedPost.author.username}`)}
                />
                <div
                  className="absolute left-[438px] translate-y-[79px] bg-gray-300"
                  style={{
                    width: "2px",
                    top: "calc(3rem)",
                    height: `${lineHeight}px`,
                  }}
                ></div>
                <div className="flex items-center">
                  <h2 className="font-bold mr-2 hover:underline cursor-pointer" onClick={() => navigate(`/${repliedPost?.author?.username}`)}>
                    {repliedPost?.author?.fullName}
                  </h2>
                  <span className="text-gray-500 cursor-pointer" onClick={() => navigate(`/${repliedPost?.author?.username}`)}>
                    @{repliedPost?.author?.username}
                  </span>
                  <span className="text-gray-500 mx-2 font-extrabold">·</span>
                  <span className="text-gray-500 text-sm">
                    {formatDistanceToNow(repliedPost?.createdAt)} ago
                  </span>
                </div>
              </div>
            )}
            {repliedPost && (
              <div ref={contentRef} className=" pl-16 -translate-y-6">
              {repliedPost.mention && (
                <div className="pl-4 mt-2 mb-2">
                  <span className="text-sm text-gray-400 mr-1">at:</span>
                  <span
                    className="font-semibold text-xl hover:underline hover:cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurant/${repliedPost.mention._id}`);
                    }}
                  >
                    {repliedPost.mention?.name}
                  </span>

                  <div className="mt-1">
                    {renderStars(
                      repliedPost.mention?.rate ? repliedPost.mention.rate.$numberDecimal : 0
                    )}
                  </div>
                </div>
              )}
                <div className="mb-4 px-4">
                  <p
                    dangerouslySetInnerHTML={{
                      __html: repliedPost?.content?.replace(
                        /#(\p{L}+)/gu,
                        '<span style="color: #1DA1F2">#$1</span>'
                      ),
                    }}
                  ></p>

                  {/* Render images with navigation */}
                  {repliedPost?.image && repliedPost?.image.length > 0 && (
                    <div className="relative">
                      <img
                        src={
                          repliedPost?.image[
                            currentReplyImageIndex[repliedPost._id] || 0
                          ]
                        }
                        alt="repliedPost content"
                        className="w-full max-h-[300px] object-cover rounded-lg mb-2"
                      />
                      {repliedPost?.image.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrevReplyImage(
                                repliedPost._id,
                                repliedPost?.image?.length
                              );
                            }}
                            className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white"
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNextReplyImage(
                                repliedPost._id,
                                repliedPost?.image?.length
                              );
                            }}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white"
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-gray-500 text-sm px-4">
                  <button
                    className="flex items-center hover:text-[#1DA1F2]"
                    onClick={() =>
                      navigate(
                        `/${repliedPost.author.username}/post/${repliedPost._id}`
                      )
                    }
                  >
                    <FontAwesomeIcon
                      icon={faRegularComment}
                      className="w-5 h-5 hover:bg-blue-200 rounded-full p-2"
                    />
                    <span>{repliedPost?.comments}</span>
                  </button>
                  <button
                    className={`flex items-center ${
                      repliedPost?.hasReposted
                        ? "text-green-500"
                        : "hover:text-[#1df232]"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRepost(repliedPost._id);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faRetweet}
                      className="w-5 h-5 hover:bg-green-200 rounded-full p-2"
                    />
                    <span>{repliedPost?.reposts}</span>
                  </button>
                  <button
                    className={`flex items-center ${
                      repliedPost?.likes.includes(user?._id)
                        ? "text-red-500"
                        : "hover:text-[#f21d1d]"
                    } `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikePost(repliedPost._id);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        repliedPost?.likes.includes(user?._id)
                          ? faHeart
                          : faRegularHeart
                      }
                      className="w-5 h-5 hover:bg-red-200 rounded-full p-2"
                    />
                    <span>{repliedPost?.likes.length}</span>
                  </button>
                  <button
                    onClick={(e) =>{e.stopPropagation(); handleCopyLink(repliedPost)}}
                    className="flex items-center hover:text-blue-500"
                  >
                    <FontAwesomeIcon icon={faLink} className="w-5 h-5 mr-1" />
                  </button>
                </div>
              </div>
            )}

            {/* User Information */}
            <div className="flex items-start mb-4 px-4 text-xs xl:text-base">
              <img
                src={
                  post?.author?.avatar ||
                  "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                }
                alt={post?.author?.fullName}
                className="w-12 h-12 rounded-full mr-4 cursor-pointer"
                onClick={() => navigate(`/${post?.author?.username}`)}
              />
              <div>
                <div className="flex items-center mb-1">
                  <h2 className="font-bold mr-2 hover:underline cursor-pointer" onClick={() => navigate(`/${post?.author?.username}`)}>{post?.author?.fullName}</h2>
                </div>
                <p className="text-gray-500 cursor-pointer" onClick={() => navigate(`/${post?.author?.username}`)}>@{post?.author?.username}</p>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4 px-4">
            {post.mention && (
                <div className="mt-2 mb-2">
                  <span className="text-sm text-gray-400 mr-1">at:</span>
                  <span
                    className="font-semibold text-xl hover:underline hover:cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurant/${post?.mention._id}`);
                    }}
                  >
                    {post?.mention?.name}
                  </span>

                  <div className="mt-1">
                    {renderStars(
                      post?.mention?.rate ? post?.mention.rate.$numberDecimal : 0
                    )}
                  </div>
                </div>
              )}
              <p
                dangerouslySetInnerHTML={{
                  __html: post?.content?.replace(
                    /#(\p{L}+)/gu,
                    '<span style="color: #1DA1F2">#$1</span>'
                  ),
                }}
              ></p>

              {/* Render images with navigation */}
              {post?.image && post?.image.length > 0 && (
                <div className="relative mt-2">
                  <img
                    src={post?.image[currentImageIndex]}
                    alt={`Post content ${currentImageIndex + 1}`}
                    className="w-full max-h-[300px] object-cover rounded-lg mb-2"
                  />
                  {post?.image.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white"
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </>
                  )}
                </div>
              )}

              <p className="text-gray-500 text-sm mt-2">
                {formatDate(post?.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="border border-gray-100 w-full my-5"></div>

            <div className="flex justify-between text-gray-500 text-sm px-4">
              <button className="flex items-center hover:text-[#1DA1F2]">
                <FontAwesomeIcon
                  icon={faRegularComment}
                  className="w-5 h-5 hover:bg-blue-200 rounded-full p-2"
                />
                <span>{post?.comments}</span>
              </button>
              <button
                className={`flex items-center ${
                  post.hasReposted ? "text-green-500" : "hover:text-[#1df232]"
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
                } `}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikePost(post._id);
                }}
              >
                <FontAwesomeIcon
                  icon={
                    post.likes.includes(user?._id) ? faHeart : faRegularHeart
                  }
                  className="w-5 h-5 hover:bg-red-200 rounded-full p-2"
                />
                <span>{post.likes.length}</span>
              </button>
              <button
                onClick={(e) => {e.stopPropagation();handleCopyLink(post)}}
                className="flex items-center hover:text-blue-500"
              >
                <FontAwesomeIcon icon={faLink} className="w-5 h-5 mr-1" />
              </button>
            </div>

            <div className="border border-gray-100 w-full my-5"></div>

            <div className="border-b border-gray-300">
              <div className=" flex items-start ml-4 pb-4 mr-5">
                <img
                  src={
                    user?.avatar
                      ? user?.avatar
                      : `https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg`
                  }
                  alt={user?.fullName}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div className="flex-grow relative">
                  <div
                    ref={contentEditableRef}
                    contentEditable
                    className="w-[500px] p-2 rounded-md mb-2 overflow-y-auto"
                    onInput={handleInput}
                    style={{
                      minHeight: "20px",
                      outline: "none",
                      wordWrap: "break-word",
                    }}
                  ></div>
                  {isEmpty && (
                    <div
                      className="absolute top-2 left-2 text-gray-400 pointer-events-none"
                      style={{ pointerEvents: "none" }}
                    >
                      Post your reply
                    </div>
                  )}
                  {selectedImages.length > 0 && (
                    <div className="my-2 relative">
                      <img
                        src={selectedImages[currentImageIndex]}
                        alt={`Selected ${currentImageIndex + 1}`}
                        className="w-full h-auto rounded-lg"
                      />
                      {selectedImages.length > 1 && (
                        <>
                          <FontAwesomeIcon
                            icon={faChevronLeft}
                            onClick={handlePrevImage}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 cursor-pointer text-white"
                          />
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            onClick={handleNextImage}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer text-white"
                          />
                        </>
                      )}
                      <FontAwesomeIcon
                        icon={faClose}
                        onClick={handleDeleteImage}
                        className="absolute top-0 right-0 mt-2 mr-2 cursor-pointer text-gray-500"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple
                      />
                      <FontAwesomeIcon
                        icon={faFileImage}
                        onClick={handleIconClick}
                        style={{ cursor: "pointer" }}
                        className="mr-2"
                      />
                      <FontAwesomeIcon
                        icon={faBold}
                        onClick={() => insertHTMLTag("bold")}
                        style={{ cursor: "pointer" }}
                        className="mr-2"
                      />
                      <FontAwesomeIcon
                        icon={faItalic}
                        onClick={() => insertHTMLTag("italic")}
                        style={{ cursor: "pointer" }}
                        className="mr-2"
                      />
                    </div>
                    <button
                      onClick={handlePostSubmit}
                      disabled={isEmpty || isSubmitting}
                      className={`${
                        isEmpty || isSubmitting
                          ? "bg-blue-300"
                          : "bg-blue-600 hover:bg-blue-800"
                      } text-white font-medium rounded-full px-4 py-2 mr-[350px] xl:mr-1 transition duration-200 ease-in-out`}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Render Replies */}
            <div className="text-xs">
              {replies?.length > 0 ? (
                replies.map((reply) => (
                  <div
                    key={reply._id}
                    onClick={(e) =>
                      handleViewReply(
                        reply.isRepost
                          ? reply.originalAuthor.username
                          : reply.author.username,
                        reply.isRepost ? reply.rePost : reply._id,
                        e
                      )
                    }
                    className="hover:bg-gray-100 p-4 border-b border-gray-300 cursor-pointer"
                  >
                    <div className="flex items-start">
                      <img
                        src={
                          reply?.author?.avatar ||
                          "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                        }
                        alt={reply?.author?.fullName}
                        className="w-10 h-10 rounded-full mr-4"
                        onClick={(e) => {e.stopPropagation(); navigate(`/${reply?.author?.username}`)}}
                      />
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-bold hover:underline" onClick={(e) => {e.stopPropagation(); navigate(`/${reply?.author?.username}`)}}>
                            {reply?.author?.fullName}
                          </h4>
                          <p className="text-gray-500 ml-2" onClick={(e) => {e.stopPropagation(); navigate(`/${reply?.author?.username}`)}}>
                            @{reply?.author?.username}
                          </p>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {formatDistanceToNow(new Date(reply.createdAt))} ago
                        </p>
                      </div>
                    </div>
                    <div className="pl-14">
                      <p
                        className="mb-2"
                        dangerouslySetInnerHTML={{
                          __html: reply?.content?.replace(
                            /#(\p{L}+)/gu,
                            '<span style="color: #1DA1F2">#$1</span>'
                          ),
                        }}
                      ></p>

                      {/* Render images for replies with navigation */}
                      {reply?.image && reply?.image.length > 0 && (
                        <div className="relative">
                          <img
                            src={
                              reply?.image[
                                currentReplyImageIndex[reply._id] || 0
                              ]
                            }
                            alt="Reply content"
                            className="w-full max-h-[200px] object-cover rounded-lg mb-2"
                          />
                          {reply?.image.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrevReplyImage(
                                    reply._id,
                                    reply?.image.length
                                  );
                                }}
                                className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white"
                              >
                                <FontAwesomeIcon icon={faChevronLeft} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextReplyImage(
                                    reply._id,
                                    reply?.image.length
                                  );
                                }}
                                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white"
                              >
                                <FontAwesomeIcon icon={faChevronRight} />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between text-gray-500 text-sm">
                        <button className="flex items-center hover:text-[#1DA1F2]">
                          <FontAwesomeIcon
                            icon={faRegularComment}
                            className="w-5 h-5 mr-1"
                          />
                          <span>{reply?.comments}</span>
                        </button>
                        <button
                          className={`flex items-center ${
                            reply.hasReposted
                              ? "text-green-500"
                              : "hover:text-[#1df232]"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRepost(reply._id);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faRetweet}
                            className="w-5 h-5 hover:bg-green-200 rounded-full p-2"
                          />
                          <span>{reply.reposts}</span>
                        </button>
                        <button
                          className={`flex items-center ${
                            reply.likes.includes(user?._id)
                              ? "text-red-500"
                              : "hover:text-[#f21d1d]"
                          } `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePost(reply._id);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={
                              reply.likes.includes(user?._id)
                                ? faHeart
                                : faRegularHeart
                            }
                            className="w-5 h-5 hover:bg-red-200 rounded-full p-2"
                          />
                          <span>{reply.likes.length}</span>
                        </button>
                        <button
                          onClick={(e) => {e.stopPropagation(); handleCopyLink(reply)}}
                          className="flex items-center hover:text-blue-500"
                        >
                          <FontAwesomeIcon
                            icon={faLink}
                            className="w-5 h-5 mr-1"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="flex justify-center ">No replies yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="w-[25%] border-l border-gray-300">
        <SidebarRight />
      </div>
    </div>
  );
};

export default PostDetails;
