import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import budgetReducer from "@/features/budget/budgetSlice";
import guestsReducer from "@/features/guests/guestsSlice";
import vendorReducer from "@/features/vendors/vendorsSlice";
import weddingReducer from "@/features/wedding/weddingSlice";

export const store = configureStore({
   reducer: {
      auth: authReducer,
      budget: budgetReducer,
      guests: guestsReducer,
      vendor: vendorReducer,
      wedding: weddingReducer,
   },
});
