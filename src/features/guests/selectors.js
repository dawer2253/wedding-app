import { createSelector } from "@reduxjs/toolkit";

const selectItems = (state) => state.guests.items;
const selectIds = (state) => state.guests.ids;

export const selectAllGuests = createSelector(
   [selectItems, selectIds],
   (items, ids) =>
      ids
         .map((id) => items[id])
         .sort((a, b) => {
            const orderA = a.sortOrder ?? Infinity;
            const orderB = b.sortOrder ?? Infinity;
            if (orderA !== orderB) return orderA - orderB;
            return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
         }),
);

export const selectGuestById = (state, id) => state.guests.items[id];
export const selectGuestsLoading = (state) => state.guests.loading;
export const selectGuestsError = (state) => state.guests.error;
export const selectGuestsFilter = (state) => state.guests.filter;
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

// Liczby osób dla budżetu (wydatki liczone "od gościa") — osoba towarzysząca
// liczy się jako dodatkowy dorosły, dzieci osobno (waga zależy od wydatku)
export const selectGuestHeadcounts = createSelector(
   [selectAllGuests],
   (guests) => {
      const headcounts = {
         all: { adults: 0, children: 0 },
         confirmed: { adults: 0, children: 0 },
      };
      for (const guest of guests) {
         const adults = (guest.isChild ? 0 : 1) + (guest.hasPlusOne ? 1 : 0);
         const children = guest.isChild ? 1 : 0;
         headcounts.all.adults += adults;
         headcounts.all.children += children;
         if (guest.rsvpStatus === "confirmed") {
            headcounts.confirmed.adults += adults;
            headcounts.confirmed.children += children;
         }
      }
      return headcounts;
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
      // Osoba towarzysząca liczy się jako druga osoba — tak samo w sumie,
      // jak i w licznikach statusów (dzieli status gościa)
      const persons = guest.hasPlusOne ? 2 : 1;
      stats.total += persons;
      if (stats[guest.rsvpStatus] !== undefined) {
         stats[guest.rsvpStatus] += persons;
      }
      if (guest.hasPlusOne) stats.plusOnes += 1;
      if (guest.isChild) stats.children += 1;
      if (guest.dietaryNotes) stats.withDietaryNotes += 1;
   }
   return stats;
});
