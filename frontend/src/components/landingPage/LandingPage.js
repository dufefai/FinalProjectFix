import React, { useState, useEffect } from "react";
import logo from "../../resources/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faGoogle } from "@fortawesome/free-brands-svg-icons";
import Register from "../auth/Register";
import Login from "../auth/Login";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../../redux/authSlice";
import { GoogleAuthProvider, TwitterAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../../firebase";

const LandingPage = () => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);

  const handleOpenPopup = () => {
    setPopupOpen(true);
  };
  const handleClosePopup = () => {
    setPopupOpen(false);
  };

  const handleOpenRegister = () => {
    setRegisterOpen(true);
  };
  const handleCloseRegister = () => {
    setRegisterOpen(false);
  };

  const handleSwitchToLogin = () => {
    setRegisterOpen(false);
    setPopupOpen(true);
  };



  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if(user)
      navigate("/home");
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/auth/googleLogin`,
        {
          withCredentials: true,
        },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: result.user.displayName,
            email: result.user.email,
            photo: result.user.photoURL,
          }),
        }
      );
      const data = await res.json();
      dispatch(loginSuccess(data));
      navigate("/home");
    } catch (error) {
      console.log("could not login with google", error);
    }
  };

  const handleTwitterLogin = async () => {
    try {
      const provider = new TwitterAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(user);
    } catch (error) {
      console.log("could not login with twitter", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen box-border">
      <div className="w-full md:w-[50%] h-full flex items-center justify-center ml-5 md:ml-[200px]">
        <img
          src={logo}
          alt="1 con vjt"
          className="w-[60%] max-w-xs md:max-w-none"
        />
      </div>
      <div className="w-full md:w-[50%] h-full md:mr-[150px]">
        <div className="text-[250%] mt-[100px] flex items-center justify-center">
          <b>Welcome to Food Media</b>
        </div>
        <button
          type="button"
          onClick={handleOpenRegister}
          className=" w-full rounded-full post-button bg-blue-700 text-center text-xl text-cyan-50 mt-7 hover:opacity-95 p-2"
        >
          Create account
        </button>
        <Register
          isOpen={isRegisterOpen}
          onClose={handleCloseRegister}
          onSwitchToLogin={handleSwitchToLogin}
        />
        <div className="flex items-center w-full mt-7 px-10">
          <div className="flex-grow border-t border-gray-300"></div>
          <div className="px-4">Or continue with</div>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="flex mt-7 space-x-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="rounded-full w-full md:w-[50%] bg-gray-500 text-center text-sm md:text-lg text-cyan-50 hover:bg-red-500 p-2"
          >
            <FontAwesomeIcon icon={faGoogle} className="inline mr-2" />
            Google
          </button>
          <button
            type="button"
            onClick={handleTwitterLogin}
            className="rounded-full w-full md:w-[50%] bg-gray-500 text-center text-sm md:text-lg text-cyan-50 hover:bg-black p-2"
          >
            <FontAwesomeIcon icon={faXTwitter} className="inline mr-2" />
          </button>
        </div>
        <div className="flex items-center justify-center w-full mt-7">
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="mt-10 mb-5 text-xl">
        Already have an account?
        </div>
        <button
          type="button"
          onClick={handleOpenPopup}
          className=" w-full rounded-full post-button bg-gray-700 text-center text-xl text-cyan-50 hover:opacity-95 p-2"
        >
          Login
        </button>
        <Login isOpen={isPopupOpen} onClose={handleClosePopup} />
      </div>
    </div>
  );
};

export default LandingPage;
