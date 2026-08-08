import { createSlice } from "@reduxjs/toolkit";
import {
   fetchPlaylistItems,
   addPlaylistItem,
   updatePlaylistItem,
   removePlaylistItem,
} from "./api";

const initialState = {
   items: {},
   ids: [],
   loading: false,
   error: null,
   optimisticBackups: {},
};

const playlistSlice = createSlice({
   name: "playlist",
   initialState,
   reducers: {
      resetPlaylist() {
         return initialState;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchPlaylistItems.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchPlaylistItems.fulfilled, (state, action) => {
            state.loading = false;
            state.items = {};
            state.ids = [];
            for (const item of action.payload) {
               state.items[item.id] = item;
               state.ids.push(item.id);
            }
         })
         .addCase(fetchPlaylistItems.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(addPlaylistItem.fulfilled, (state, action) => {
            const item = action.payload;
            if (!state.items[item.id]) state.ids.push(item.id);
            state.items[item.id] = item;
         })
         // updatePlaylistItem — optymistycznie: zmiana od razu, rollback przy błędzie.
         // Backup i patch obejmują TYLKO pola z danego requestu, żeby równoległe
         // update'y (np. przeciąganie w trakcie edycji notatki) nie kasowały sobie zmian
         .addCase(updatePlaylistItem.pending, (state, action) => {
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
         .addCase(updatePlaylistItem.fulfilled, (state, action) => {
            const { id, changes } = action.meta.arg;
            const item = action.payload;
            delete state.optimisticBackups[action.meta.requestId];
            const existing = state.items[id];
            // utwór mógł zostać w międzyczasie optymistycznie usunięty —
            // nie wskrzeszamy go poza listą ids
            if (!existing) return;
            const patch = { updatedAt: item.updatedAt };
            for (const key of Object.keys(changes)) {
               patch[key] = item[key];
            }
            state.items[id] = { ...existing, ...patch };
         })
         .addCase(updatePlaylistItem.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            delete state.optimisticBackups[action.meta.requestId];
            if (!backup) return;
            const existing = state.items[backup.id];
            if (!existing) return;
            state.items[backup.id] = { ...existing, ...backup.fields };
         })
         // removePlaylistItem — optymistycznie: wiersz znika od razu, wraca przy błędzie
         .addCase(removePlaylistItem.pending, (state, action) => {
            const id = action.meta.arg;
            const index = state.ids.indexOf(id);
            if (index === -1) return;
            state.optimisticBackups[action.meta.requestId] = {
               item: state.items[id],
               index,
            };
            state.ids.splice(index, 1);
            delete state.items[id];
         })
         .addCase(removePlaylistItem.fulfilled, (state, action) => {
            delete state.optimisticBackups[action.meta.requestId];
         })
         .addCase(removePlaylistItem.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            delete state.optimisticBackups[action.meta.requestId];
            if (!backup) return;
            state.items[backup.item.id] = backup.item;
            state.ids.splice(
               Math.min(backup.index, state.ids.length),
               0,
               backup.item.id,
            );
         });
   },
});

export const { resetPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
