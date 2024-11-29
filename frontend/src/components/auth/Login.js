import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import logo from "../../resources/logo.png";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../redux/apiRequest";

const Login = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const isFormValid = () => email.length > 0 && password.length > 0;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const newUser = {
      email: email,
      password: password,
    };
    const result = await loginUser(newUser, dispatch, navigate);
    if(!result.success) {
      setErrorMessage(result.message);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg max-w-sm w-full relative">
        <img src={logo} alt="" className="w-10 h-10 ml-[140px]" />
        <h2 className="text-lg font-bold mb-4 flex justify-center items-center">
          Login to App
        </h2>
        <form onSubmit={handleLogin}>
          <label className="block mb-2">Email or username</label>
          <input
            type="text"
            className="border w-full p-2 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="block mb-2">Password</label>
          <input
            type="password"
            className="border w-full p-2 rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <button
            type="submit"
            className={`w-full p-2 rounded text-white ${
              isFormValid() ? "bg-blue-500 hover:bg-blue-700" : "bg-gray-500"
            }`}
            disabled={!isFormValid()}
          >
            Login
          </button>
        </form>
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: "absolute", right: 8, top: 8 }}
          title="Close"
        >
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default Login;
