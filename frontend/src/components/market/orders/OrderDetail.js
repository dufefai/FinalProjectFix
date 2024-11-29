import React, { useEffect, useState, useRef } from "react";
import {
  getOrderDetails,
  cancelOrder,
  rate,
  confirmOrder,
} from "../../../redux/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import axiosJWT from "../../../config/axiosJWT";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../sidebar/SideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { CircularProgress, Button } from "@mui/material";
import { FaStar } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { app } from "../../../firebase";

const OrderDetail = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const order = useSelector((state) => state.order?.order.allOrders[0]);
  const id = useParams().id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef(null);

  const fetchOrderDetails = async () => {
    try {
      await getOrderDetails(user?.accessToken, dispatch, id, axiosJWT);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line
  }, [user, dispatch, id]);

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(user?.accessToken, dispatch, order._id, axiosJWT);
      await fetchOrderDetails();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const handleConfirmReceived = async () => {
    try {
      await confirmOrder(user?.accessToken, dispatch, order._id, axiosJWT);
      await fetchOrderDetails();
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

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
        order: order._id,
        store: order.store._id,
        images: imageUrls,
      };
      await rate(user?.accessToken, dispatch, newRate, axiosJWT);
      await fetchOrderDetails();
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

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="p-4 md:pl-[87px] w-full">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 p-3"
            aria-label="Back"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
          </button>
          <div className="font-semibold text-lg ml-2">Order Details</div>
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : !order ? (
          <div className="flex justify-center items-center h-full">
            No order found.
          </div>
        ) : (
          /* Order Information */
          <div className="max-w-7xl mx-auto px-6 pb-6">
            <div className="flex flex-col justify-between mb-4">
              {/* From Section */}
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-2">•</span>
                <div>
                  <div>From</div>
                  <div
                    className="font-bold cursor-pointer inline-block"
                    onClick={() => navigate(`/restaurant/${order?.store._id}`)}
                  >
                    {order?.store.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order?.store.address?.address}
                  </div>
                </div>
              </div>
              {/* To Section */}
              <div className="flex items-start mt-4 md:mt-0">
                <span className="text-green-500 text-xl mr-2">•</span>
                <div>
                  <div>To</div>
                  <div className="text-sm font-bold text-gray-600">
                    {order?.address}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order?.fullName} - {order?.phoneNumber}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <div className="font-bold mb-2">Order Details</div>
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center mb-2 border-b pb-2"
                >
                  <div className="w-12 h-12 mr-2">
                    <img
                      alt={item.name}
                      src={item.image}
                      className="w-full h-full object-cover"
                      width="48"
                      height="48"
                    />
                  </div>
                  <div className="flex-1">
                    <div>
                      {item.quantity} x{" "}
                      <span className="font-bold">{item.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.price.toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <div className="font-bold">
                  Total ({order.items.length} items)
                </div>
                <div className="font-bold">
                  {(order
                    ? order?.items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                    : 0
                  ).toLocaleString()}
                  đ
                </div>
              </div>
              <div className="flex justify-between mb-2">
                <div>Shipping Fee</div>
                <div>
                  {(order
                    ? order?.totalPrice -
                      (order
                        ? order?.items.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                        : 0)
                    : 0
                  ).toLocaleString()}
                  đ
                </div>
              </div>
              <div className="flex justify-between mb-2">
                <div>Discount</div>
                <div>0đ</div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-bold">Final Total</div>
                <div className="font-bold">
                  {order.totalPrice.toLocaleString()}đ
                </div>
              </div>
            </div>

            {/* Payment and Status Information */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div>Payment Method</div>
                <div>{order.paymentMethod}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>Order Time</div>
                <div>
                  {new Date(order.createdAt).toLocaleDateString()}{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div>Status</div>
                <div>{order.status}</div>
              </div>
            </div>

            {/* Conditional Buttons */}
            {user._id === order.user && (
              <div className="mt-6 flex justify-end space-x-2">
                {order.status === "pending" && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </Button>
                )}
                {order.status === "delivered" && !order.sellerConfirmed && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleConfirmReceived}
                  >
                    Confirm Received
                  </Button>
                )}
                {order.status === "delivered" && order.sellerConfirmed && (
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => {
                      if (!order.reviewed) {
                        setSelectedOrder(order);
                        setRating(0);
                        setComment("");
                      }
                    }}
                    disabled={order.reviewed}
                  >
                    {order.reviewed ? "Completed" : "Rate"}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
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
                onClick={() => setComment("Not Satisfied")}
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

export default OrderDetail;
