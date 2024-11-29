import React, { useEffect, useState, useRef } from "react";
import { getDeliveredOrders, rate } from "../../../redux/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import axiosJWT from "../../../config/axiosJWT";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { app } from "../../../firebase";

const DeliveredOrders = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const orders = useSelector((state) => state.order?.order.allOrders);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState([]); // New state for selected images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      getDeliveredOrders(user?.accessToken, dispatch, axiosJWT);
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
    }
  }, [user, dispatch]);

  const handleRate = async () => {
    try {
      const uploadPromises = selectedImages.map(async (image) => {
        const storage = getStorage(app);
        const storageRef = ref(
          storage,
          `images/${user?.username}/${Date.now()}`
        );
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      });
      const imageUrls = await Promise.all(uploadPromises);

      const newRate = {
        rate: rating,
        comment: comment,
        order: selectedOrder._id,
        store: selectedOrder.store._id,
        image: imageUrls,
      };
      await rate(user?.accessToken, dispatch, newRate, axiosJWT);
      setSelectedOrder(null);
      setSelectedImages([]);
    } catch (error) {
      console.error("Error rating order:", error);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
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

  const handleIconClick = () => {
    fileInputRef.current.click();
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

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center mt-10">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1079/1079176.png"
          alt="No Orders"
          className="mx-auto w-40 h-40"
        />
        <p className="text-lg font-semibold mt-4">
          It seems you haven’t ordered anything yet
        </p>
        <p className="text-sm text-gray-600">
          You will see the items you're currently ordering here!
        </p>
      </div>
    );
  }

  return (
    <div>
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white p-4 rounded-lg border-2 border-gray-500 mb-4 cursor-pointer"
          onClick={() => navigate(`/order/${order._id}`)}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex justify-between items-center w-full">
              <p className="text-gray-500 text-sm">Order #{order._id}</p>
              <p className="text-gray-400 text-xs">
                {new Date(order.updatedAt).toLocaleDateString()}{" "}
                {new Date(order.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="mb-2">
            <p
              className="font-bold text-lg cursor-pointer inline-block"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/restaurant/${order.store._id}`);
              }}
            >
              {order.store.name}
            </p>
          </div>
          <div className="flex justify-between mb-2">
            <div className="flex">
              {order.items.slice(0, 8).map((item, index) => (
                <div className="mr-2" key={index}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rounded-lg object-cover h-[100px] w-[100px]"
                  />
                  <p className="text-sm text-gray-600 truncate max-w-[100px]">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-right mt-5">
              <p className="font-bold">{order.totalPrice.toLocaleString()}đ</p>
              <p className="text-gray-500">
                {order.items.reduce((total, item) => total + item.quantity, 0)}{" "}
                items
              </p>
            </div>
          </div>
          <div className="border border-gray-300 my-3"></div>
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">{order.status}</p>
            <div className="flex space-x-2">
              {order.status === "delivered" && (
                <button
                  className={`border px-4 py-1 rounded-lg ${
                    order.reviewed
                      ? "border-gray-400 text-green-400"
                      : "border-red-500 text-red-500 hover:bg-red-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!order.reviewed) {
                      setSelectedOrder(order);
                      setRating(0);
                      setComment("");
                    }
                  }}
                  disabled={order.reviewed}
                >
                  {order.reviewed ? "Completed" : "Rate"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Rate Your Order</h2>

            <div className="flex mb-4">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <FaStar
                    key={index}
                    size={30}
                    className={`cursor-pointer ${
                      ratingValue <= rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleStarClick(ratingValue)}
                  />
                );
              })}
            </div>

            <textarea
              className="border-b w-full p-2 mb-4 outline-none"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex space-x-4 mb-4">
              <button
                className="bg-gray-200 text-black text-xs px-1 py-1 rounded-md hover:bg-gray-300"
                onClick={() => setComment("Satisfied")}
              >
                Satisfied
              </button>
              <button
                className="bg-gray-200 text-black text-xs px-1 py-1 rounded-md hover:bg-gray-300"
                onClick={() =>
                  setComment("Not Satisfied")
                }
              >
                Not Satisfied
              </button>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
                multiple
              />
              <button
                onClick={handleIconClick}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Upload Image
              </button>
            </div>

            {selectedImages.length > 0 && (
              <div className="my-2 relative mr-2">
                <img
                  src={selectedImages[currentImageIndex]}
                  alt={`Selected ${currentImageIndex + 1}`}
                  className="w-full h-40 object-contain rounded-lg"
                />
                {selectedImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 text-gray-500 py-[2px] px-2 rounded-full"
                    >
                      {"<"}
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 text-gray-500 py-[2px] px-2 rounded-full"
                    >
                      {">"}
                    </button>
                  </>
                )}
                <button
                  onClick={handleDeleteImage}
                  className="absolute top-0 right-0 -translate-y-5 mt-2 mr-2 hover:bg-gray-400 px-4 py-2 rounded-full bg-gray-200 text-gray-700"
                >
                  X
                </button>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                onClick={handleRate}
                disabled={rating === 0}
              >
                Submit
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveredOrders;
