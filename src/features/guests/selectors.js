import { createSelector } from "@reduxjs/toolkit";

const selectItems = (state) => state.guests.items;
const selectIds = (state) => state.guests.ids;

export const selectAllGuests = createSelector(
   [selectItems, selectIds],
   (items, ids) => ids.map((id) => items[id]),
);

export const selectGuestById = (state, id) => state.guests.items[id];
export const selectGuestsLoading = (state) => state.guests.loading;
export const selectGuestsError = (state) => state.guests.error;
export const selectGuestsFilter = (state) => state.guests.filter;
export const selectGuestsViewMode = (state) => state.guests.viewMode;
export const selectGuestsCount = (state) => state.guests.ids.length;

export const selectGuestGroups = createSelector([selectAllGuests], (guests) => {
   const groups = new Set();
   for (const guest of guests) {
      if (guest.group) groups.add(guest.group);
   }
   return [...groups].sort((a, b) => a.localeCompare(b, "pl"));
});

export const selectFilteredGuests = createSelector(
   [selectAllGuests, selectGuestsFilter],
   (guests, filter) => {
      const search = filter.search.trim().toLowerCase();
      return guests.filter((guest) => {
         if (filter.group === "none") {
            if (guest.group) return false;
         } else if (filter.group !== "all" && guest.group !== filter.group) {
            return false;
         }
         if (filter.status !== "all" && guest.rsvpStatus !== filter.status) {
            return false;
         }
         if (search) {
            const fullName =
               `${guest.firstName} ${guest.lastName}`.toLowerCase();
            if (!fullName.includes(search)) return false;
         }
         return true;
      });
   },
);

export const selectGuestStats = createSelector([selectAllGuests], (guests) => {
   const stats = {
      total: 0,
      confirmed: 0,
      declined: 0,
      pending: 0,
      plusOnes: 0,
      children: 0,
      withDietaryNotes: 0,
   };
   for (const guest of guests) {
      stats.total += guest.hasPlusOne ? 2 : 1;
      if (stats[guest.rsvpStatus] !== undefined) stats[guest.rsvpStatus] += 1;
      if (guest.hasPlusOne) stats.plusOnes += 1;
      if (guest.isChild) stats.children += 1;
      if (guest.dietaryNotes) stats.withDietaryNotes += 1;
   }
   return stats;
});
