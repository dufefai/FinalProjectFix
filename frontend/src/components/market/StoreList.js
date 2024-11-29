// StoreList.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axiosJWT from "../../config/axiosJWT";
import { CircularProgress } from "@mui/material";

const StoreList = ({ searchQuery, userToken, allStores }) => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStores = async (query) => {
    setLoading(true);
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/market/search?text=${query}`,
        { headers: { token: `Bearer ${userToken}` } }
      );
      setStores(res.data);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchStores(searchQuery);
    } else {
      setStores(allStores || []);
    }
    // eslint-disable-next-line
  }, [searchQuery, allStores]);

  const formatDistance = (distance) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    } else {
      return `${distance} m`;
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Recommended for you</h2>
      {loading ? (
        <div className="flex justify-center items-center mt-40">
          <CircularProgress />
        </div>
      ) : stores && stores.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stores.map((store) => (
            <div
              key={store._id}
              onClick={() => navigate(`/restaurant/${store._id}`)}
              className="border rounded-lg p-4 relative transform transition-transform duration-300 ease-in-out hover:scale-105 hover:cursor-pointer"
            >
              <img
                src={store.image}
                alt={store.name}
                className="w-full h-32 object-contain mb-2 rounded-lg "
              />
              <h3 className="font-bold">{store.name}</h3>
              <p className="text-sm text-gray-500">{store.address}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-500 mr-1"
                />
                {store.rate && store.rate.$numberDecimal !== "0" ? (
                  <span className="mr-2">{store.rate.$numberDecimal}</span>
                ) : (
                  <span className="mr-2">No reviews</span>
                )}
                <span className="mx-2">•</span>
                <span>{formatDistance(store.distance)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No restaurants near your place
        </p>
      )}
    </div>
  );
};

export default StoreList;
