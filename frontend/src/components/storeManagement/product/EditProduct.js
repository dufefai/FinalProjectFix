import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { editProduct } from "../../../redux/apiRequest"; // Assuming you have this function
import axiosJWT from "../../../config/axiosJWT";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebase";

const EditProduct = ({ product, onSaveSuccess }) => {
  const categories = useSelector((state) => state.store?.category?.allCategories);
  const initialCategory = categories.find(c => c._id === product.category);
  const user = useSelector((state) => state.auth?.login.currentUser);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price.toString());
  const [category, setCategory] = useState(initialCategory);
  const [image, setImage] = useState(product.image);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef(null);
  const descriptionRef = useRef(null);
  const dispatch = useDispatch();

  const isFormValid = name.trim() !== "" && description.trim() !== "" && price.trim() !== "" && category && image;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = image;
    if (imageFile) {
      imageUrl = await uploadImageToFirebase(imageFile);
    }
    const updatedProduct = {
      name,
      description,
      price: parseFloat(price.replace(/,/g, '')),
      image: imageUrl,
      category: category._id
    };

    await editProduct(user?.accessToken, dispatch, updatedProduct, product._id, axiosJWT);
    if (onSaveSuccess) {
      onSaveSuccess();
    }
    setLoading(false);
  };

  const formatPrice = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat().format(value);
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(rawValue)) {
      setPrice(rawValue);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    descriptionRef.current.style.height = 'auto';
    descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px';
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
            className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${name ? ' -translate-y-[18px] text-xs bg-white px-1' : ''}`}
          >
            Name
          </label>
        </div>

        {/* Description */}
        <div className="relative mb-5">
          <textarea
            id="description"
            ref={descriptionRef}
            placeholder=" "
            value={description}
            onChange={handleDescriptionChange}
            className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none overflow-hidden"
            rows={1}
          />
          <label
            htmlFor="description"
            className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${description ? 'text-xs -translate-y-[18px] bg-white px-1' : ''}`}
          >
            Description
          </label>
        </div>

        {/* Price Input */}
        <div className="relative mb-5 flex items-center">
          <div className="flex-grow">
            <input
              type="text"
              id="price"
              placeholder=" "
              value={formatPrice(price)}
              onChange={handlePriceChange}
              required
              className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="price"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${price ? 'text-xs -translate-y-[18px] bg-white px-1' : ''}`}
            >
              Price
            </label>
          </div>
          <span className="ml-2 text-lg">VND</span>
        </div>

        {/* Category Selection */}
        <div className="relative mb-5">
          <select
            value={category._id}
            onChange={(e) => setCategory(categories.find(c => c._id === e.target.value))}
            required
            className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div className="flex justify-end items-center mb-5 mr-3">
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
            <img src={image} alt="Selected" className="w-full h-64 object-contain rounded-md" />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-5">
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md transition duration-300 ${!isFormValid || loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
            disabled={!isFormValid || loading}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
