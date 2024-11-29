import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
    name: "address",
    initialState: {
        address: {
            currentAddress: null,
            isFetching: false,
            error: false,
        }
    },
    reducers: {
        getAddressStart: (state) => {
            state.address.isFetching = true;
            state.address.currentAddress = null;
        },
        getAddressSuccess: (state, action) => {
            state.address.isFetching = false;
            state.address.currentAddress = action.payload;
            state.address.error = false;
        },
        getAddressFailed: (state) => {
            state.address.isFetching = false;
            state.address.error = true;
        },
        updateAddressStart: (state) => {
            state.address.isFetching = true;
        },
        updateAddressSuccess: (state, action) => {
            state.address.isFetching = false;
            state.address.currentAddress = action.payload;
            state.address.error = false;
        },
        updateAddressFailed: (state) => {
            state.address.isFetching = false;
            state.address.error = true;
        }
    }
});

export const { updateAddressStart, updateAddressSuccess, updateAddressFailed, getAddressStart, getAddressSuccess, getAddressFailed } = addressSlice.actions;
export default addressSlice.reducer;