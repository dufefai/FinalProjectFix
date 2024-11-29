import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faLocation } from '@fortawesome/free-solid-svg-icons';
import StoreLocation from './StoreLocation';
import { IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import axiosJWT from "../../config/axiosJWT";
import { createStore } from "../../redux/apiRequest";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";
import { useSelector, useDispatch } from 'react-redux';

const CreateStore = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [address, setAddress] = useState('');
  const [newAddress, setNewAddress] = useState(null);
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('20:00'); 
  const imageInputRef = useRef(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [selectedClassifications, setSelectedClassifications] = useState([]);
  const [otherClassification, setOtherClassification] = useState("");
  const classificationsOptions = [
    "Bữa sáng",
    "Bữa trưa",
    "Bữa tối",
    "Đồ ăn",
    "Đồ uống",
    "Đồ chay",
    "Bánh kem",
    "Tráng miệng",
    "Gà",
    "Pizza/Burger",
    "Món lẩu",
    "Sushi",
    "Mì phở",
    "Cơm",
    "Other"
  ];

  const dispatch = useDispatch();

  const handleClassificationChange = (classification) => {
    if (selectedClassifications.includes(classification)) {
      setSelectedClassifications(
        selectedClassifications.filter((item) => item !== classification)
      );
      if (classification === "Other") {
        setOtherClassification("");
      }
    } else {
      setSelectedClassifications([...selectedClassifications, classification]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const uploadImageToFirebase = async (file) => {
    const storage = getStorage(app);
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleLocationSelect = (newAddress) => {
    setAddress(newAddress.address);
    setNewAddress(newAddress)
    setShowLocationPicker(false);
  };

  const isFormValid = name.trim() !== "" && description.trim() !== "" && address.trim() !== "" && image;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = image;
    if (imageFile) {
      imageUrl = await uploadImageToFirebase(imageFile);
    }
    let updatedClassifications = [...selectedClassifications];
    if (otherClassification.trim() !== "") {
      updatedClassifications = [
        ...updatedClassifications,
        ...otherClassification.split(",").map((item) => item.trim())
      ];
    }

    const storeData = {
      name,
      description,
      image: imageUrl,
      address,
      lat: newAddress?.lat,
      long: newAddress?.long,
      openingTime,
      closingTime,
      classifications: updatedClassifications,
    };
    await createStore(user?.accessToken, dispatch ,storeData, axiosJWT);
  };

  return (
    <div>
      <form className="relative w-full px-4 py-3" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="relative mb-5">
          <input
            type="text"
            id="name"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          <label
            htmlFor="name"
            className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
              name ? ' -translate-y-[18px] text-xs bg-white px-1' : ''
            }`}
          >
            Name
          </label>
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
              description ? 'text-xs -translate-y-[18px] bg-white px-1' : ''
            }`}
          >
            Description
          </label>
        </div>

        {/* Address */}
        <div className="relative mb-5">
          <input
            type="text"
            id="address"
            placeholder=" "
            readOnly
            value={address}
            className="block w-full pl-4 pr-10 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          <label
            htmlFor="address"
            className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
              address ? 'text-xs -translate-y-[18px] bg-white px-1' : ''
            }`}
          >
            Address
          </label>
          <FontAwesomeIcon
            icon={faLocation}
            title='Select location'
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => setShowLocationPicker(true)} 
          />
        </div>

        {showLocationPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg relative">
              <IconButton
                aria-label="close"
                onClick={() => setShowLocationPicker(false)}
                style={{ position: "absolute", right: 8, top: 8 }}
                title="Close"
              >
                <CloseIcon />
              </IconButton>
              <div className="h-[500px] w-[600px] mt-8">
                <StoreLocation onSelectLocation={handleLocationSelect} />
              </div>
            </div>
          </div>
        )}

        {/* Opening Time */}
        <div className="relative mb-5">
          <label className="mb-2 block text-lg">Opening Time</label>
          <input
            type="time"
            id="openingTime"
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
            required
            className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        {/* Closing Time */}
        <div className="relative mb-5">
          <label className="mb-2 block text-lg">Closing Time</label>
          <input
            type="time"
            id="closingTime"
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            required
            className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        
        {/* Classifications */}
        <div className="relative mb-5">
          <label className="mb-5">Classifications</label>
          <div className="grid grid-cols-3 gap-4">
            {classificationsOptions.map((classification, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`classification-${index}`}
                  value={classification}
                  checked={selectedClassifications.includes(classification)}
                  onChange={() => handleClassificationChange(classification)}
                  className="mr-2 mt-1"
                />
                <label htmlFor={`classification-${index}`}>
                  {classification}
                </label>
              </div>
            ))}
          </div>
          {selectedClassifications.includes("Other") && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Each classifications is separated by commas"
                  value={otherClassification}
                  onChange={(e) => setOtherClassification(e.target.value)}
                  className="block w-full px-4 py-2 text-lg bg-white border-b border-gray-300 outline-none"
                />
              </div>
            )}
        </div>

        <div className="flex justify-end mb-5 mr-3">
          <FontAwesomeIcon
            icon={faCamera}
            className="text-gray-500 text-2xl cursor-pointer"
            onClick={() => imageInputRef.current.click()}
          />
          <input
            type="file"
            ref={imageInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {image && (
          <div className="relative mb-5">
            <label className="mb-1">Image</label>
            <img src={image} alt="Selected" className="w-full h-64 object-cover rounded-md" />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-5">
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md transition duration-300 ${
              !isFormValid ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
            }`}
            disabled={!isFormValid}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStore;
