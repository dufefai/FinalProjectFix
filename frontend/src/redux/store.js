import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import postReducer from "./postSlice";
import addressReducer from "./addressSlice";
import storeReducer from "./storeSlice";
import marketReducer from "./marketSlice";
import cartReducer from "./cartSlice"
import orderReducer from "./orderSlice"
import notiReducer from "./notiSlice"
import messageReducer from "./messageSlice"
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  post: postReducer,
  address: addressReducer,
  store: storeReducer,
  market: marketReducer,
  cart: cartReducer,
  order: orderReducer,
  notification: notiReducer,
  message: messageReducer,
});
const rootReducer = (state, action) => {
  if (action.type === "auth/logoutSuccess") {
    state = undefined;
  }
  return appReducer(state, action);
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);
