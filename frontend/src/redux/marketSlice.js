import { createSlice } from "@reduxjs/toolkit";

const marketSlice = createSlice({
    name: "market",
    initialState: {
        market: {
            allStores: [],
            isFetching: false,
            error: false,
        },
        store: {
            currentStore: null,
            isFetching: false,
            error: false,
        },
        product: {
            allProducts: [],
            isFetching: false,
            error: false,
        },
        comments: {
            allComments: [],
            isFetching: false,
            error: false,
        },
        storeRequest :{
            allStores: [],
            isFetching: false,
            error: false,
        }

    },
    reducers: {
        getMarketStart: (state) => {
            state.market.isFetching = true;
            state.market.allStores = [];
        },
        getMarketSuccess: (state, action) => {
            state.market.isFetching = false;
            state.market.allStores = action.payload;
            state.market.error = false;
        },
        getMarketFailed: (state) => {
            state.market.isFetching = false;
            state.market.error = true;
        },
        getStoreDetailStart: (state) => {
            state.store.isFetching = true;
            state.store.currentStore = null;
        },
        getStoreDetailSuccess: (state, action) => {
            state.store.isFetching = false;
            state.store.currentStore = action.payload;
            state.store.error = false;
        },
        getStoreDetailFailed: (state) => {
            state.store.isFetching = false;
            state.store.error = true;
        },
        getProductStart: (state) => {
            state.product.isFetching = true;
            state.product.allProducts = [];
        },
        getProductSuccess: (state, action) => {
            state.product.isFetching = false;
            state.product.allProducts = action.payload;
            state.product.error = false;
        },
        getProductFailed: (state) => {
            state.product.isFetching = false;
            state.product.error = true;
        },
        getCommentsStart: (state) => {
            state.comments.isFetching = true;
            state.comments.allComments = [];
        },
        getCommentsSuccess: (state, action) => {
            state.comments.isFetching = false;
            state.comments.allComments = action.payload;
            state.comments.error = false;
        },
        getCommentsFailed: (state) => {
            state.comments.isFetching = false;
            state.comments.error = true;
        },
        getStoreRequestSuccess: (state, action) => {
            state.storeRequest.isFetching = false;
            state.storeRequest.allStores = action.payload;
            state.storeRequest.error = false;
        },
        confirmStoreSuccess: (state, action) => {
            state.storeRequest.isFetching = false;
            state.storeRequest.allStores = state.storeRequest.allStores.filter(store => store._id !== action.payload);
            state.storeRequest.error = false;
        }
    }
});

export const {confirmStoreSuccess, getStoreRequestSuccess, getCommentsStart, getCommentsSuccess, getCommentsFailed, getMarketStart, getMarketSuccess, getMarketFailed, getStoreDetailStart, getStoreDetailSuccess, getStoreDetailFailed, getProductStart, getProductSuccess, getProductFailed } = marketSlice.actions;

export default marketSlice.reducer;