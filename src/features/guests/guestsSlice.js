import { createSlice } from "@reduxjs/toolkit";
import { fetchGuests, addGuest, updateGuest, removeGuest } from "./api";

const initialState = {
   items: {},
   ids: [],
   loading: false,
   error: null,
   filter: { group: "all", status: "all", search: "" },
   optimisticBackups: {},
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
               state.ids.push(guest.id);
            }
            state.items[guest.id] = guest;
         })
         // updateGuest — optymistycznie: zmiana od razu, rollback przy błędzie.
         // Backup i rollback obejmują TYLKO pola z danego requestu — dwa
         // równoległe update'y tego samego gościa (np. telefon + checkbox)
         // nie nadpisują sobie nawzajem potwierdzonych już zmian
         .addCase(updateGuest.pending, (state, action) => {
            const { id, changes } = action.meta.arg;
            const existing = state.items[id];
            if (!existing) return;
            const fields = {};
            for (const key of Object.keys(changes)) {
               fields[key] = existing[key];
            }
            state.optimisticBackups[action.meta.requestId] = { id, fields };
            state.items[id] = { ...existing, ...changes };
         })
         .addCase(updateGuest.fulfilled, (state, action) => {
            const { id, changes } = action.meta.arg;
            const guest = action.payload;
            delete state.optimisticBackups[action.meta.requestId];
            const existing = state.items[id];
            // gość mógł zostać w międzyczasie optymistycznie usunięty —
            // nie wskrzeszamy go poza listą ids
            if (!existing) return;
            const patch = { updatedAt: guest.updatedAt };
            for (const key of Object.keys(changes)) {
               patch[key] = guest[key];
            }
            state.items[id] = { ...existing, ...patch };
         })
         .addCase(updateGuest.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            delete state.optimisticBackups[action.meta.requestId];
            if (!backup) return;
            const existing = state.items[backup.id];
            if (!existing) return;
            state.items[backup.id] = { ...existing, ...backup.fields };
         })
         // removeGuest — optymistycznie: wiersz znika od razu, wraca przy błędzie
         .addCase(removeGuest.pending, (state, action) => {
            const id = action.meta.arg;
            const index = state.ids.indexOf(id);
            if (index === -1) return;
            state.optimisticBackups[action.meta.requestId] = {
               guest: state.items[id],
               index,
            };
            state.ids.splice(index, 1);
            delete state.items[id];
         })
         .addCase(removeGuest.fulfilled, (state, action) => {
            delete state.optimisticBackups[action.meta.requestId];
         })
         .addCase(removeGuest.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            if (backup) {
               state.items[backup.guest.id] = backup.guest;
               state.ids.splice(
                  Math.min(backup.index, state.ids.length),
                  0,
                  backup.guest.id,
               );
            }
            delete state.optimisticBackups[action.meta.requestId];
         });
   },
});

export const { setFilter, resetGuests } = guestsSlice.actions;
export default guestsSlice.reducer;
