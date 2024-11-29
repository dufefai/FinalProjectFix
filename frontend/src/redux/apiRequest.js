import axios from "axios";
import {
  loginFailed,
  loginStart,
  loginSuccess,
  registerFailed,
  registerStart,
  registerSuccess,
  logoutStart,
  logoutSuccess,
  logoutFailed,
  editSuccess,
  followingUser,
} from "./authSlice";
import {
  likePostStart,
  likePostSuccess,
  likePostFailed,
  rePostStart,
  rePostSuccess,
  rePostFailed,
  replyPostStart,
  replyPostSuccess,
  replyPostFailed,
  viewPostStart,
  viewPostFailed,
  viewPostSuccess,
  editPostStart,
  editPostFailed,
  editPostSuccess,
  deletePostStart,
  deletePostFailed,
  deletePostSuccess,
  getNewsFailed,
  getNewsStart,
  getNewsSuccess,
  postStart,
  postSuccess,
  postFailed,
  getProfilePostStart,
  getProfilePostFailed,
  getProfilePostSuccess,
} from "./postSlice";
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailed,
  getUserStart,
  getUserSuccess,
  getUserFailed,
  followUser,
} from "./userSlice";

import {updateAddressStart, updateAddressSuccess, updateAddressFailed, getAddressStart, getAddressSuccess, getAddressFailed} from "./addressSlice"

import {  
  enableProductStart,
  enableProductSuccess,
  enableProductFailed,
  createCategoryStart,
  createCategorySuccess,
  createCategoryFailed,
  editCategoryStart,
  editCategorySuccess,
  editCategoryFailed,
  deleteCategoryStart,
  deleteCategorySuccess,
  deleteCategoryFailed,
  getCategoriesStart,
  getCategoriesSuccess,
  getCategoriesFailed,
  createProductStart,
  createProductSuccess,
  createProductFailed,
  editProductStart,
  editProductSuccess,
  editProductFailed,
  deleteProductStart,
  deleteProductSuccess,
  deleteProductFailed, getStoreStart, getStoreSuccess, getStoreFailed, createStoreStart, createStoreSuccess, createStoreFailed } from "./storeSlice";

import { confirmStoreSuccess, getStoreRequestSuccess, getCommentsStart, getCommentsSuccess, getCommentsFailed, getMarketStart, getMarketSuccess, getMarketFailed, getStoreDetailStart, getStoreDetailSuccess, getStoreDetailFailed, getProductStart, getProductSuccess, getProductFailed } from "./marketSlice";

import {getOrderDetailsStart, getOrderDetailsSuccess, getOrderDetailsFailed, rateOrdersStart, rateOrdersSuccess, cancelOrderStart, cancelOrderSuccess, createOrderStart, createOrderSuccess, createOrderFailed, getOrderStart, getOrderSuccess, getOrderFailed} from "./orderSlice";

import {    readNotificationStart,
  readNotificationSuccess,
  readNotificationFailed, getNotificationStart, getNotificationSuccess, getNotificationFailed , viewNotificationStart, viewNotificationSuccess, viewNotificationFailed, } from "./notiSlice";

  import {   getConversationStart,
    getConversationSuccess,
    getConversationFailed, } from "./messageSlice";
export const loginUser = async (user, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/api/auth/login`,
      user,
      {
        withCredentials: true,
      }
    );
    dispatch(loginSuccess(res.data));
    navigate("/home");
    return { success: true };
  } catch (error) {
    let errorMessage = "Login failed, try again.";
    dispatch(loginFailed());
    if (error.response && error.response.data) {
      errorMessage = error.response.data;
    }
    return { success: false, message: errorMessage };
  }
};

export const registerUser = async (user, dispatch) => {
  dispatch(registerStart());
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/api/auth/register`,
      user
    );
    dispatch(registerSuccess());
    return { success: true, data: res.data };
  } catch (error) {
    let errorMessage = "Registration failed, try again.";
    if (error.response && error.response.data) {
      errorMessage = error.response.data;
    }
    dispatch(registerFailed());
    return { success: false, message: errorMessage };
  }
};

export const logoutUser = async (accessToken, dispatch, navigate, id, axiosJWT) => {
  dispatch(logoutStart());
  try {
    await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/auth/logout`,
      id,
      {
        withCredentials: true,
      },
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(logoutSuccess());
    navigate("/");
  } catch (error) {
    console.log(error);
    dispatch(logoutFailed());
  }
};

export const getNews = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getNewsStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/post/news`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getNewsSuccess(res.data));
  } catch (error) {
    dispatch(getNewsFailed());
  }
};

