import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosJWT from "../../config/axiosJWT";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRetweet, faHeart, faLink } from "@fortawesome/free-solid-svg-icons";
import {
  faComment as faRegularComment,
  faHeart as faRegularHeart,
} from "@fortawesome/free-regular-svg-icons";

const SearchPost = ({ query }) => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getSearchResult = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/post/search?text=${query}`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setPosts(res.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (user?.accessToken && query) {
        setLoading(true);
        await getSearchResult(user.accessToken);
        setLoading(false);
      } else {
        setPosts([]);
      }
    };

    fetchPosts();

    return () => {
      setPosts([]);
      setLoading(false);
    };
    // eslint-disable-next-line
  }, [user, query]);

  const handleViewPost = (username, postId, event) => {
    if (window.getSelection().toString() === "") {
      navigate(`/${username}/post/${postId}`);
    }
  };

  const handleCopyLink = (post) => {
    const link = `${window.location.origin}/post/${
      post.isRepost ? post.rePost : post._id
    }`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="px-4">
      {loading ? (
        <div className="flex justify-center items-center mt-40">
          <CircularProgress />
        </div>
      ) : (
        <div>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post._id}
                onClick={(e) => handleViewPost(post.author.username, post._id, e)}
                className="relative border-b border-gray-300 py-4 hover:bg-gray-100 cursor-pointer"
              >
                {post.isRepost && (
                  <div className="ml-6 mb-4 flex items-center text-gray-500">
                    <FontAwesomeIcon icon={faRetweet} className="mr-2" />
                    <p className="text-sm">
                      {post.originalAuthor?.username || "Anonymous"} reposted
                    </p>
                  </div>
                )}

                <div className="flex items-center ml-6 justify-between">
                  <div className="flex items-center">
                    <img
                      src={
                        post.isRepost && post.originalAuthor?.avatar
                          ? post.originalAuthor.avatar
                          : post.author?.avatar ||
                            "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                      }
                      alt={
                        post.isRepost && post.originalAuthor
                          ? post.originalAuthor.fullName
                          : post.author.fullName
                      }
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-3">
                      <div className="flex flex-col">
                        <div className="flex items-top">
                          <h2 className="font-bold mr-2">
                            {post.isRepost && post.originalAuthor
                              ? post.originalAuthor.fullName
                              : post.author.fullName}
                          </h2>
                          <p className="text-gray-500">
                            @
                            {post.isRepost && post.originalAuthor
                              ? post.originalAuthor.username
                              : post.author.username}
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
                </div>

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
                  <button
                    className={`flex items-center ${
                      post.hasReposted
                        ? "text-green-500"
                        : "hover:text-[#1df232]"
                    }`}
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
            <p className="text-center text-gray-500">No results for "{query}"</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPost;
