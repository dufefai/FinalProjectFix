import React, { useEffect, useState } from "react";
import { getProfile, follow } from "../../redux/apiRequest";
import ProfileSetting from "./ProfileSetting";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosJWT from "../../config/axiosJWT";
import {
  faArrowLeft,
  faCalendarDay,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const profile = useSelector((state) => state.user?.user.currentProfile);
  const username = useParams().username;
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile(user?.accessToken, dispatch, username, axiosJWT);
  }, [user, dispatch, username]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleFollow = () => {
    follow(user?.accessToken, dispatch, profile?._id, axiosJWT);
  };

  const handleEditProfile = (profile) => {
    setEditPopupOpen(true);
    setProfileToEdit(profile);
  };

  const handleCloseEditProfile = () => {
    setEditPopupOpen(false);
    setProfileToEdit(null);
  };

  const handleMessage = () => {
    navigate("/messages", { state: { partnerId: profile._id, partnerName: profile?.fullName, partnerAvatar: profile?.avatar, partnerUsername: profile?.username } });
  };

  const isFollowing = profile?.follower?.includes(user?._id);

  return (
    <div className="w-full">
    
      <div className="flex items-center mt-4">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 mr-3 p-3"
          aria-label="Back"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
        </button>
        <span className="text-xl font-semibold">{profile?.fullName}</span>
      </div>

      {/* Background Image */}
      <div
        className="w-full h-64 bg-cover bg-center"
        style={{
          backgroundImage: `url(${
            profile?.background ||
            "https://png.pngtree.com/thumb_back/fh260/background/20210207/pngtree-simple-gray-solid-color-background-image_557027.jpg"
          })`,
        }}
      ></div>

      {/* Avatar and Profile Info */}
      <div className="p-5 relative">
        {/* Avatar */}
        <img
          src={
            profile?.avatar ||
            "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
          }
          alt="Profile Avatar"
          className="w-36 h-36 rounded-full border-4 border-white relative -top-20"
        />

        {/* Conditional Buttons */}
        {user?._id === profile?._id ? (
          // Show Edit Profile button if it's the logged-in user's profile
          <button
            onClick={() => handleEditProfile(profile)}
            className="absolute right-0 font-semibold border top-2 py-1 px-4 mr-4 rounded-full hover:bg-gray-200"
          >
            Edit Profile
          </button>
        ) : (
          // Show Message and Follow/Following buttons if it's someone else's profile
          <div className="absolute right-0 top-10 flex space-x-3 mr-2">
            <button
              onClick={handleMessage}
              className="bg-gray-200 text-gray-800 py-1 px-4 rounded-full hover:bg-gray-300"
            >
              <FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />
            </button>
            <button
              onClick={handleFollow}
              className={`${
                isFollowing
                  ? "bg-gray-200 text-black"
                  : "bg-black text-white"
              } py-1 px-4 rounded-full hover:${
                isFollowing ? "bg-gray-300" : "bg-black"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}

        {/* Full Name and Username */}
        <div className="mt-[-60px] ml-2">
          <h1 className="font-bold text-lg">{profile?.fullName}</h1>
          <p className="text-gray-500">@{profile?.username}</p>
        </div>

        {/* Description */}
        {profile?.description && (
          <p className="my-2 mx-2">{profile.description}</p>
        )}

        {/* Created At */}
        <p className="text-gray-500 ml-2 flex items-center mt-2">
          <FontAwesomeIcon icon={faCalendarDay} className="w-4 h-4 mr-1" />
          Joined: {new Date(profile?.createdAt).toLocaleDateString('en-GB')}
        </p>

        {/* Follower and Following Count */}
        <div className="flex gap-5 mt-4 ml-2">
          <span>
            <strong>{profile?.follower?.length || 0}</strong> Followers
          </span>
          <span>
            <strong>{profile?.following?.length || 0}</strong> Following
          </span>
        </div>
      </div>
      <ProfileSetting
            isOpen={isEditPopupOpen}
            onClose={handleCloseEditProfile}
            profile={profileToEdit}      
      />
    </div>
  );
};

export default Profile;
