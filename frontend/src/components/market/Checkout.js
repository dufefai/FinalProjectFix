import React, { useEffect, useState } from "react";
import SideBar from "../sidebar/SideBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { clearCart } from '../../redux/cartSlice';
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import axiosJWT from "../../config/axiosJWT";
import { createOrder } from "../../redux/apiRequest";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalPrice, deliveryFee, totalPayment } = location.state || {};

  const userAddress = useSelector(
    (state) => state.address?.address?.currentAddress?.address
  );
  const storeAddress = useSelector(
    (state) => state.market?.store?.currentStore?.address?.address
  );
  const storeName = useSelector(
    (state) => state.market?.store?.currentStore?.name
  );

  const user = useSelector((state) => state.auth.login?.currentUser);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [errors, setErrors] = useState({});
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFailedMessage, setShowFailedMessage] = useState(false);

  useEffect(() => {
    if (
      !location.state ||
      !items ||
      !totalPrice ||
      !deliveryFee ||
      !totalPayment
    ) {
      navigate("/cart");
    } else {
      console.log(items);
    }
  }, [items, totalPrice, deliveryFee, totalPayment, navigate, location.state]);

  const checkErrors = () => {
    let formErrors = {};
    if (!fullName) formErrors.fullName = "Full name is required.";
    if (!phoneNumber) formErrors.phone = "Phone number is required.";
    if (!email) formErrors.email = "Email is required.";
    setErrors(formErrors);

    return Object.keys(formErrors).length === 0;
  };

  useEffect(() => {
    if (checkErrors()) {
      setShowPaymentMethod(true);
    } else {
      setShowPaymentMethod(false);
    }
    // eslint-disable-next-line
  }, [fullName, phoneNumber, email]);

  const style = { layout: "vertical" };

  const convertVNDToUSD = (amountInVND) => {
    const exchangeRate = 24800;
    return (amountInVND / exchangeRate).toFixed(2);
  };

  const ButtonWrapper = ({ showSpinner }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    return (
      <>
        {showSpinner && isPending && <div className="spinner" />}
        <PayPalButtons
          style={style}
          disabled={false}
          forceReRender={[style]}
          fundingSource={undefined}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: convertVNDToUSD(totalPrice + deliveryFee),
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              const newOrder = {
                store: items[0].store,
                items: items,
                totalPrice: totalPrice + deliveryFee,
                fullName: fullName,
                phoneNumber: phoneNumber,
                email: email,
                address: userAddress,
                isPaid: true,
              };
              createOrder(user?.accessToken, dispatch, newOrder, axiosJWT);
              setShowSuccessMessage(true);
              dispatch(clearCart());
              setTimeout(() => {
                navigate("/myorder");
              }, 3000);
            });
          }}
          onError={() => {
            const newOrder = {
              store: items[0].store,
              items: items,
              totalPrice: totalPrice + deliveryFee,
              fullName: fullName,
              phoneNumber: phoneNumber,
              email: email,
              address: userAddress,
              isPaid: false,
            };
            createOrder(user?.accessToken, dispatch, newOrder, axiosJWT);
            setShowFailedMessage(true);
              dispatch(clearCart());
              setTimeout(() => {
                navigate("/myorder");
              }, 3000);
          }}
        />
      </>
    );
  };

  return (
    <div className="flex min-h-screen relative">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[73%] p-4 flex flex-col md:flex-row">
        <div className="bg-white shadow-lg p-4 rounded-md w-[70%]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 p-3"
            aria-label="Back"
            >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Delivery From:</h2>
          <p className="font-semibold">{storeName}</p>
          <p>{storeAddress}</p>
          <h2 className="text-xl font-bold mt-4">Delivery To:</h2>
          <p>{userAddress}</p>

          {/* Additional Details */}
          <div className="mt-6">
            <h2 className="text-xl font-bold">Add Details:</h2>
            <div className="mt-4">
              <label className="block">Full Name*</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full border-b-2 ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                } outline-none focus:border-black`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName}</p>
              )}
            </div>
            <div className="mt-4">
              <label className="block">Phone Number*</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full border-b-2 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } outline-none focus:border-black appearance-none`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>
            <div className="mt-4">
              <label className="block">Email*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border-b-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } outline-none focus:border-black`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          {showPaymentMethod && (
            <div className="mt-6">
              <h2 className="text-xl font-bold">Payment Method</h2>
              <div className="mt-4 flex items-center">
                <PayPalScriptProvider
                  options={{
                    clientId:
                      "AUugVb4vKKpbZeyv71Lvf_cU6OGxWYYXHO2mY9tX_GdVCwpiH7I5etrhUAQ7F8E38jArcRi-_8qNmeij",
                    components: "buttons",
                    currency: "USD",
                  }}
                >
                  <ButtonWrapper showSpinner={false} />
                </PayPalScriptProvider>
              </div>
            </div>
          )}

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md">
              Order placed successfully!
            </div>
          )}

          {showFailedMessage && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md">
              Order Failed!
            </div>
          )}
        </div>

        {/* ORDER SUMMARY */}
        <div className="w-full md:w-[300px] max-h-[400px] overflow-auto bg-white shadow-lg rounded-md p-4 mt-4 md:ml-4 md:mt-0 sticky top-1/4">
          <h2 className="text-lg font-bold mb-4">Order Summary:</h2>
          {items?.map((item) => (
            <div
              key={item._id}
              className="flex justify-between mb-2 font-semibold"
            >
              <span>
                {item.quantity} x {item.name}
              </span>
              <span>{(item.price * item.quantity).toLocaleString()}đ</span>
            </div>
          ))}
          <div className="border-t pt-4 flex justify-between mb-4">
            <span>Total Order</span>
            <span>{totalPrice?.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Delivery Fee</span>
            <span>{deliveryFee?.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between font-bold text-xl">
            <span>Total Payment</span>
            <span>{(totalPrice + deliveryFee)?.toLocaleString()}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
