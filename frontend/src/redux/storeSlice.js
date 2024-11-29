import { createSlice } from "@reduxjs/toolkit";

const storeSlice = createSlice({
  name: "store",
  initialState: {
    store: {
      currentStore: null,
      isFetching: false,
      error: false,
    },
    category: {
      allCategories: [],
      isFetching: false,
      error: false,
    }
  },
  reducers: {
    createStoreStart: (state) => {
      state.store.isFetching = true;
    },
    createStoreSuccess: (state, action) => {
      state.store.isFetching = false;
      state.store.currentStore = action.payload;
      state.store.error = false;
    },
    createStoreFailed: (state) => {
      state.store.isFetching = false;
      state.store.error = true;
    },
    getStoreStart: (state) => {
      state.store.isFetching = true;
      state.store.currentStore = null;
    },
    getStoreSuccess: (state, action) => {
      state.store.isFetching = false;
      state.store.currentStore = action.payload;
      state.store.error = false;
    },
    getStoreFailed: (state) => {
      state.store.isFetching = false;
      state.store.error = true;
    },
    createCategoryStart: (state) => {
      state.category.isFetching = true;
    },
    createCategorySuccess: (state, action) => {
      state.category.isFetching = false;
      state.category.allCategories = [
        ...state.category.allCategories,
        action.payload,
      ];
      state.category.error = false;
    },
    createCategoryFailed: (state) => {
      state.category.isFetching = false;
      state.category.error = true;
    },
    editCategoryStart: (state) => {
      state.category.isFetching = true;
    },
    editCategorySuccess: (state, action) => {
      state.category.isFetching = false;
      state.category.allCategories = state.category.allCategories.map(
        (category) =>
          category._id === action.payload._id ? { ...category, name: action.payload.name } : category
      );
      state.category.error = false;
    },
    editCategoryFailed: (state) => {
      state.category.isFetching = false;
      state.category.error = true;
    },
    deleteCategoryStart: (state) => {
      state.category.isFetching = true;
    },
    deleteCategorySuccess: (state, action) => {
      state.category.isFetching = false;
      state.category.allCategories = state.category.allCategories.filter(
        (category) => category._id !== action.payload
      );
      state.category.error = false;
    },
    deleteCategoryFailed: (state) => {
      state.category.isFetching = false;
      state.category.error = true;
    },
    getCategoriesStart: (state) => {
      state.category.isFetching = true;
    },
    getCategoriesSuccess: (state, action) => {
      state.category.isFetching = false;
      state.category.allCategories = action.payload;
      state.category.error = false;
    },
    getCategoriesFailed: (state) => {
      state.category.isFetching = false;
      state.category.error = true;
    },
    createProductStart: (state) => {
      state.category.isFetching = true;
    },
    createProductSuccess: (state, action) => {
      state.category.isFetching = false;
      state.category.error = false;
    
      const categoryIndex = state.category.allCategories.findIndex(
        (category) => category._id === action.payload.category
      );
    
      if (categoryIndex !== -1) {
        if (!Array.isArray(state.category.allCategories[categoryIndex].products)) {
          state.category.allCategories[categoryIndex].products = [];
        }
        state.category.allCategories[categoryIndex].products = [
          action.payload,
          ...state.category.allCategories[categoryIndex].products,
        ];
      }
    },    
    createProductFailed: (state) => {
      state.category.isFetching = false;
      state.category.error = true;
    },
    editProductStart: (state) => {
      state.category.isFetching = true;
    },
    editProductSuccess: (state, action) => {
      state.category.isFetching = false;
      state.category.error = false;
      console.log(action.payload);

      state.category.allCategories = state.category.allCategories.map((category) => {
        return {
          ...category,
          products: category.products.filter(
            (product) => product._id !== action.payload._id
          )
        };
      });

      const categoryIndex = state.category.allCategories.findIndex(
        (category) => category._id === action.payload.category
      );
    
      if (categoryIndex !== -1) {
        state.category.allCategories[categoryIndex].products = [
          action.payload,
          ...state.category.allCategories[categoryIndex].products,
        ];
      }
    },
    editProductFailed: (state) => {
      state.category.isFetching = false;
      state.category.error = true;
    },
    enableProductStart: (state) => {
      state.category.isFetching = true;
    },
    enableProductSuccess: (state, action) => {
      state.category.isFetching = false;
      state.category.error = false;
      state.category.allCategories = state.category.allCategories.map((category) => {
        return {
          ...category,
          products: category.products.map((product) => {
            return product._id === action.payload._id ? action.payload : product;
          })
        };
      });
    },
    enableProductFailed: (state) => {
      state.category.isFetching = false;
      state.category.error = true;
    },
    deleteProductStart: (state) => {
      state.category.isFetching = true;
    },
    deleteProductSuccess: (state, action) => {
      state.category.isFetching = false;
      state.category.allCategories = state.category.allCategories.map((category) => {
        return {
          ...category,
          products: category.products.filter(
            (product) => product._id !== action.payload 
          )
        };
      });
    
      state.category.error = false;
    },    
    deleteProductFailed: (state) => {
      state.category.isFetching = false;
      state.category.error = true;
    }
  },
});
export const {
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
  deleteProductFailed,
  getStoreStart,
  getStoreSuccess,
  getStoreFailed,
  createStoreStart,
  createStoreSuccess,
  createStoreFailed,
} = storeSlice.actions;
export default storeSlice.reducer;
