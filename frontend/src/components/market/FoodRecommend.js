import React, { useState, useEffect } from "react";
import SideBar from "../sidebar/SideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faSearch,
  faShoppingCart,
  faListAlt,
} from "@fortawesome/free-solid-svg-icons";
import Location from "./Location"; // Import your Location component
import { IconButton, CircularProgress } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosJWT from "../../config/axiosJWT";
import { getAddress, getMarket } from "../../redux/apiRequest";
import StoreList from "./StoreList";

const FoodRecommend = () => {
  const address = useSelector((state) => state.address.address?.currentAddress);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const stores = useSelector((state) => state.market.market?.allStores);
  const cart = useSelector((state) => state.cart?.cart.totalQuantity || 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleChangeAddress = () => {
    setShowMap(true);
  };

  const handleFilterClick = (filter) => {
    setSearchQuery(filter);
  };


  useEffect(() => {
    if (user) {
      setLoading(true);
      getAddress(user?.accessToken, dispatch, axiosJWT).then(() => {
        setLoading(false);
      });
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (address && !searchQuery) {
      getMarket(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, address, dispatch, searchQuery]);

  const closeMap = () => {
    setShowMap(false);
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate("/home");
  };

  useEffect(() => {
    if (!loading) {
      if (!address) {
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    }
  }, [loading, address]);



  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      {loading ? (
        <div className="w-full flex items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="w-full pl-[90px]">
          <div className="p-4">
            {/* Location and Search Bar Container */}
            <div className="flex items-center mb-6 sticky top-0 pb-1 bg-white z-10">
              {/* Location */}
              <div className="border rounded-md p-2 pr-5 flex items-center mr-2">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="md:w-10 md:mt-1 text-red-500 cursor-pointer"
                  title={address?.address}
                />
                <span className="truncate max-w-sm">
                  {address?.address || "No address available"}
                </span>
                <button
                  className="ml-4 underline text-blue-500"
                  onClick={handleChangeAddress}
                >
                  Change
                </button>
              </div>

              <form className="relative w-full">
                <span
                  className={`absolute left-3 top-1/2 pl-2 transform -translate-y-1/2 ${
                    isFocused ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  placeholder="Find places, dishes..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full pl-14 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </form>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setSearchQuery("")}
              >
                All
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Đồ ăn")}
              >
                Đồ ăn
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Đồ uống")}
              >
                Đồ uống
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Đồ chay")}
              >
                Đồ chay
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Bánh kem")}
              >
                Bánh kem
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Tráng miệng")}
              >
                Tráng miệng
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Pizza/Burger")}
              >
                Pizza/Burger
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Món lẩu")}
              >
                Món lẩu
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Sushi")}
              >
                Sushi
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Mì phở")}
              >
                Mì phở
              </button>
              <button
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => handleFilterClick("Cơm")}
              >
                Cơm
              </button>
            </div>
            <div>
            <StoreList searchQuery={searchQuery} userToken={user?.accessToken} allStores={stores} />
            </div>
          </div>
          <div className="fixed bottom-4 right-4 z-50">
            <div className="relative flex flex-col space-y-4">
              <button
                onClick={() => navigate("/cart")}
                title="Cart"
                className="bg-red-500 text-white p-3 rounded-[100%] shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
              >
                <FontAwesomeIcon icon={faShoppingCart} className="w-6 h-5" />
              </button>
              {cart >= 0 && (
                <span className="absolute -top-5 -right-2 bg-yellow-400 text-black font-bold rounded-full h-6 w-6 flex items-center justify-center text-sm">
                  {cart}
                </span>
              )}
              <button
                onClick={() => navigate("/myorder")}
                title="My Orders"
                className="bg-red-500 text-white p-3 rounded-[100%] shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
              >
                <FontAwesomeIcon icon={faListAlt} className="w-6 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg relative">
            <IconButton
              aria-label="close"
              onClick={closeMap}
              style={{ position: "absolute", right: 8, top: 8 }}
              title="Close"
            >
              <CloseIcon />
            </IconButton>
            <div className="h-[500px] w-[600px] mt-8">
              <Location onSaveSuccess={closeMap} />
            </div>
          </div>
        </div>
      )}

      {/* Show popup when no address */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg relative">
            <IconButton
              aria-label="close"
              onClick={closePopup}
              style={{ position: "absolute", right: 8, top: 8 }}
              title="Close"
            >
              <CloseIcon />
            </IconButton>
            <div className="p-4 text-center">
              <h2 className="text-lg font-bold mb-4">No Address Found</h2>
              <p>Please set your address to get better food recommendations.</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => {
                  setShowPopup(false);
                  setShowMap(true);
                }}
              >
                Set Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodRecommend;
