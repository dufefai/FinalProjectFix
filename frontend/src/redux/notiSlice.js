import { createSlice } from "@reduxjs/toolkit";

const notiSlice = createSlice({
    name: "notification",
    initialState: {
        notification: {
            notifications: [],
            isFetching: false,
            error: false,
        }
    },
    reducers: {
        getNotificationStart: (state) => {
            state.notification.isFetching = true;
            state.notification.error = false;
        },
        getNotificationSuccess: (state, action) => {
            state.notification.notifications = action.payload;
            state.notification.isFetching = false;
            state.notification.error = false;
        },
        getNotificationFailed: (state) => {
            state.notification.isFetching = false;
            state.notification.error = true;
        },
        viewNotificationStart: (state) => {
            state.notification.isFetching = true;
            state.notification.error = false;
        },
        viewNotificationSuccess: (state, action) => {
            state.notification.notifications = state.notification.notifications.map((notification) => notification._id === action.payload._id ? action.payload : notification);
            state.notification.isFetching = false;
            state.notification.error = false;
        },
        viewNotificationFailed: (state) => {
            state.notification.isFetching = false;
            state.notification.error = true;
        },
        readNotificationStart: (state) => {
            state.notification.isFetching = true;
            state.notification.error = false;
        },
        readNotificationSuccess: (state) => {
            state.notification.notifications = state.notification.notifications.map((notification) => ({
                ...notification,
                read: true
              }));              
            state.notification.isFetching = false;
            state.notification.error = false;
        },
        readNotificationFailed: (state) => {
            state.notification.isFetching = false;
            state.notification.error = true;
        },
    },
});

export const {
    getNotificationStart,
    getNotificationSuccess,
    getNotificationFailed,
    viewNotificationStart,
    viewNotificationSuccess,
    viewNotificationFailed,
    readNotificationStart,
    readNotificationSuccess,
    readNotificationFailed,
} = notiSlice.actions;

export default notiSlice.reducer;