export const post = async (accessToken, dispatch, post, axiosJWT) => {
  dispatch(postStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/post/post`,
      post,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(postSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(postFailed());
  }
};

export const getProfilePost = async (
  accessToken,
  dispatch,
  username,
  axiosJWT
) => {
  dispatch(getProfilePostStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/post/${username}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getProfilePostSuccess(res.data));
  } catch (error) {
    dispatch(getProfilePostFailed());
  }
};

export const deletePost = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(deletePostStart());
  try {
    await axiosJWT.delete(
      `${process.env.REACT_APP_BACKEND_API}/api/post/delete/${id}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(deletePostSuccess(id));
  } catch (error) {
    console.log(error);
    dispatch(deletePostFailed());
  }
};

export const editPost = async (accessToken, dispatch, id, post, axiosJWT) => {
  dispatch(editPostStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/post/edit/${id}`,
      post,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(editPostSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(editPostFailed());
  }
};

export const viewPost = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(viewPostStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/post/view/${id}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(viewPostSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(viewPostFailed());
  }
};

export const reply = async (accessToken, dispatch, id, reply, axiosJWT) => {
  dispatch(replyPostStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/post/comment/${id}`,
      reply,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(replyPostSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(replyPostFailed());
  }
};

export const rePost = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(rePostStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/post/repost/${id}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(rePostSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(rePostFailed());
  }
};

export const likePost = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(likePostStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/post/like/${id}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(likePostSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(likePostFailed());
  }
};

export const getProfile = async (accessToken, dispatch, username, axiosJWT) => {
  dispatch(getUserStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/user/view/${username}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getUserSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(getUserFailed());
  }
};

export const editProfile = async (
  accessToken,
  dispatch,
  id,
  profile,
  axiosJWT
) => {
  dispatch(updateProfileStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/user/update/${id}`,
      profile,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(updateProfileSuccess(res.data));
    dispatch(editSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(updateProfileFailed());
  }
};

export const getAddress = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getAddressStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/user/address`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getAddressSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(getAddressFailed());
  }
}

export const updateAddress = async (accessToken, dispatch, address, axiosJWT) => {
  dispatch(updateAddressStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/user/changeAddress`,
      address,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(updateAddressSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(updateAddressFailed());
  }
}

export const createStore = async (
  accessToken,
  dispatch,
  store,
  axiosJWT
) => {
  dispatch(createStoreStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/store/create`,
      store,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(createStoreSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(createStoreFailed());
  }
};

export const getStore = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getStoreStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/store/getStore`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getStoreSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(getStoreFailed());
  }
};

export const createCategory = async (
  accessToken,
  dispatch,
  category,
  axiosJWT
) => {
  dispatch(createCategoryStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/store/createCategory`,
      category,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(createCategorySuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(createCategoryFailed());
  }
};

export const editCategory = async (
  accessToken,
  dispatch,
  category,
  id,
  axiosJWT
) => {
  dispatch(editCategoryStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/store/editCategory/${id}`,
      category,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(editCategorySuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(editCategoryFailed());
  }
};

export const deleteCategory = async (
  accessToken,
  dispatch,
  id,
  axiosJWT
) => {
  dispatch(deleteCategoryStart());
  try {
    await axiosJWT.delete(
      `${process.env.REACT_APP_BACKEND_API}/api/store/deleteCategory/${id}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(deleteCategorySuccess(id));
  } catch (error) {
    console.log(error);
    dispatch(deleteCategoryFailed());
  }
};

export const getCategories = async (
  accessToken,
  dispatch,
  axiosJWT
) => {
  dispatch(getCategoriesStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/store/getCategories`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getCategoriesSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(getCategoriesFailed());
  }
};

export const createProduct = async (
  accessToken,
  dispatch,
  product,
  axiosJWT
) => {
  dispatch(createProductStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/store/createProduct`,
      product,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(createProductSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(createProductFailed());
  }
};

export const editProduct = async (
  accessToken,
  dispatch,
  product,
  id,
  axiosJWT
) => {
  dispatch(editProductStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/store/editProduct/${id}`,
      product,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(editProductSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(editProductFailed());
  }
};

export const enableProduct = async (
  accessToken,
  dispatch,
  id,
  axiosJWT
) => {
  dispatch(enableProductStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/store/enableProduct/${id}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(enableProductSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(enableProductFailed());
  }
};

export const deleteProduct = async (
  accessToken,
  dispatch,
  id,
  axiosJWT
) => {
  dispatch(deleteProductStart());
  try {
    await axiosJWT.delete(
      `${process.env.REACT_APP_BACKEND_API}/api/store/deleteProduct/${id}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(deleteProductSuccess(id));
  } catch (error) {
    console.log(error);
    dispatch(deleteProductFailed());
  }
};

export const getMarket = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getMarketStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/market/getStore`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getMarketSuccess(res.data));
  } catch (error) {
    dispatch(getMarketFailed());
  }
};

export const getStoreDetail = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(getStoreDetailStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/market/getStoreDetail/${id}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getStoreDetailSuccess(res.data));
  } catch (error) {
    dispatch(getStoreDetailFailed());
  }
};

export const getProduct = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(getProductStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/market/getProductDetail/${id}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getProductSuccess(res.data));
  } catch (error) {
    dispatch(getProductFailed());
  }
};

export const getPendingOrders = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getOrderStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/order/getPendingOrders`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const getShippedOrders = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getOrderStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/order/getShippedOrders`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const getDeliveredOrders = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getOrderStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/order/getDeliveredOrders`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const getCancelledOrders = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getOrderStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/order/getCancelledOrders`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const cancelOrder = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(cancelOrderStart());
  try {
    await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/order/cancel/${id}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(cancelOrderSuccess(id));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const confirmOrder = async (accessToken, dispatch, id, axiosJWT) => {
  try {
    await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/order/confirm/${id}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(cancelOrderSuccess(id));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const rate = async (accessToken, dispatch, review, axiosJWT) => {
  dispatch(rateOrdersStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/market/review`,
      review,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(rateOrdersSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const createOrder = async (accessToken, dispatch, order, axiosJWT) => {
  dispatch(createOrderStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/order/createOrder`,
      order,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(createOrderSuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(createOrderFailed());
  }
}

export const getStorePendingOrders = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getOrderStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/store/getPendingOrders`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const getStoreShippedOrders = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getOrderStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/store/getShippedOrders`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const getStoreDeliveredOrders = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getOrderStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/store/getDeliveredOrders`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const getStoreCancelledOrders = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getOrderStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/store/getCancelledOrders`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderSuccess(res.data));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const changeStatus = async (accessToken, dispatch, id, status, axiosJWT) => {
  try {
    await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/order/changeStatus/${id}`,
      status,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(cancelOrderSuccess(id));
  } catch (error) {
    dispatch(getOrderFailed());
  }
};

export const getOrderDetails = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(getOrderDetailsStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/order/getOrder/${id}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getOrderDetailsSuccess(res.data));
  } catch (error) {
    dispatch(getOrderDetailsFailed());
  }
};

export const getCommnetsStore = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(getCommentsStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/market/getReview/${id}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getCommentsSuccess(res.data));
  } catch (error) {
    dispatch(getCommentsFailed());
  }
};

