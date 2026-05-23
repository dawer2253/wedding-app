import { createSlice } from "@reduxjs/toolkit";
import {
   signUp,
   login,
   signOut,
   resetPassword,
   updatePassword,
   initializeAuth,
} from "./api";

const initialState = {
   user: null,
   session: null,
   loading: true,
   error: null,
};

const authSlice = createSlice({
   name: "auth",
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         .addCase(initializeAuth.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(initializeAuth.fulfilled, (state, action) => {
            state.loading = false;
            state.session = action.payload;
            state.user = action.payload?.user ?? null;
         })
         .addCase(initializeAuth.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(signUp.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(signUp.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.session = action.payload.session;
         })
         .addCase(signUp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.session = action.payload.session;
         })
         .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(signOut.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(signOut.fulfilled, (state) => {
            state.loading = false;
            state.user = null;
            state.session = null;
         })
         .addCase(signOut.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(resetPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(resetPassword.fulfilled, (state) => {
            state.loading = false;
         })
         .addCase(resetPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(updatePassword.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(updatePassword.fulfilled, (state) => {
            state.loading = false;
         })
         .addCase(updatePassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         });
   },
});

export default authSlice.reducer;
