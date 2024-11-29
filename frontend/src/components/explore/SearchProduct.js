import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosJWT from "../../config/axiosJWT";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SearchProduct = ({ query }) => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getSearchResult = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/search?text=${query}`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (user?.accessToken && query) {
        setLoading(true);
        await getSearchResult(user.accessToken);
        setLoading(false);
      } else {
        setProducts([]);
      }
    };

    fetchProducts();

    return () => {
      setProducts([]);
      setLoading(false);
    };
    // eslint-disable-next-line
  }, [user, query]);

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center items-center mt-40">
          <CircularProgress />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg overflow-hidden shadow-sm cursor-pointer"
                onClick={() => navigate(`/restaurant/${product.store}?product=${product._id}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="font-bold text-lg truncate">{product.name}</h2>
                  <p className="text-gray-600">Price: {product.price} VND</p>
                  <p className="text-gray-600">Sold: {product.sold}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-4 text-gray-500">
              No products found for "{query}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchProduct;
