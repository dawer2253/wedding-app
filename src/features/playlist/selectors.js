import { createSelector } from "@reduxjs/toolkit";
import { CATEGORIES } from "./constants";

const selectItems = (state) => state.playlist.items;
const selectIds = (state) => state.playlist.ids;

export const selectPlaylistItemById = (state, id) => state.playlist.items[id];
export const selectPlaylistLoading = (state) => state.playlist.loading;
export const selectPlaylistError = (state) => state.playlist.error;
export const selectPlaylistCount = (state) => state.playlist.ids.length;

// sortOrder bywa pusty (rekord sprzed dodania kolejności) — takie lecą na koniec
const bySortOrder = (a, b) => {
   const orderA = a.sortOrder ?? Infinity;
   const orderB = b.sortOrder ?? Infinity;
   if (orderA !== orderB) return orderA - orderB;
   return a.createdAt.localeCompare(b.createdAt);
};

export const selectAllPlaylistItems = createSelector(
   [selectItems, selectIds],
   (items, ids) => ids.map((id) => items[id]).sort(bySortOrder),
);

export const selectPlaylistByCategory = createSelector(
   [selectAllPlaylistItems],
   (all) => {
      const byCategory = Object.fromEntries(
         CATEGORIES.map((category) => [category, []]),
      );
      for (const item of all) byCategory[item.category]?.push(item);
      return byCategory;
   },
);

// Identyfikatory już dodanych utworów — wyszukiwarka oznacza nimi wyniki,
// żeby nie dało się dodać tego samego kawałka dwa razy. Klucz zawiera źródło,
// bo Deezer i iTunes numerują utwory niezależnie
export const selectAddedExternalIds = createSelector(
   [selectAllPlaylistItems],
   (all) =>
      new Set(
         all
            .filter((item) => item.externalId)
            .map((item) => `${item.source}:${item.externalId}`),
      ),
);

// Używane przy dodawaniu i przy zmianie kategorii — utwór ląduje na końcu
// swojej sekcji, a nie na końcu całej listy
export const selectMaxSortOrder = (state, category) =>
   state.playlist.ids.reduce((max, id) => {
      const item = state.playlist.items[id];
      if (item?.category !== category) return max;
      return Math.max(max, item.sortOrder ?? 0);
   }, 0);

// Wariant dla komponentów, które mają już gotową listę z selectPlaylistByCategory
// i poznają kategorię docelową dopiero w handlerze
export const maxSortOrderIn = (items) =>
   items.reduce((max, item) => Math.max(max, item.sortOrder ?? 0), 0);
