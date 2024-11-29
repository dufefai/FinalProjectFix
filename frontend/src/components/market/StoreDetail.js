import React, { useEffect, useState, useRef } from "react";
import SideBar from "../sidebar/SideBar";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, useLocation  } from "react-router-dom";
import { getStoreDetail, getProduct } from "../../redux/apiRequest";
import { addToCart } from "../../redux/cartSlice";
import axiosJWT from "../../config/axiosJWT";
import { IconButton, CircularProgress } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as fullStar,
  faStarHalfAlt as halfStar,
  faCircle,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faShoppingCart,
  faSearch,
  faListAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faStar as emptyStar,
  faClock as faThinClock,
} from "@fortawesome/free-regular-svg-icons";

const StoreDetail = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const store = useSelector((state) => state.market?.store.currentStore);
  const categories = useSelector((state) => state.market?.product.allProducts);
  const cart = useSelector((state) => state.cart?.cart.totalQuantity || 0);
  const [cartMessenger, setCartMessenger] = useState("");

  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);

  const id = useParams().id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const barRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchStore = async () => {
      if (user) {
        setLoading(true);
        await getStoreDetail(user?.accessToken, dispatch, id, axiosJWT);
        await getProduct(user?.accessToken, dispatch, id, axiosJWT);
        setLoading(false);
      }
    };
    fetchStore();
    // eslint-disable-next-line
  }, [user, dispatch, id]);

  useEffect(() => {
    if (categories.length > 0) {
      setFilteredCategories(categories);
    }
  }, [categories]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const productId = queryParams.get("product");
    if (productId) {
      const productElement = document.getElementById(`product-${productId}`);
      if (productElement) {
        productElement.scrollIntoView({ behavior: "smooth" ,block: "center"});
      }
    }
  }, [location, filteredCategories]);

  const handleInputChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories
        .map((category) => {
          const filteredProducts = category.products.filter((product) =>
            product.name.toLowerCase().includes(query)
          );
          return { ...category, products: filteredProducts };
        })
        .filter((category) => category.products.length > 0);

      setFilteredCategories(filtered);
    }
  };

  const renderStars = (rate) => {
    const stars = [];
    const fullStars = Math.floor(rate);
    const halfStars = rate % 1 >= 0.5 ? 1 : 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          icon={fullStar}
          className="text-yellow-500"
          key={`full-${i}`}
        />
      );
    }

    if (halfStars) {
      stars.push(
        <FontAwesomeIcon
          icon={halfStar}
          className="text-yellow-500"
          key="half"
        />
      );
    }

    for (let i = fullStars + halfStars; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon
          icon={emptyStar}
          className="text-yellow-500"
          key={`empty-${i}`}
        />
      );
    }
    return stars;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatPrice = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat().format(value);
  };

  const isOpen = () => {
    if (store?.openingTime && store?.closingTime) {
      const currentTime = new Date();
      const openingTime = new Date();
      const closingTime = new Date();

      const [openHour, openMinute] = store.openingTime.split(":");
      const [closeHour, closeMinute] = store.closingTime.split(":");

      openingTime.setHours(openHour, openMinute);
      closingTime.setHours(closeHour, closeMinute);

      return currentTime >= openingTime && currentTime <= closingTime;
    }
    return false;
  };

  const scrollToCategory = (index) => {
    const categoryElement = document.getElementById(`category-${index}`);
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenPopup = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };
  const handleCloseNotification = () => {
    setCartMessenger("");
  };

  const handleAddToCart = () => {
    if (quantity + cart > 999) {
      setCartMessenger("You can only order up to 999 items at a time.");
      handleClosePopup();
      return;
    }
    dispatch(
      addToCart({
        id: selectedProduct._id,
        name: selectedProduct.name,
        image: selectedProduct.image,
        price: selectedProduct.price,
        store: selectedProduct.store,
        quantity: quantity,
      })
    );
    handleClosePopup();
  };

  const scrollLeft = () => {
    barRef.current.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    barRef.current.scrollBy({ left: 400, behavior: "smooth" });
  };

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
        <div className="w-[73%]">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 ml-1 p-3"
            aria-label="Back"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
          </button>
          <div className="flex flex-col md:flex-row items-start p-4 border-b border-gray-200">
            <div className="md:w-1/2 w-full">
              <img
                src={store?.image}
                alt={store?.name}
                className="w-[450px] h-[300px] object-contain rounded-lg"
              />
            </div>

            <div className="md:w-1/2 w-full md:mt-8">
              <h1 className="text-3xl font-bold mb-2">{store?.name}</h1>
              <p className="text-gray-600 mb-1">{store?.address?.address}</p>
              <p className="text-gray-600 mb-1">
                {renderStars(store?.rate.$numberDecimal)}
                {parseFloat(store?.rate.$numberDecimal) === 0 ? (
                  <span className="ml-2">No rate yet</span>
                ) : (
                  <>
                    <span className="ml-2">{store?.rate.$numberDecimal}</span>
                  </>
                )}
              </p>
              <div
                className="flex items-center mb-1 cursor-pointer"
                onClick={() => navigate(`/restaurant/${id}/reviews`)}
              >
                <p className="text-gray-600 mb-1 mr-2">
                  {store?.reviews?.length || 0} reviews
                </p>
                <span>
                  {" "}
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-sm text-gray-500 -translate-y-[1px] "
                  />
                </span>
              </div>
              <FontAwesomeIcon
                icon={faThinClock}
                className="text-lg text-gray-500 "
              />
              <span className="font-normal pl-3">
                {store?.openingTime} - {store?.closingTime}
              </span>
              <div className="mt-1">
                {isOpen() ? (
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faCircle}
                      className="text-green-500 text-sm"
                    />
                    <span className="text-green-500 ml-2">Opening</span>
                  </div>
                ) : (
                  <div className="flex items-center ">
                    <FontAwesomeIcon
                      icon={faCircle}
                      className="text-red-500 text-sm"
                    />
                    <span className="text-red-500 ml-2">Closed</span>
                  </div>
                )}
                <div className=" border border-gray-300 my-2 w-full"></div>

                <div className="relative w-full">
                  <span
                    className={`absolute left-3 top-1/2 pl-2 transform -translate-y-1/2 ${
                      isFocused ? "text-blue-500" : "text-gray-500"
                    }`}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                  <input
                    type="text"
                    placeholder="Find dishes in this store..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full pl-14 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full p-2 bg-white sticky top-0 z-20 border-b border-gray-300 flex items-center">
            <button
              onClick={scrollLeft}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-6 h-6" />
            </button>
            <div
              ref={barRef}
              className="w-full flex space-x-4 overflow-hidden whitespace-nowrap px-2"
            >
              {categories.map((category, index) => (
                <button
                  key={category._id}
                  onClick={() => scrollToCategory(index)}
                  className="px-4 py-2 border-r border-l text-gray-600 font-medium transform transition-transform duration-300 ease-in-out hover:scale-105"
                >
                  {category.name}
                </button>
              ))}
            </div>
            <button
              onClick={scrollRight}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-6 h-6" />
            </button>
          </div>

          {/* Category Products */}
          {/* Category Products */}
          <div className="space-y-4" ref={containerRef}>
            {loading || !filteredCategories.length ? (
              <p className="text-gray-500 flex items-center justify-center">
                No products found.
              </p>
            ) : (
              filteredCategories.map((category, index) => (
                <div
                  id={`category-${index}`}
                  key={category._id}
                  className="px-4"
                  style={{ scrollMarginTop: "55px" }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">{category.name}</h2>
                  </div>
                  {category.products && category.products.length > 0 ? (
                    <div className="space-y-4">
                      {category.products.map((product) => (
                        <div
                          key={product._id}
                          id={`product-${product._id}`}
                          className={`flex items-start border-b border-gray-300 py-4 ${
                            !product.enable ? "opacity-50" : ""
                          }`}
                        >
                          <div className="w-24 h-24 mr-6 flex-shrink-0 relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                            {!product.enable && (
                              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs italic p-1 rounded-lg transform rotate-12">
                                Sold out
                              </span>
                            )}
                          </div>

                          <div className="flex-grow -translate-y-[6px]">
                            <h3 className="text-lg font-semibold mb-1">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-1">
                              {product.description}
                            </p>
                            <p className="text-gray-500 text-sm mb-1">
                              {product.sold ?? 0} sold
                            </p>
                            <p className="text-lg font-semibold text-red-500">
                              {formatPrice(product.price)}đ
                            </p>
                          </div>

                          <div className="flex items-center justify-center">
                            <button
                              className="text-white text-2xl bg-red-500 hover:bg-red-700 px-2 pb-1 rounded-md"
                              onClick={() => handleOpenPopup(product)}
                              disabled={!product.enable}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No products available for this category.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {showPopup && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                <IconButton
                  aria-label="close"
                  onClick={handleClosePopup}
                  style={{ position: "absolute", right: 560, top: 225 }}
                  title="Close"
                >
                  <CloseIcon />
                </IconButton>
                <div className="space-y-4 flex items-start pt-5 pb-3">
                  <div className="w-24 h-24 mr-6 flex-shrink-0 relative">
                    <img
                      src={selectedProduct?.image}
                      alt={selectedProduct?.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-1 truncate max-w-[230px]">
                      {selectedProduct?.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-1 truncate max-w-[230px]">
                      {selectedProduct?.description}
                    </p>
                    <p className="text-lg font-semibold text-red-500">
                      {formatPrice(selectedProduct?.price)}đ
                    </p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <label className="mr-2">Quantity:</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(Math.max(Number(e.target.value), 1), 999)
                      )
                    }
                    min="1"
                    max="999"
                    className="border p-2 w-full"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={handleAddToCart}
                    className="bg-red-500 text-white px-4 py-2 rounded w-full"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )}

          {cartMessenger ===
            "You can only order up to 999 items at a time." && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                <div className="flex items-center justify-center mb-4">
                  <label className="font-semibold">
                    You can only order up to 999 items at a time.
                  </label>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={handleCloseNotification}
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                  >
                    Understand
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="fixed bottom-4 right-4 z-50">
            <div className="relative flex flex-col space-y-4">
              <button
                onClick={() => navigate("/cart")}
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
    </div>
  );
};

export default StoreDetail;
