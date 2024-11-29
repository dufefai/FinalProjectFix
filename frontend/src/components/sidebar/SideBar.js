import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import {
  getNews,
  logoutUser,
  getNotifications,
  readNotification,
  getConversations,
  post
} from "../../redux/apiRequest";
import axiosJWT from "../../config/axiosJWT";
import {
  faHouse,
  faSearch,
  faBell,
  faEnvelope,
  faStore,
  faShop,
  faUsers,
  faCrown,
  faUser,
  faCog,
  faSignOut,
  faFileImage,
  faClose, 
  faChevronLeft,
  faChevronRight,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import logo from "../../resources/logo.png";
import io from "socket.io-client";
import { getMessageSuccess, addTemporaryConversation } from "../../redux/messageSlice";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { app } from "../../firebase";

const socket = io.connect("http://localhost:8000");

const SideBar = () => {
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newOrder, setNewOrder] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const notifications = useSelector(
    (state) => state.notification.notification.notifications
  );
  const conversations = useSelector(
    (state) => state.message.message.conversations
  );

  const user = useSelector((state) => state.auth.login.currentUser);
  const store = useSelector((state) => state.store.store.currentStore);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const currentPath = location.pathname.split("/")[1];

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, dispatch, navigate]); // eslint-disable-line 

  useEffect(() => {
    if (user?._id) {
      socket.emit("join_room", user._id);
    }
  }, [user]);

  

  useEffect(() => {
    const handleReceiveConversation = (data) => {
      dispatch(addTemporaryConversation({
        conversationId: data.conversationId,
        message: data.lastMessage,
        isRead: false,
        lastReceiver: data.receiver,
        partnerName: data.receiverName,
        partnerAvatar: data.receiverAvatar,
        partnerUsername: data.receiverUsername,
        partnerId: data.receiver,
        currentUserId: data.sender,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        senderUsername: data.senderUsername,
      }));
    };
  
    const handleReceiveMessage = (data) => {
      dispatch(getMessageSuccess({
        conversationId: data.conversationId,
        message: data.message,
        isRead: false,
        lastReceiver: data.receiverId,
      }));
    };
  
    socket.on("receive_conversation", handleReceiveConversation);
    socket.on("receive_message", handleReceiveMessage);
  
    return () => {
      socket.off("receive_conversation", handleReceiveConversation);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [dispatch]);

  const handleLogout = () => {
    logoutUser(user?.accessToken, dispatch, navigate, user._id, axiosJWT);
  };

  const handleLinkClick = (path) => {
    if (path === "communities" || path === "premium") {
      setPopupMessage("This feature is currently unavailable.");
      setPopupOpen(true);
    } else {
      navigate(`/${path}`);
    }
  };

  const handleReadNotification = async () => {
    await getNotifications(user?.accessToken, dispatch, axiosJWT);
    readNotification(user?.accessToken, dispatch, axiosJWT);
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    const imagePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    const images = await Promise.all(imagePromises);
    setSelectedImages([...selectedImages, ...images]);
    setCurrentImageIndex(0);
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

  const handleInputChange = (e) => {
    setModalText(e.target.value);
  };

  const handlePostSubmit = async () => {
    if (!modalText.trim() && selectedImages.length === 0) return;

    const storage = getStorage(app);
    const uploadPromises = selectedImages.map(async (image) => {
      const storageRef = ref(storage, `images/${user.username}/${Date.now()}`);
      const response = await fetch(image);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    });

    const imageUrls = await Promise.all(uploadPromises);
    const newPost = {
      content: modalText,
      image: imageUrls,
    };

    await post(user.accessToken, dispatch, newPost, axiosJWT);

    setModalText("");
    setSelectedImages([]);
    setOpen(false);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosJWT.get(
          `${process.env.REACT_APP_BACKEND_API}/api/store/getPendingOrders`,
          {
            headers: { token: `Bearer ${user?.accessToken}` },
          }
        );
        setNewOrder(res.data.length);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
      }
    };

    if (user) {
      if(store){fetchOrders();}
      getNotifications(user?.accessToken, dispatch, axiosJWT);
      getConversations(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, store]); // eslint-disable-line

  return (
    <div className="fixed flex flex-col w-[90px] xl:w-[400px] h-screen border-r p-4 xl:pl-[150px] z-50">
      {/* Logo */}
      <Link to="/home" className="navbar-logo flex items-right xl:pl-4">
        <img
          src={logo}
          alt="Home"
          className={`w-[50px] h-[50px] transition-none mb-5 hover:bg-gray-200 rounded-full ${
            currentPath === "home" ? "font-bold" : ""
          }`}
        />
      </Link>

      <Link
        to="/home"
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === "home" ? "font-bold" : ""
        }`}
        onDoubleClick={() => getNews(user?.accessToken, dispatch, axiosJWT)}
      >
        <span
          className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === "home" ? "font-bold" : ""
          }`}
        >
          <FontAwesomeIcon icon={faHouse} className="xl:w-10 xl:mr-3" />
          <span className="hidden xl:inline">Home</span>
        </span>
      </Link>

      <Link
        to="/explore"
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === "explore" ? "font-bold" : ""
        }`}
      >
        <span
          className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === "explore" ? "font-bold" : ""
          }`}
        >
          <FontAwesomeIcon icon={faSearch} className="xl:w-10 xl:mr-3" />
          <span className="hidden xl:inline">Explore</span>
        </span>
      </Link>

      <Link
        to="/notifications"
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === "notifications" ? "font-bold" : ""
        }`}
        onClick={() => handleReadNotification()}
      >
        <span
          className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === "notifications" ? "font-bold" : ""
          }`}
        >
          <div className="relative">
            <FontAwesomeIcon icon={faBell} className="xl:w-10 xl:mr-3" />
            {notifications.filter((notification) => notification.read === false)
              .length > 0 && (
              <span className="absolute -top-2 right-2 bg-blue-500 border border-white text-white font-semibold text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {
                  notifications.filter(
                    (notification) => notification.read === false
                  ).length
                }
              </span>
            )}
          </div>
          <span className="hidden xl:inline">Notifications</span>
        </span>
      </Link>

      <Link
        to="/messages"
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === "messages" ? "font-bold" : ""
        }`}
      >
        <span
          className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === "messages" ? "font-bold" : ""
          }`}
        >
          <div className="relative">
            <FontAwesomeIcon icon={faEnvelope} className="xl:w-10 xl:mr-3" />
            {conversations.filter(
              (conversation) =>
                conversation.isRead === false &&
                conversation.lastReceiver === user._id
            ).length > 0 && (
              <span className="absolute -top-2 right-2 bg-blue-500 border border-white text-white font-semibold text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {
                  conversations.filter(
                    (conversation) =>
                      conversation.isRead === false &&
                      conversation.lastReceiver === user._id
                  ).length
                }
              </span>
            )}
          </div>
          <span className="hidden xl:inline">Messages</span>
        </span>
      </Link>

      <Link
        to="/market"
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === "market" ||
          currentPath === "restaurant" ||
          currentPath === "cart" ||
          currentPath === "checkout" ||
          currentPath === "myorder" ||
          currentPath === "order"
            ? "font-bold"
            : ""
        }`}
      >
        <span
          className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === "market" ||
            currentPath === "restaurant" ||
            currentPath === "cart" ||
            currentPath === "checkout" ||
            currentPath === "myorder" ||
            currentPath === "order"
              ? "font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon icon={faShop} className="xl:w-10 xl:mr-3" />
          <span className="hidden xl:inline">Market</span>
        </span>
      </Link>

      <Link
        to="/store"
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === "store" ? "font-bold" : ""
        }`}
      >
        <span
          className={`relative flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === "store" ? "font-bold" : ""
          }`}
        >
          <div className="relative">
            <FontAwesomeIcon icon={faStore} className="xl:w-10 xl:mr-3" />
            {newOrder > 0 && (
              <span className="absolute -top-2 right-2 bg-blue-500 border border-white text-white font-semibold text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {newOrder}
              </span>
            )}
          </div>
          <span className="hidden xl:inline">Store Owner</span>
        </span>
      </Link>

      {user?.role === "admin" ? (
        <Link
          to="/adminrequest"
          className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
            currentPath === "adminrequest" ? "font-bold" : ""
          }`}
        >
          <span
            className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
              currentPath === "adminrequest" ? "font-bold" : ""
            }`}
          >
            <FontAwesomeIcon icon={faLock} className="xl:w-10 xl:mr-3" />
            <span className="hidden xl:inline">Admin</span>
          </span>
        </Link>
      ) : (
        <Link
          to="/communities"
          className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
            currentPath === "communities" ? "font-bold" : ""
          }`}
        >
          <span
            className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
              currentPath === "communities" ? "font-bold" : ""
            }`}
            onClick={() => handleLinkClick("communities")}
          >
            <FontAwesomeIcon icon={faUsers} className="xl:w-10 xl:mr-3" />
            <span className="hidden xl:inline">Communities</span>
          </span>
        </Link>
      )}

      <Link
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === "premium" ? "font-bold" : ""
        }`}
      >
        <span
          className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === "premium" ? "font-bold" : ""
          }`}
          onClick={() => handleLinkClick("premium")}
        >
          <FontAwesomeIcon icon={faCrown} className="xl:w-10 xl:mr-3" />
          <span className="hidden xl:inline">Premium</span>
        </span>
      </Link>
      <Link
        to={`/${user?.username}`}
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === user?.username ? "font-bold" : ""
        }`}
      >
        <span
          className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === user?.username ? "font-bold" : ""
          }`}
        >
          <FontAwesomeIcon icon={faUser} className="xl:w-10 xl:mr-3" />
          <span className="hidden xl:inline">Profile</span>
        </span>
      </Link>

      <Link
        to="/setting"
        className={`navbar-link flex items-center justify-center xl:justify-start text-lg ${
          currentPath === "setting" ? "font-bold" : ""
        }`}
      >
        <span
          className={`flex items-center justify-center xl:justify-start rounded-full transition-colors p-2 xl:pr-10 xl:hover:bg-gray-200 ${
            currentPath === "setting" ? "font-bold" : ""
          }`}
        >
          <FontAwesomeIcon icon={faCog} className="xl:w-10 xl:mr-3" />
          <span className="hidden xl:inline">Settings</span>
        </span>
      </Link>

      {/* Post Button */}
      <button
        className="rounded-full post-button bg-blue-700 text-center text-xl text-cyan-50 mt-7 hover:bg-blue-800 p-2 w-[50px] xl:w-auto"
        onClick={() => setOpen(true)}
      >
        <span className="xl:inline xl:text-lg text-xs">Post</span>
      </button>

      {/* User Profile */}
      <Link
        to="/"
        className="rounded-full inline-flex items-center justify-start mt-7 hover:bg-gray-200 p-2"
        onClick={handleLogout}
      >
        <div className="mr-3">
          <img
            src={
              user?.avatar ||
              "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
            }
            alt="User Avatar"
            className="hidden xl:flex w-10 h-10 rounded-full object-cover"
          />
        </div>
        <div className="flex-col justify-center hidden xl:flex">
          <div className="font-bold">{user?.fullName}</div>
          <div className="text-gray-500">@{user?.username}</div>
        </div>
        <FontAwesomeIcon
          icon={faSignOut}
          className="justify-center xl:ml-auto"
        />
      </Link>

      {/* Post Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ style: { borderRadius: "20px" } }}
      >
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpen(false);
              setModalText("");
              setSelectedImages([]);
            }}
            style={{ position: "absolute", right: 8, top: 8 }}
            title="Close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <img
          src={
            user?.avatar ||
            "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
          }
          className="rounded-full w-10 h-10 ml-5 mt-4"
          alt="User"
        />
        <DialogContent
          style={{
            padding: "16px 24px",
            overflowY: modalText.length > 100 ? "auto" : "hidden",
          }}
        >
          <TextField
            multiline
            minRows={4}
            value={modalText}
            onChange={handleInputChange}
            placeholder="Write your thoughts..."
            fullWidth
            variant="standard"
            InputProps={{
              disableUnderline: true,
              style: { border: "none" },
            }}
          />
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
        </DialogContent>
        <div
          style={{
            border: "1px solid black",
            width: "90%",
            marginLeft: "20px",
          }}
        ></div>
        <DialogActions>
          <div style={{ width: "90%", marginLeft: "10px" }}>
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
            />
          </div>
          <Button
            onClick={handlePostSubmit}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "20px",
              marginRight: "10px",
              textTransform: "none",
              color: "white",
              "&:hover": {
                backgroundColor: !modalText ? "blue" : "darkblue",
              },
            }}
            disabled={!modalText}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="text-red-600">
          {"Notification"}
        </DialogTitle>
        <DialogContent>
          <p>{popupMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopupOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SideBar;
