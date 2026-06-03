import { createSlice } from "@reduxjs/toolkit";
import { fetchUserWedding, createWedding, joinWeddingByCode } from "./api";

const initialState = {
   activeWedding: null,
   members: [],
   loading: false,
   error: null,
};

const weddingSlice = createSlice({
   name: "wedding",
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         .addCase(fetchUserWedding.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchUserWedding.fulfilled, (state, action) => {
            state.loading = false;
            state.activeWedding = action.payload[0] ?? null;
         })
         .addCase(fetchUserWedding.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(createWedding.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(createWedding.fulfilled, (state, action) => {
            state.loading = false;
            state.activeWedding = action.payload;
         })
         .addCase(createWedding.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(joinWeddingByCode.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(joinWeddingByCode.fulfilled, (state) => {
            state.loading = false;
         })
         .addCase(joinWeddingByCode.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         });
   },
});

export default weddingSlice.reducer;
