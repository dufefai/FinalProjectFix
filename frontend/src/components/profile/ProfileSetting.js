import React, { useState, useEffect, useRef } from "react";
import { IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { editProfile } from "../../redux/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import axiosJWT from "../../config/axiosJWT";

const ProfileSetting = ({ isOpen, onClose, profile }) => {
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  const [background, setBackground] = useState(profile?.background || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [nameError, setNameError] = useState(false);

  const avatarInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setDescription(profile.description || "");
      setBirthDay(
        profile.birthDay
          ? new Date(profile.birthDay).toISOString().split("T")[0]
          : ""
      );
      setPhoneNumber(profile.phoneNumber || "");
      setAvatar(profile.avatar || "");
      setBackground(profile.background || "");
    }
  }, [profile]);

  useEffect(() => {
    if (fullName.trim() === "") {
      setNameError(true);
    } else {
      setNameError(false);
    }
  }, [fullName]);

  const uploadImageToFirebase = async (file) => {
    const storage = getStorage(app);
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundFile(file);
      const imageUrl = URL.createObjectURL(file);
      setBackground(imageUrl);
    }
  };

  const handleSave = async () => {
    if (fullName.trim() === "") {
      setNameError(true);
    } else {
      setNameError(false);

      let avatarUrl = avatar;
      let backgroundUrl = background;

      if (avatarFile) {
        avatarUrl = await uploadImageToFirebase(avatarFile);
      }

      if (backgroundFile) {
        backgroundUrl = await uploadImageToFirebase(backgroundFile);
      }

      const updatedProfile = {
        avatar: avatarUrl,
        background: backgroundUrl,
        fullName,
        description,
        birthDay,
        phoneNumber,
      };
      await editProfile(
        user?.accessToken,
        dispatch,
        profile._id,
        updatedProfile,
        axiosJWT
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white pt-12 rounded-lg max-w-lg w-full relative max-h-[600px] overflow-y-auto">
        <div className="font-semibold top-3 left-2 absolute">Edit profile</div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: "absolute", right: 8, top: 8 }}
          title="Close"
        >
          <CloseIcon />
        </IconButton>

        {/* Background */}
        <div
          className="w-full h-40 bg-cover bg-center cursor-pointer relative"
          style={{
            backgroundImage: `url(${
              background ||
              "https://png.pngtree.com/thumb_back/fh260/background/20210207/pngtree-simple-gray-solid-color-background-image_557027.jpg"
            })`,
          }}
          onClick={() => backgroundInputRef.current.click()}
        >
          <input
            type="file"
            ref={backgroundInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleBackgroundChange}
          />
          <FontAwesomeIcon
            icon={faCamera}
            className="text-gray-200 text-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        {/* Avatar */}
        <div className="profile-info-container p-5 relative">
          <div className="relative">
            <img
              src={
                avatar ||
                "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
              }
              alt="Profile Avatar"
              className="w-28 h-28 rounded-full border-4 border-white relative -top-20 cursor-pointer"
              onClick={() => avatarInputRef.current.click()}
            />
            <FontAwesomeIcon
              icon={faCamera}
              onClick={() => avatarInputRef.current.click()}
              className="text-gray-200 text-xl absolute -top-[20px] left-[58px] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            />
            <input
              type="file"
              ref={avatarInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <form className="relative w-full px-4 py-3 -top-12">
          {/* Full Name */}
          <div className="relative mb-5">
            <input
              type="text"
              id="fullName"
              placeholder=" "
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={`block w-full px-4 py-2 text-lg bg-white border rounded-md focus:outline-none transition-all duration-200 ${
                nameError ? "border-red-500" : "border-gray-300 focus:ring-2 focus:ring-blue-500"
              }`}
            />
            <label
              htmlFor="fullName"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
                fullName ? "text-xs -translate-y-[18px] bg-white px-1" : ""
              }`}
            >
              Name
            </label>
            {nameError && (
              <p className="text-red-500 text-sm">Name can’t be blank</p>
            )}
          </div>

          {/* Description */}
          <div className="relative mb-5">
            <input
              type="text"
              id="description"
              placeholder=" "
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="description"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
                description ? "text-xs -translate-y-[18px] bg-white px-1" : ""
              }`}
            >
              Description
            </label>
          </div>

          {/* Birth Day */}
          <div className="relative mb-5">
            <input
              type="date"
              id="birthDay"
              placeholder=" "
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="birthDay"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
                birthDay ? "text-xs -translate-y-[18px] bg-white px-1" : "hidden"
              }`}
            >
              Birth Day
            </label>
          </div>

          {/* Phone Number */}
          <div className="relative mb-5">
            <input
              type="text"
              id="phoneNumber"
              placeholder=" "
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="phoneNumber"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
                phoneNumber ? "text-xs -translate-y-[18px] bg-white px-1" : ""
              }`}
            >
              Phone Number
            </label>
          </div>
        </form>

        <div className="flex justify-end p-4 -mt-20">
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            className={`${
              fullName.trim() === ""
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-medium rounded-full px-4 py-2 transition duration-200 ease-in-out`}
            disabled={fullName.trim() === ""}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;
