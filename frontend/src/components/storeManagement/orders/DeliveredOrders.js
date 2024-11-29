import React, { useEffect } from "react";
import { getStoreDeliveredOrders } from "../../../redux/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import axiosJWT from "../../../config/axiosJWT";
import { useNavigate } from "react-router-dom";

const DeliveredOrders = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const orders = useSelector((state) => state.order?.order.allOrders);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      getStoreDeliveredOrders(user?.accessToken, dispatch, axiosJWT);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  }, [user, dispatch]);

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center mt-10">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1079/1079176.png"
          alt="No Orders"
          className="mx-auto w-40 h-40"
        />
        <p className="text-lg font-semibold mt-4">
          It seems you don't have orders
        </p>
        <p className="text-sm text-gray-600">
          You will see the orders here!
        </p>
      </div>
    );
  }

  return (
    <div>
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white p-4 rounded-lg border-2 border-grat-500 mb-4 cursor-pointer"
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
            <p className="text-md text-gray-700">
              <span className="font-semibold">To:</span> {order.fullName}
            </p>
            <p className="text-md text-gray-700">
              <span className="font-semibold">Phone Number:</span>{" "}
              {order.phoneNumber}
            </p>
            <p className="text-md text-gray-700">
              <span className="font-semibold">Address:</span> {order.address}
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
                  className={`border px-4 py-1 rounded-lg 
      ${
        order.sellerConfirmed
          ? "border-gray-400 text-green-400"
          : "border-gray-400 text-yellow-500"
      }`}
                >
                  {order.sellerConfirmed ? "Completed" : "Not Confirmed"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveredOrders;
