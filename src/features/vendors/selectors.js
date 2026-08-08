import { createSelector } from "@reduxjs/toolkit";
import { ROLES } from "./constants";

const selectItems = (state) => state.vendors.items;
const selectIds = (state) => state.vendors.ids;

// W obrębie roli: najpierw wybrany, potem lepiej oceniony, potem tańszy,
// odrzuceni na końcu — czyli w kolejności, w jakiej się je przegląda
const RANK = { selected: 0, quoted: 1, contacted: 2, to_check: 3, rejected: 4 };

const compareInRole = (a, b) => {
   if (RANK[a.status] !== RANK[b.status]) return RANK[a.status] - RANK[b.status];
   if ((b.rating ?? 0) !== (a.rating ?? 0)) {
      return (b.rating ?? 0) - (a.rating ?? 0);
   }
   const priceA = a.price ?? Number.POSITIVE_INFINITY;
   const priceB = b.price ?? Number.POSITIVE_INFINITY;
   if (priceA !== priceB) return priceA - priceB;
   return a.name.localeCompare(b.name, "pl");
};

export const selectAllVendors = createSelector(
   [selectItems, selectIds],
   (items, ids) =>
      ids
         .map((id) => items[id])
         .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? "")),
);

export const selectVendorById = (state, id) => state.vendors.items[id];
export const selectVendorsLoading = (state) => state.vendors.loading;
export const selectVendorsError = (state) => state.vendors.error;
export const selectVendorsCount = (state) => state.vendors.ids.length;

// { role: [vendors] } — role bez dostawców mają pustą tablicę
export const selectVendorsByRole = createSelector(
   [selectAllVendors],
   (vendors) => {
      const byRole = Object.fromEntries(ROLES.map((role) => [role, []]));
      for (const vendor of vendors) {
         (byRole[vendor.role] ??= []).push(vendor);
      }
      for (const list of Object.values(byRole)) list.sort(compareInRole);
      return byRole;
   },
);

export const selectVendorsForRole = (state, role) =>
   selectVendorsByRole(state)[role] ?? [];

// 0 lub 1 dostawca ze statusem `selected` — podstawa reguły „tylko jeden
// wybrany na rolę" (W-096)
export const selectSelectedVendorForRole = (state, role) =>
   selectVendorsForRole(state, role).find(
      (vendor) => vendor.status === "selected",
   ) ?? null;

// Filtr statusów żyje w URL-u jako lista po przecinku (?status=quoted,selected);
// pusty string = brak filtra. String (a nie tablica) jako argument selektora,
// żeby memoizacja nie padała na nowej referencji tablicy przy każdym renderze
export const selectVendorSections = createSelector(
   [selectVendorsByRole, (_, statusParam) => statusParam],
   (byRole, statusParam) => {
      const statuses = statusParam ? statusParam.split(",") : [];
      return ROLES.map((role) => ({
         role,
         total: byRole[role].length,
         vendors: statuses.length
            ? byRole[role].filter((vendor) => statuses.includes(vendor.status))
            : byRole[role],
      })).filter((section) => section.total > 0);
   },
);
