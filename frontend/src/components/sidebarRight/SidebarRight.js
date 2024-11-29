import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosJWT from '../../config/axiosJWT';
import { follow } from '../../redux/apiRequest';
import { setRandomUsers } from '../../redux/userSlice';

const SidebarRight = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const randomUsers = useSelector((state) => state.user?.users?.users);

  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const fetchRandomUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosJWT.get("http://localhost:8000/api/user/getRandomUser", {
        headers: { token: `Bearer ${user?.accessToken}` },
      });
      const updatedUsers = res.data?.map((u) => ({
        ...u,
        isFollowing: u.follower?.includes(user?._id),
      }));
      dispatch(setRandomUsers(updatedUsers));
    } catch (error) {
      console.error("Failed to fetch random users:", error);
    }
    setLoading(false);
  };

  const handleFollow = async (userID) => {
    await follow(user?.accessToken, dispatch, userID, axiosJWT);
    dispatch(
      setRandomUsers(
        randomUsers?.map((u) =>
          u._id === userID ? { ...u, isFollowing: !u.isFollowing } : u
        )
      )
    );
  };

  useEffect(() => {
    if (user && randomUsers?.length === 0) {
      fetchRandomUsers();
    }
  }, [user, randomUsers, dispatch]); // eslint-disable-line 

  return (
    <div className='fixed mt-5 ml-20 hidden md:block'>
      <form onSubmit={handleSearch} className="relative w-full mb-4">
        <span
          className={`absolute left-3 top-1/2 pl-2 transform -translate-y-1/2 ${
            isFocused ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input
          type='text'
          placeholder='Search'
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className='w-full pl-14 p-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-300 bg-gray-200 focus:bg-white'
        />
      </form>

      <div className='border border-gray-300 mt-4 rounded-lg w-[360px]'>
        <div className='pt-2'>
          <div className="text-lg font-bold mb-2 pl-3">People you may know</div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            randomUsers?.map((u) => (
              <div
                key={u._id}
                className="flex items-start p-4 hover:bg-gray-300 cursor-pointer"
                onClick={() => navigate(`/${u.username}`)}
              >
                <img
                  src={u.avatar || "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"}
                  alt={u.username}
                  className="rounded-full w-10 h-10 mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-md font-bold">{u.fullName || u.username}</h3>
                  <p className="text-sm text-gray-600">@{u.username}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(u._id);
                  }}
                  className={`${
                    u.isFollowing ? "bg-gray-200 text-black" : "bg-black text-white"
                  } py-1 px-3 rounded-full ${
                    u.isFollowing ? "hover:bg-gray-300" : "hover:bg-black"
                  }`}
                  style={{ display: user?._id === u._id ? "none" : "block" }}
                >
                  {u.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className='border border-gray-300 mt-4 rounded-lg'>
        <div className='pl-3 pt-2'>
          <div className="text-lg font-bold">Trends for you</div>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;
