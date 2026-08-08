// Postgres zwraca numeric jako string — stąd Number() na cenie.
// pros/cons to text[]; supabase-js oddaje je jako natywną tablicę JS
export const mapVendorFromDb = (row) => ({
   id: row.id,
   weddingId: row.wedding_id,
   name: row.name,
   role: row.role,
   status: row.status,
   price: row.price === null ? null : Number(row.price),
   rating: row.rating,
   phone: row.phone ?? "",
   email: row.email ?? "",
   website: row.website ?? "",
   instagram: row.instagram ?? "",
   pros: row.pros ?? [],
   cons: row.cons ?? [],
   notes: row.notes ?? "",
   createdAt: row.created_at,
   updatedAt: row.updated_at,
});

const VENDOR_FIELD_TO_COLUMN = {
   weddingId: "wedding_id",
   name: "name",
   role: "role",
   status: "status",
   price: "price",
   rating: "rating",
   phone: "phone",
   email: "email",
   website: "website",
   instagram: "instagram",
   pros: "pros",
   cons: "cons",
   notes: "notes",
};

// Mapuje tylko obecne pola (działa też dla częściowego patcha w updateVendor).
// Puste stringi lądują w bazie jako null; puste tablice zostają tablicami,
// żeby wyczyszczenie plusów/minusów było odróżnialne od braku zmiany
export const mapVendorToDb = (vendor) => {
   const row = {};
   for (const [field, column] of Object.entries(VENDOR_FIELD_TO_COLUMN)) {
      const value = vendor[field];
      if (value === undefined) continue;
      row[column] = value === "" ? null : value;
   }
   return row;
};
