import { createSlice } from "@reduxjs/toolkit";
import { fetchGuests, addGuest, updateGuest, removeGuest } from "./api";

const initialState = {
   items: {},
   ids: [],
   loading: false,
   error: null,
   filter: { group: "all", status: "all", search: "" },
};

const guestsSlice = createSlice({
   name: "guests",
   initialState,
   reducers: {
      setFilter(state, action) {
         state.filter = { ...state.filter, ...action.payload };
      },
      resetGuests() {
         return initialState;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchGuests.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchGuests.fulfilled, (state, action) => {
            state.loading = false;
            state.items = {};
            state.ids = [];
            for (const guest of action.payload) {
               state.items[guest.id] = guest;
               state.ids.push(guest.id);
            }
         })
         .addCase(fetchGuests.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(addGuest.fulfilled, (state, action) => {
            const guest = action.payload;
            if (!state.items[guest.id]) {
               state.ids.unshift(guest.id);
            }
            state.items[guest.id] = guest;
         })
         .addCase(updateGuest.fulfilled, (state, action) => {
            const guest = action.payload;
            state.items[guest.id] = guest;
         })
         .addCase(removeGuest.fulfilled, (state, action) => {
            const id = action.payload;
            delete state.items[id];
            state.ids = state.ids.filter((guestId) => guestId !== id);
         });
   },
});

export const { setFilter, resetGuests } = guestsSlice.actions;
export default guestsSlice.reducer;
