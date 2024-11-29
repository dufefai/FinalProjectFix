import React, { useEffect } from "react";
import SideBar from "../sidebar/SideBar";
import axiosJWT from "../../config/axiosJWT";
import { getStoreRequest, confirmStoreRequest } from "../../redux/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const stores = useSelector((state) => state.market.storeRequest?.allStores || []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "admin") navigate("/home");
    getStoreRequest(user?.accessToken, dispatch, axiosJWT);
  }, [user?.role, user?.accessToken, dispatch, navigate]);

  const handleConfirm = (storeId) => {
    confirmStoreRequest(user?.accessToken, dispatch, storeId, axiosJWT, );
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[93px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-full pl-[100px] pr-4 py-4">
        <h1 className="text-2xl font-bold mb-4">Store Management</h1>
        {stores.length === 0 ? (
          <p className="text-gray-500 flex items-center justify-center">No stores available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-2 border border-gray-300">#</th>
                  <th className="px-4 py-2 border border-gray-300">Name</th>
                  <th className="px-4 py-2 border border-gray-300">Image</th>
                  <th className="px-4 py-2 border border-gray-300">Description</th>
                  <th className="px-4 py-2 border border-gray-300">Owner</th>
                  <th className="px-4 py-2 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store, index) => (
                  <tr
                    key={store._id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-4 py-2 border border-gray-300">{index + 1}</td>
                    <td className="px-4 py-2 border border-gray-300">{store.name}</td>
                    <td className="px-4 py-2 border border-gray-300">
                        <img
                            src={store.image}
                            alt={store.name}
                            className="w-20 h-20 object-cover"
                        />
                    </td>
                    <td className="px-4 py-2 border border-gray-300 max-w-sm ">
                      {store.description}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">{store.owner.fullName}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                        <button
                          onClick={() => handleConfirm(store._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                        >
                          Confirm
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
