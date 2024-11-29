import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { loginSuccess } from "../redux/authSlice"
import {store} from "../redux/store"

const axiosJWT = axios.create();

axiosJWT.interceptors.request.use(
  async (config) => {
    const user = store.getState().auth.login.currentUser;
    if (user?.accessToken) {
      const decodedToken = jwtDecode(user.accessToken);
      if (decodedToken.exp * 1000 < Date.now()) {
        try {
          const res = await axios.post(
            `${process.env.REACT_APP_BACKEND_API}/api/auth/refresh`,
            {},
            {
              withCredentials: true,
            }
          );
          const refreshUser = {
            ...user,
            accessToken: res.data.accessToken,
          };
          if (res.data.accessToken !== user.accessToken) {
            store.dispatch(loginSuccess(refreshUser));
          }
          config.headers["token"] = `Bearer ${res.data.accessToken}`;
        } catch (error) {
          console.error("Error refreshing token: ", error);
          return Promise.reject(error);
        }
      } else {
        config.headers["token"] = `Bearer ${user.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosJWT;
