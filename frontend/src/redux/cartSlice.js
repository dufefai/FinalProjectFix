import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: {
      items: [],
      store: null,
      totalQuantity: 0,
      totalPrice: 0,
    },
  },
  reducers: {
    addToCart: (state, action) => {
      const { store: newStore, id, quantity, price } = action.payload;
    
      if (state.cart.store && state.cart.store !== newStore) {
        state.cart.items = [];
        state.cart.totalQuantity = 0;
        state.cart.totalPrice = 0;
      }
    
      state.cart.store = newStore;
    
      const existingItem = state.cart.items.find((item) => item.id === id);

      const newTotalQuantity = state.cart.totalQuantity + quantity;
      if (newTotalQuantity <= 999) {
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          state.cart.items.push({ ...action.payload, quantity });
        }
    
        state.cart.totalQuantity = newTotalQuantity;
        state.cart.totalPrice += price * quantity;
      }
    },
    
    removeFromCart: (state, action) => {
      const id = action.payload;
      const itemToRemove = state.cart.items.find((item) => item.id === id);

      if (itemToRemove) {
        state.cart.totalQuantity -= itemToRemove.quantity;
        state.cart.totalPrice -= itemToRemove.price * itemToRemove.quantity;
        state.cart.items = state.cart.items.filter((item) => item.id !== id);
      }
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const itemToUpdate = state.cart.items.find((item) => item.id === id);

      if (itemToUpdate) {
        const quantityDifference = quantity - itemToUpdate.quantity;
        itemToUpdate.quantity = quantity;
        state.cart.totalQuantity += quantityDifference;
        state.cart.totalPrice += quantityDifference * itemToUpdate.price;
      }
    },

    clearCart: (state) => {
      state.cart.items = [];
      state.cart.store = null;
      state.cart.totalQuantity = 0;
      state.cart.totalPrice = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
