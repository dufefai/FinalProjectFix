import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import logo from "../../resources/logo.png";
import { useDispatch } from "react-redux";
import { registerUser } from "../../redux/apiRequest";

const Register = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isFormValid = () => {
    return (
      email.length > 0 &&
      password.length > 0 &&
      confirmPassword === password &&
      passwordErrors.length === 0
    );
  };

  const dispatch = useDispatch();

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPasswordErrors([]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const errors = [];

    if (value.length < 6) {
      errors.push("Must be longer than 5 characters");
    }
    if (!/[A-Z]/.test(value)) {
      errors.push("Must include at least one uppercase letter");
    }
    if (!/[0-9]/.test(value)) {
      errors.push("Must include at least one number");
    }
    if (!/[\W_]/.test(value)) {
      errors.push("Must include at least one special character");
    }

    setPasswordErrors(errors);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newUser = {
      username,
      email,
      password,
    };
    console.log(newUser)
    const result = await registerUser(newUser, dispatch);
    if (result.success) {
      setSuccessMessage("Registration successful!");
      setErrorMessage(null);
    } else {
      setErrorMessage(result.message);
      setSuccessMessage(null);
    }
  };

  const handleLoginRedirect = () => {
    resetForm();
    onClose();
    onSwitchToLogin();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg max-w-sm w-full relative">
        <img src={logo} alt="" className="w-10 h-10 ml-[140px]" />
        <h2 className="text-lg font-bold mb-4 flex justify-center items-center">Create Account</h2>
        <form onSubmit={handleRegister}>
          <label className="block mb-2">Username</label>
          <input
            type="text"
            className="border w-full p-2 rounded mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label className="block mb-2">Email</label>
          <input
            type="email"
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
            onChange={handlePasswordChange}
            required
          />
          {passwordErrors.length > 0 && (
            <ul className="text-red-500 text-sm mb-4">
              {passwordErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
          <label className="block mb-2">Confirm Password</label>
          <input
            type="password"
            className="border w-full p-2 rounded mb-4"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {password !== confirmPassword && (
            <p className="text-red-500 text-sm mb-4">Passwords do not match</p>
          )}
          {successMessage && (
            <div className="text-green-500 text-sm mb-4">
              {successMessage}{" "}
              <button onClick={handleLoginRedirect} className="text-blue-500 underline">
                Login
              </button>
            </div>
          )}
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
            Register
          </button>
        </form>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          style={{ position: "absolute", right: 8, top: 8 }}
          title="Close"
        >
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default Register;
