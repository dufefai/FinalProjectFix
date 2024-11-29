import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../../redux/cartSlice';
import SideBar from '../sidebar/SideBar';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart?.cart);
  const userAddress = useSelector((state) => state.address?.address?.currentAddress?.location?.coordinates);
  const storeAddress = useSelector((state) => state.market?.store?.currentStore?.address?.location?.coordinates);
  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const store = useSelector((state) => state.market?.store.currentStore);

  const [deliveryFee, setDeliveryFee] = useState(15000);
  const [distance, setDistance] = useState(0);
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    const calculateDistance = async () => {
      if (userAddress && storeAddress) {
        try {
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${storeAddress[0]},${storeAddress[1]};${userAddress[0]},${userAddress[1]}`,
            {
              params: {
                access_token: accessToken,
                geometries: 'geojson',
              },
            }
          );

          const distanceInMeters = response.data.routes[0].distance; 
          const distanceInKilometers = distanceInMeters / 1000;
          setDistance(distanceInKilometers.toFixed(2));

          if (distanceInKilometers <= 3) {
            setDeliveryFee(15000); 
          } else {
            const extraKilometers = distanceInKilometers - 3;
            const extraFee = Math.ceil(extraKilometers) * 5000;
            setDeliveryFee(15000 + extraFee);
          }
        } catch (error) {
          console.error("Error fetching directions from Mapbox:", error);
        }
      }
    };

    calculateDistance();

    const checkStoreOpen = () => {
      if (store?.openingTime && store?.closingTime) {
        const currentTime = new Date();
        const openingTime = new Date();
        const closingTime = new Date();

        const [openHour, openMinute] = store.openingTime.split(":");
        const [closeHour, closeMinute] = store.closingTime.split(":");

        openingTime.setHours(openHour, openMinute);
        closingTime.setHours(closeHour, closeMinute);

        setStoreOpen(currentTime >= openingTime && currentTime <= closingTime);
      }
    };

    checkStoreOpen();
  }, [userAddress, storeAddress, accessToken, store]);

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    navigate('/checkout', {
      state: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        deliveryFee,
        totalPayment: cart.totalPrice + deliveryFee,
      },
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[73%] p-4 flex flex-col md:flex-row">
        {cart.totalQuantity > 0 ? (
          <>
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 ml-1 p-3"
                aria-label="Back"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
              </button>
  
              {!storeOpen && (
                <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 flex items-center">
                  <p>Sorry, the store is currently closed.</p>
                </div>
              )}
              <div className='flex justify-between'>
                <h1 className="text-2xl font-bold mb-4">My Cart</h1>
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove All
                </button>
              </div>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-white shadow-lg p-4 rounded-md flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">{item.name}</h2>
                      <p className="text-gray-600 pt-1">Price: {(item.price * item.quantity).toLocaleString()}đ</p>
                      <div className="mt-2 flex items-center">
                        <button
                          className={`px-[14px] py-1 border rounded-full text-lg ${
                            item.quantity === 1 ? 'text-gray-300 border-gray-300' : 'text-black border-black'
                          }`}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity === 1}
                        >
                          -
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          className={`px-3 py-1 border rounded-full text-lg ${
                            cart.totalQuantity === 999 ? 'text-gray-300 border-gray-300' : 'text-black border-black'
                          }`}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={cart.totalQuantity === 999}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Section */}
            <div className="w-full md:w-[300px] h-[300px] bg-white shadow-lg rounded-md p-4 mt-4 md:ml-4 md:mt-0 sticky top-1/4">
              <h2 className="text-lg font-bold mb-4">{cart.totalQuantity} Items</h2>
              <div className="flex justify-between mb-4">
                <span>Total Order</span>
                <span>{cart.totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Delivery Fee ({distance} km)</span>
                <span>{deliveryFee.toLocaleString()}đ</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-xl">
                <span>Total Payment</span>
                <span>{(cart.totalPrice + deliveryFee).toLocaleString()}đ</span>
              </div>
              <button
                onClick={handleCheckout}
                className={`w-full text-lg font-bold py-2 mt-4 rounded ${
                  storeOpen ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!storeOpen}
              >
                Checkout
              </button>
            </div>
          </>
        ) : (
          <div className=" w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 ml-1 p-3"
              aria-label="Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <img src="https://media0.giphy.com/media/PhZ4hE8XVEoOkWA4db/giphy.gif?cid=6c09b9528s72us8nv6kwwno2qxqeyuarslsxnnczagmoaa2f&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s" alt="Cart is empty" className="w-64 h-64" />
              <h2 className="text-xl font-bold mt-4">Your cart is empty!</h2>
              <p className="text-gray-600">Add items to your cart and place order here.</p>
              <div onClick={() => navigate("/market")} className="text-blue-500 mt-2 cursor-pointer">Continue browsing</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
