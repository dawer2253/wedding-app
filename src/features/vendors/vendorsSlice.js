import { createSlice } from "@reduxjs/toolkit";
import { fetchVendors, addVendor, updateVendor, removeVendor } from "./api";

const initialState = {
   items: {},
   ids: [],
   loading: false,
   error: null,
   optimisticBackups: {},
};

const vendorsSlice = createSlice({
   name: "vendors",
   initialState,
   reducers: {
      resetVendors() {
         return initialState;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchVendors.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchVendors.fulfilled, (state, action) => {
            state.loading = false;
            state.items = {};
            state.ids = [];
            for (const vendor of action.payload) {
               state.items[vendor.id] = vendor;
               state.ids.push(vendor.id);
            }
         })
         .addCase(fetchVendors.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(addVendor.fulfilled, (state, action) => {
            const vendor = action.payload;
            if (!state.items[vendor.id]) state.ids.push(vendor.id);
            state.items[vendor.id] = vendor;
         })
         // updateVendor — optymistycznie: zmiana od razu, rollback przy błędzie.
         // Backup i patch obejmują TYLKO pola z danego requestu, żeby równoległe
         // update'y (np. degradacja poprzedniego „wybranego") nie kasowały sobie zmian
         .addCase(updateVendor.pending, (state, action) => {
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
         .addCase(updateVendor.fulfilled, (state, action) => {
            const { id, changes } = action.meta.arg;
            const vendor = action.payload;
            delete state.optimisticBackups[action.meta.requestId];
            const existing = state.items[id];
            // dostawca mógł zostać w międzyczasie optymistycznie usunięty —
            // nie wskrzeszamy go poza listą ids
            if (!existing) return;
            const patch = { updatedAt: vendor.updatedAt };
            for (const key of Object.keys(changes)) {
               patch[key] = vendor[key];
            }
            state.items[id] = { ...existing, ...patch };
         })
         .addCase(updateVendor.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            delete state.optimisticBackups[action.meta.requestId];
            if (!backup) return;
            const existing = state.items[backup.id];
            if (!existing) return;
            state.items[backup.id] = { ...existing, ...backup.fields };
         })
         // removeVendor — optymistycznie: karta znika od razu, wraca przy błędzie
         .addCase(removeVendor.pending, (state, action) => {
            const id = action.meta.arg;
            const index = state.ids.indexOf(id);
            if (index === -1) return;
            state.optimisticBackups[action.meta.requestId] = {
               vendor: state.items[id],
               index,
            };
            state.ids.splice(index, 1);
            delete state.items[id];
         })
         .addCase(removeVendor.fulfilled, (state, action) => {
            delete state.optimisticBackups[action.meta.requestId];
         })
         .addCase(removeVendor.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            delete state.optimisticBackups[action.meta.requestId];
            if (!backup) return;
            state.items[backup.vendor.id] = backup.vendor;
            state.ids.splice(
               Math.min(backup.index, state.ids.length),
               0,
               backup.vendor.id,
            );
         });
   },
});

export const { resetVendors } = vendorsSlice.actions;
export default vendorsSlice.reducer;
