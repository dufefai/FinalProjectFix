import React, { useState, useRef, useEffect } from "react";
import { IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { editPost } from "../../redux/apiRequest";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { app } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosJWT from "../../config/axiosJWT";
import {
  faChevronLeft,
  faChevronRight,
  faClose,
  faFileImage,
  faBold,
  faItalic,
} from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";

const EditForm = ({ isOpen, onClose, post }) => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();

  const [selectedImages, setSelectedImages] = useState(post?.image || []);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEmpty, setIsEmpty] = useState(false);
  const fileInputRef = useRef(null);
  const contentEditableRef = useRef(null);

  // Update state when the post changes (e.g. when editing a new post)
  useEffect(() => {
    if (post?.image) {
      setSelectedImages(post.image);
      setCurrentImageIndex(0);
    }
  }, [post]);

  const handleSaveButton = async () => {
    const uploadPromises = selectedImages.map(async (image) => {
      if (image.startsWith("data:image")) {
        const storage = getStorage(app);
        const storageRef = ref(storage, `images/${user?.username}/${Date.now()}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      } else {
        return image;
      }
    });

    const imageUrls = await Promise.all(uploadPromises);
    const updatedContent = contentEditableRef.current.innerHTML;

    const updatedPost = {
      content: updatedContent,
      image: imageUrls,
    };

    await editPost(user?.accessToken, dispatch, post._id, updatedPost, axiosJWT);
    onClose();
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

  const insertHTMLTag = (tag) => {
    document.execCommand(tag, false, null); // Insert bold/italic HTML tags
  };

  const handleInput = () => {
    const content = contentEditableRef.current.innerHTML;
    setIsEmpty(content.trim() === "" || content.trim() === "<br>");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
      <div className="bg-white p-8 rounded-lg max-w-lg w-full relative max-h-[650px] overflow-y-auto">
      <div className="font-semibold top-3 left-2 absolute">Edit post</div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: "absolute", right: 8, top: 8 }}
          title="Close"
        >
          <CloseIcon />
        </IconButton>

        <div className="flex items-center mb-4 mt-3">
          <img
            src={
              post.author?.avatar
                ? post.author?.avatar
                : `https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg`
            }
            alt={post.author?.fullName}
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <div className="flex flex-col">
              <div className="flex items-top">
                <h2 className="font-bold mr-2">{post.author?.fullName}</h2>
                <p className="text-gray-500">@{post.author?.username}</p>
              </div>
              <div className="text-gray-500 text-sm">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={contentEditableRef}
          contentEditable
          className="w-full p-2 rounded-md mb-2 overflow-y-auto"
          onInput={handleInput}
          style={{
            minHeight: "20px",
            outline: "none",
            wordWrap: "break-word",
          }}
          dangerouslySetInnerHTML={{ __html: post?.content }}
        />

        {selectedImages.length > 0 && (
          <div className="mt-2 relative">
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

        <div className="flex justify-between items-center mt-4">
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
              onClick={() => fileInputRef.current.click()}
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
            onClick={handleSaveButton}
            disabled={isEmpty}
            className={`${
              isEmpty ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
            } text-white font-medium rounded-full px-4 py-2 transition duration-200 ease-in-out`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditForm;
