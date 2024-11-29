import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: "post",
    initialState:{
        posts:{
            allPosts:[],
            profilePosts: [],
            isFetching:false,
            error:false,
            success:false,
        },
        post: {
            currentPost: [],
            isFetching: false,
            error: false,
            success: false,
        },
    },
    reducers:{
        getNewsStart: (state) => {
            state.posts.isFetching = true;
            state.loading = true;
        },
        getNewsSuccess: (state, action) => {
            state.posts.isFetching = false;
            state.posts.allPosts = action.payload;
            state.posts.error = false;
            state.loading = false;
        },
        getNewsFailed: (state) => {
            state.posts.isFetching = false;
            state.posts.error = true;
            state.loading = false;
        },

        getProfilePostStart: (state) => {
            state.posts.isFetching = true;
            state.loading = true;
        },
        getProfilePostSuccess: (state, action) => {
            state.posts.isFetching = false;
            state.posts.profilePosts = action.payload;
            state.posts.error = false;
            state.loading = false;
        },
        getProfilePostFailed: (state) => {
            state.posts.isFetching = false;
            state.posts.error = true;
            state.loading = false;
        },

        postStart: (state) => {
            state.posts.isFetching = true;
        },
        postSuccess: (state, action) => {
            state.posts.isFetching = false;
            state.posts.error = false;
            state.posts.success = true;
            state.posts.allPosts = [action.payload, ...state.posts.allPosts];
        },
        postFailed: (state) => {
            state.posts.isFetching = false;
            state.posts.error = true;
            state.posts.success = false;
        },

        deletePostStart: (state) => {
            state.posts.isFetching = true;
        },
        deletePostSuccess: (state, action) => {
            state.posts.isFetching = false;
            state.posts.error = false;
            state.posts.success = true;
            state.posts.allPosts = state.posts.allPosts.filter(post => post._id !== action.payload);
            state.posts.profilePosts = state.posts.profilePosts.filter(post => post._id !== action.payload);
        },
        deletePostFailed: (state) => {
            state.posts.isFetching = false;
            state.posts.error = true;
            state.posts.success = false;
        },
        editPostStart: (state) => {
            state.posts.isFetching = true;
        },
        editPostSuccess: (state, action) => {
            state.posts.isFetching = false;
            state.posts.error = false;
            state.posts.success = true;
            state.posts.allPosts = state.posts.allPosts.map(post => post._id === action.payload._id ? action.payload : post);
            state.posts.profilePosts = state.posts.profilePosts.map(post => post._id === action.payload._id ? action.payload : post);
        },
        editPostFailed: (state) => {
            state.posts.isFetching = false;
            state.posts.error = true;
            state.posts.success = false;
        },
        viewPostStart: (state) => {
            state.post.isFetching = true;
            state.post.currentPost=  [];
            state.loading = true;
        },
        viewPostSuccess: (state, action) => {
            state.post.isFetching = false;
            state.post.error = false;
            state.post.currentPost = action.payload;
            state.loading = false;
        },
        viewPostFailed: (state) => {
            state.post.isFetching = false;
            state.post.error = true;
            state.loading = true;
        },
        replyPostStart: (state) => {
            state.post.isFetching = true;
        },
        replyPostSuccess: (state, action) => {
            state.post.isFetching = false;
            state.post.error = false;
            state.post.currentPost.replies = [action.payload, ...state.post.currentPost.replies];
            state.post.currentPost.post.comments +=  1;
            state.posts.allPosts.map(post => post._id === state.post.currentPost.post._id ? post.comments +=1 : post);
            state.posts.profilePosts.map(post => post._id === state.post.currentPost.post._id ? post.comments +=1 : post);
        },
        replyPostFailed: (state) => {
            state.post.isFetching = false;
            state.post.error = true;
        },
        rePostStart: (state) => {
            state.post.isFetching = true;
        },
        rePostSuccess: (state, action) => {
            state.post.isFetching = false;
            state.post.error = false;
            if (state.posts.allPosts) {
                state.posts.allPosts = state.posts.allPosts.map(post => 
                    post._id === action.payload._id ? action.payload : post
                );
            }
            if (state.posts.profilePosts) {
                state.posts.profilePosts = state.posts.profilePosts.map(post => 
                    post._id === action.payload._id ? action.payload : post
                );
            }
            if (state.post.currentPost?.post && state.post.currentPost.post._id === action.payload._id) {
                state.post.currentPost.post = action.payload;
            }
            if (state.post.currentPost?.repliedPost && state.post.currentPost.repliedPost._id === action.payload._id) {
                state.post.currentPost.repliedPost = action.payload;
            }
            if (state.post.currentPost.replies) {
                state.post.currentPost.replies = state.post.currentPost.replies.map(reply => 
                    reply._id === action.payload._id ? action.payload : reply
                );
            }
        },
        rePostFailed: (state) => {
            state.post.isFetching = false;
            state.post.error = true;
        },
        likePostStart: (state) => {
            state.post.isFetching = true;
        },
        likePostSuccess: (state, action) => {
            state.post.isFetching = false;
            state.post.error = false;
            const { userId, postId } = action.payload;

            if (state.post.currentPost.length !== 0) {
                if (state.post.currentPost.post._id === postId) {
                    const index = state.post.currentPost.post.likes.findIndex((id) => id === userId);
                    if (index === -1) {
                        state.post.currentPost.post.likes.push(userId);
                    } else {
                        state.post.currentPost.post.likes = state.post.currentPost.post.likes.filter((id) => id !== userId);
                    }
                }
                if (state.post.currentPost.repliedPost?._id === postId) {
                    const index1 = state.post.currentPost.repliedPost.likes.findIndex((id) => id === userId);
                    if (index1 === -1) {
                        state.post.currentPost.repliedPost.likes.push(userId);
                    } else {
                        state.post.currentPost.repliedPost.likes = state.post.currentPost.repliedPost.likes.filter((id) => id !== userId);
                    }
                }
                state.post.currentPost.replies = state.post.currentPost.replies.map((post) => {
                    if (post._id === postId) {
                        const index = post.likes.findIndex((id) => id === userId);
                        if (index === -1) {
                            post.likes.push(userId);
                        } else {
                            post.likes = post.likes.filter((id) => id !== userId);
                        }
                    }
                    return post;
                });
            }
            state.posts.allPosts = state.posts.allPosts.map((post) => {
                if (post._id === postId) {
                    const index = post.likes.findIndex((id) => id === userId);
                    if (index === -1) {
                        post.likes.push(userId);
                    } else {
                        post.likes = post.likes.filter((id) => id !== userId);
                    }
                }
                return post;
            });
            state.posts.profilePosts = state.posts.profilePosts.map((post) => {
                if (post._id === postId) {
                    const index = post.likes.findIndex((id) => id === userId);
                    if (index === -1) {
                        post.likes.push(userId);
                    } else {
                        post.likes = post.likes.filter((id) => id !== userId);
                    }
                }
                return post;
            });
        },
        likePostFailed: (state) => {
            state.post.isFetching = false;
            state.post.error = true;
        }
  
    }
});

export const {likePostStart, likePostSuccess, likePostFailed, rePostStart, rePostSuccess, rePostFailed, replyPostStart, replyPostSuccess, replyPostFailed, viewPostStart, viewPostFailed, viewPostSuccess, editPostStart,editPostFailed,editPostSuccess, getNewsStart, getNewsSuccess, getNewsFailed, postStart, postSuccess, postFailed, getProfilePostStart, getProfilePostSuccess, getProfilePostFailed, deletePostStart,deletePostSuccess,deletePostFailed } = postSlice.actions;

export default postSlice.reducer;
