import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosJWT from "../../config/axiosJWT";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { follow } from "../../redux/apiRequest";

const SearchUser = ({ query }) => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getSearchResult = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/user/search?text=${query}`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      // Update users with a follow status to track changes in follow/unfollow button
      const updatedUsers = res.data.map((u) => ({
        ...u,
        isFollowing: u.follower.includes(user?._id),
      }));
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  const handleFollow = async (userID) => {
    await follow(user?.accessToken, dispatch, userID, axiosJWT);
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u._id === userID ? { ...u, isFollowing: !u.isFollowing } : u
      )
    );
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.accessToken && query) {
        setLoading(true);
        await getSearchResult(user.accessToken);
        setLoading(false);
      } else {
        setUsers([]);
      }
    };

    fetchUsers();

    return () => {
      setUsers([]);
      setLoading(false);
    };
    // eslint-disable-next-line
  }, [user, query]);

  return (
    <div className="px-4">
      {loading ? (
        <div className="flex justify-center items-center mt-40">
          <CircularProgress />
        </div>
      ) : (
        <div>
          {users.length > 0 ? (
            users.map((u) => (
              <div
                key={u._id}
                className="flex items-start p-4 border-b border-gray-300 cursor-pointer"
                onClick={() => navigate(`/${u.username}`)}
              >
                <img
                  src={
                    u.avatar ||
                    "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                  }
                  alt={u.username}
                  className="rounded-full w-12 h-12 mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-bold">
                    {u.fullName || u.username}
                  </h3>
                  <p className="text-sm text-gray-600">@{u.username}</p>
                  {u.description && (
                    <p className="text-sm text-gray-800 mt-1">
                      {u.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(u._id);
                  }}
                  className={`${
                    u.isFollowing ? "bg-gray-200 text-black" : "bg-black text-white"
                  } py-1 px-4 rounded-full ${
                    u.isFollowing ? "hover:bg-gray-300" : "hover:bg-black"
                  }`}
                  style={{ display: user?._id === u._id ? "none" : "block" }}
                >
                  {u.isFollowing ? "Following" : "Follow"}
                </button>
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

export default SearchUser;
