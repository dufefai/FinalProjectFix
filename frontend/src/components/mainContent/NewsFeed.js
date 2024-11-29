import React, { useState, useEffect, useRef } from "react";
import SideBar from "../sidebar/SideBar";
import SidebarRight from "../sidebarRight/SidebarRight";
import { getNews, post, rePost, likePost } from "../../redux/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";

import axiosJWT from "../../config/axiosJWT";
import { app } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRetweet,
  faHeart,
  faLink,
  faFileImage,
  faBold,
  faItalic,
  faChevronLeft,
  faChevronRight,
  faClose,
  faTag,
  faStar as fullStar,
  faStarHalfAlt as halfStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  faComment as faRegularComment,
  faHeart as faRegularHeart,
  faStar as emptyStar,
} from "@fortawesome/free-regular-svg-icons";
import { CircularProgress } from "@mui/material";

const NewsFeed = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);

  const [taggedStore, setTaggedStore] = useState(null);
  const [storeSearchResults, setStoreSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTagSearch, setShowTagSearch] = useState(false);

  const fileInputRef = useRef(null);
  const contentEditableRef = useRef(null);

  const user = useSelector((state) => state.auth.login?.currentUser);
  const posts = useSelector((state) => state.post.posts.allPosts);

  const loading = useSelector((state) => state.post.loading);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/");
    if (user?.accessToken && posts.length === 0)
      getNews(user?.accessToken, dispatch, axiosJWT);
  }, [user, posts, dispatch, navigate]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === "") {
      setStoreSearchResults([]);
      return;
    }

    try {
      const response = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/searchStore?text=${e.target.value}`,
        {
          headers: { token: `Bearer ${user?.accessToken}` },
        }
      );
      setStoreSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const handleStoreSelect = (store) => {
    setTaggedStore(store);
    setShowTagSearch(false);
    setSearchQuery("");
  };

  const clearTaggedStore = () => {
    setTaggedStore(null);
  };

  const handleCopyLink = (post) => {
    const link = `${window.location.origin}/${post.author.username}/post/${post._id}`;
    navigator.share({ title: "Post", text: link, url: link });
  };

  const handleViewPost = (username, postId, event) => {
    if (window.getSelection().toString() === "") {
      navigate(`/${username}/post/${postId}`);
    }
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
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
    const newPost = {
      content: processedContent,
      image: imageUrls,
      mention: taggedStore?._id,
    };
    await post(user?.accessToken, dispatch, newPost, axiosJWT);

    contentEditableRef.current.innerHTML = "";
    setIsSubmitting(false);
    setIsEmpty(true);
    setSelectedImages([]);
    setTaggedStore(null);
  };

  const handleRepost = async (postId) => {
    await rePost(user?.accessToken, dispatch, postId, axiosJWT);
  };

  const handleLikePost = async (postId) => {
    await likePost(user?.accessToken, dispatch, postId, axiosJWT);
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

  const insertHTMLTag = (tag) => {
    document.execCommand(tag, false, null); // Insert bold/italic HTML tags
  };

  const handleInput = () => {
    const content = contentEditableRef.current.innerHTML;
    setIsEmpty(content.trim() === "" || content.trim() === "<br>");
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === selectedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? selectedImages.length - 1 : prevIndex - 1
    );
  };

  const handleDeleteImage = () => {
    setSelectedImages((prevImages) =>
      prevImages.filter((_, index) => index !== currentImageIndex)
    );
    setCurrentImageIndex(0);
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

  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[57%] md:w-[39%]">
        <div className="border-b border-gray-300">
          <div className="flex items-start ml-6 mt-6 mb-2">
            <img
              src={
                user?.avatar
                  ? user?.avatar
                  : `https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg`
              }
              alt={user?.fullName}
              className="w-10 h-10 rounded-full mr-4"
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
                  Write your thoughts...
                </div>
              )}
              {selectedImages.length > 0 && (
                <div className="my-2 relative mr-2">
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
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                      />
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        onClick={handleNextImage}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
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
              <div className="w-[30%] border border-gray-300 xl:w-full my-2"></div>

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
                  {taggedStore ? (
                    <div className="font-semibold">
                      <span>{taggedStore.name}</span>
                      <FontAwesomeIcon
                        icon={faClose}
                        onClick={clearTaggedStore}
                        className="ml-1"
                      />
                    </div>
                  ) : (
                    <FontAwesomeIcon
                      icon={faTag}
                      alt="tag"
                      onClick={() => setShowTagSearch(!showTagSearch)}
                      className="mr-2"
                    />
                  )}
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
                  Post
                </button>
              </div>
              {showTagSearch && (
                <div className="">
                  <input
                    type="text"
                    placeholder="Search store..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-1/2 p-2 border-b outline-none "
                  />
                  {storeSearchResults.map((store) => (
                    <div
                      key={store._id}
                      className="mt-2 flex items-center hover:cursor-pointer hover:bg-gray-200 p-2"
                      onClick={() => handleStoreSelect(store)}
                    >
                      <img
                        src={store.image}
                        alt={store.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold">{store.name}</span>
                        <div className="flex items-center text-gray-500">
                          <FontAwesomeIcon
                            icon={fullStar}
                            className="text-yellow-500 mr-1"
                          />
                          {store.rate && store.rate.$numberDecimal !== "0" ? (
                            <span className="mr-2">
                              {store.rate.$numberDecimal}
                            </span>
                          ) : (
                            <span className="mr-2">No reviews</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post._id}
              onClick={(e) =>
                handleViewPost(
                  post.isRepost
                    ? post.originalAuthor.username
                    : post.author.username,
                  post.isRepost ? post.rePost : post._id,
                  e
                )
              }
              className="border-b py-4 hover:bg-gray-100"
            >
              <div className="flex items-center ml-6">
                <img
                  src={
                    post.author?.avatar
                      ? post.author?.avatar
                      : `https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg`
                  }
                  alt={post.author.fullName}
                  className="w-10 h-10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/${post?.author?.username}`);
                  }}
                />

                <div className="ml-3">
                  <div className="flex flex-col">
                    <div className="flex items-top">
                      <h2
                        className="font-bold mr-2 hover:underline hover:cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/${post?.author?.username}`);
                        }}
                      >
                        {post.author.fullName}
                      </h2>
                      <p
                        className="text-gray-500 hover:underline hover:cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/${post?.author?.username}`);
                        }}
                      >
                        @{post.author.username}
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
                ></p>{" "}
                {/* Render HTML content with hashtags in blue */}
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
                    } `}
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
          ))
        ) : (
          <p className="flex justify-center items-center">No posts available</p>
        )}
      </div>
      <div className="w-[25%] border-l border-gray-300">
        <SidebarRight />
      </div>
    </div>
  );
};

export default NewsFeed;
