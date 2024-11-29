import React, { useState } from "react";
import SideBar from "../sidebar/SideBar";
import SidebarRight from "../sidebarRight/SidebarRight";
import { changePassword } from "../../redux/apiRequest";
import axiosJWT from "../../config/axiosJWT";
import { useSelector } from "react-redux";
const ChangePassword = () => {
    const user = useSelector((state) => state.auth.login?.currentUser);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState(null);

  const changeIPassword = async () => {
    try {
      const password = {
        currentPassword,
        newPassword,
        confirmPassword,
      }
        const result = await changePassword(user?.accessToken, password, axiosJWT);
        setMessage(result.message);
    } catch (error) {
      console.error("Error changing password:", error);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[57%] md:w-[39%]">
        <div className="py-6 font-semibold pl-4 text-xl border-b border-gray-300">
          Change Password
        </div>
        <form className="w-full px-4 py-3">
          {/* Full Name */}
          <div className="relative mb-5">
            <input
              type="password"
              id="currentPassword"
              placeholder=" "
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="currentPassword"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
                currentPassword
                  ? "text-xs -translate-y-[18px] bg-white px-1"
                  : ""
              }`}
            >
              Current Password
            </label>
          </div>
          <div className="relative mb-5">
            <input
              type="password"
              id="newPassword"
              placeholder=" "
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="description"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
                newPassword ? "text-xs -translate-y-[18px] bg-white px-1" : ""
              }`}
            >
              New Password
            </label>
          </div>
          <div className="relative mb-5">
            <input
              type="password"
              id="confirmPassword"
              placeholder=" "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="description"
              className={`absolute left-4 top-2 text-gray-500 text-lg transition-all duration-200 pointer-events-none ${
                confirmPassword
                  ? "text-xs -translate-y-[18px] bg-white px-1"
                  : ""
              }`}
            >
              Confirm Password
            </label>
          </div>
          {message && message !== "Change password successfully" && (
              <p className="text-red-500 text-sm">{message}</p>
            )}
            {message && message === "Change password successfully" && (
              <p className="text-green-500 text-sm">{message}</p>
            )}
        </form>
        <div className="flex justify-end p-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={() =>changeIPassword()}
          >
            Save
          </button>
        </div>
      </div>
      <div className="w-[25%] border-l border-gray-300">
        <SidebarRight />
      </div>
    </div>
  );
};

export default ChangePassword;