export const getNotifications = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getNotificationStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/post/getNotifications`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getNotificationSuccess(res.data));
  } catch (error) {
    dispatch(getNotificationFailed());
  }
};

export const viewNotification = async (accessToken, dispatch, id, axiosJWT) => {
  dispatch(viewNotificationStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/post/viewNotification/${id}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(viewNotificationSuccess(res.data));
  } catch (error) {
    dispatch(viewNotificationFailed());
  }
}

export const readNotification = async (accessToken, dispatch, axiosJWT) => {
  dispatch(readNotificationStart());
  try {
    await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/post/readNotification`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(readNotificationSuccess());
  } catch (error) {
    dispatch(readNotificationFailed());
  }
}

export const changePassword = async (accessToken, password, axiosJWT) => {
  try {
    await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/user/changePassword`,
      password,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    return { success: true, message: "Change password successfully" };
  } catch (error) {
    let errorMessage = "Change password failed, try again.";
    if (error.response && error.response.data) {
      errorMessage = error.response.data;
    }
    return { success: false, message: errorMessage };
  }
}

export const getConversations = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getConversationStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/message/getConversations`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getConversationSuccess(res.data));
  } catch (error) {
    dispatch(getConversationFailed());
  }
};

export const follow = async (accessToken, dispatch, id, axiosJWT) => {
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/user/follow/${id}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(followUser(res.data));
    dispatch(followingUser(res.data));
  } catch (error) {
    console.log(error);
  }
};

export const getStoreRequest = async (accessToken, dispatch, axiosJWT) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_BACKEND_API}/api/store/confirmationStore`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getStoreRequestSuccess(res.data));
  } catch (error) {
    console.log(error);
  }
};

export const confirmStoreRequest = async (accessToken, dispatch, id, axiosJWT) => {
  try {
    await axiosJWT.post(
      `${process.env.REACT_APP_BACKEND_API}/api/store/verifyStore/${id}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(confirmStoreSuccess(id));
  } catch (error) {
    console.log(error);
  }
};












