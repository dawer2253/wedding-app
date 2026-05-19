import { createSlice } from "@reduxjs/toolkit";

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
});

export default authSlice.reducer;
