import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
    name: "user",
    initialState:{
        user:{
            currentProfile:null,
            isFetching:false,
            error:false,
        },
        users:{
            users:[],
        }
    },
    reducers:{
        getUserStart: (state) => {
            state.user.isFetching = true;
            state.user.user = null;
        },
        getUserSuccess: (state, action) => {
            state.user.isFetching = false;
            state.user.currentProfile = action.payload;
        },
        getUserFailed: (state) => {
            state.user.isFetching = false;
            state.user.error = true;
        },
        updateProfileStart: (state) => {
            state.user.isFetching = true;
        },
        updateProfileSuccess: (state, action) => {
            state.user.isFetching = false;
            state.user.currentProfile = action.payload;
        },
        updateProfileFailed: (state) => {
            state.user.isFetching = false;
            state.user.error = true;
        },
        followUser: (state, action) => {
            if (!state.user.currentProfile.follower.includes(action.payload)) {
                state.user.currentProfile.follower.push(action.payload);
            }else{
                state.user.currentProfile.follower = state.user.currentProfile.follower.filter((id) => id !== action.payload);
            }
        },
        setRandomUsers: (state, action) => {
            state.users.users = action.payload;
        },
        
    }
});

export const { setRandomUsers, followUser, updateProfileStart, updateProfileSuccess, updateProfileFailed, getUserStart, getUserSuccess, getUserFailed } = userSlice.actions;
export default userSlice.reducer;