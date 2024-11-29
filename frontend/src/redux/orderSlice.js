import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
    name: "order",
    initialState: {
        order: {
            allOrders: [],
            isFetching: false,
            error: false,
        }
    },
    reducers: {
        getOrderStart: (state) => {
            state.order.isFetching = true;
            state.order.allOrders = [];
        },
        getOrderSuccess: (state, action) => {
            state.order.isFetching = false;
            state.order.allOrders = action.payload;
            state.order.error = false;
        },
        getOrderFailed: (state) => {
            state.order.isFetching = false;
            state.order.error = true;
        },
        cancelOrderStart: (state) => {
            state.order.isFetching = true;
        },
        cancelOrderSuccess: (state, action) => {
            state.order.isFetching = false;
            state.order.allOrders = state.order.allOrders.filter((order) => order._id !== action.payload);
            state.order.error = false;
        },
        rateOrdersStart: (state) => {
            state.order.isFetching = true;
        },
        rateOrdersSuccess: (state, action) => {
            state.order.isFetching = false;
            state.order.allOrders = state.order.allOrders.map((order) => order._id === action.payload._id ? action.payload : order);
            state.order.error = false;
        },
        createOrderStart: (state) => {
            state.order.isFetching = true;
        },
        createOrderSuccess: (state, action) => {
            state.order.isFetching = false;
            state.order.allOrders = [
                action.payload,
                ...state.order.allOrders,
            ];
            state.order.error = false;
        },
        createOrderFailed: (state) => {
            state.order.isFetching = false;
            state.order.error = true;
        },
        getOrderDetailsStart: (state) => {
            state.order.isFetching = true;
            state.order.allOrders = [];
        },
        getOrderDetailsSuccess: (state, action) => {
            state.order.isFetching = false;
            state.order.allOrders[0] = action.payload;
            state.order.error = false;
        },
        getOrderDetailsFailed: (state) => {
            state.order.isFetching = false;
            state.order.error = true;
        },
    }
});

export const {getOrderDetailsStart, getOrderDetailsSuccess, getOrderDetailsFailed, rateOrdersStart, rateOrdersSuccess, cancelOrderStart, cancelOrderSuccess, createOrderStart, createOrderSuccess, createOrderFailed, getOrderStart, getOrderSuccess, getOrderFailed } = orderSlice.actions;

export default orderSlice.reducer;