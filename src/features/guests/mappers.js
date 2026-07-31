export const mapGuestFromDb = (row) => ({
   id: row.id,
   weddingId: row.wedding_id,
   firstName: row.first_name,
   lastName: row.last_name,
   group: row.guest_group,
   rsvpStatus: row.rsvp_status,
   hasPlusOne: row.has_plus_one,
   plusOneName: row.plus_one_name ?? "",
   isChild: row.is_child,
   dietaryNotes: row.dietary_notes ?? "",
   phone: row.phone ?? "",
   email: row.email ?? "",
   tableNumber: row.table_number,
   notes: row.notes ?? "",
   sortOrder: row.sort_order,
   createdAt: row.created_at,
   updatedAt: row.updated_at,
});

const FIELD_TO_COLUMN = {
   weddingId: "wedding_id",
   firstName: "first_name",
   lastName: "last_name",
   group: "guest_group",
   rsvpStatus: "rsvp_status",
   hasPlusOne: "has_plus_one",
   plusOneName: "plus_one_name",
   isChild: "is_child",
   dietaryNotes: "dietary_notes",
   phone: "phone",
   email: "email",
   tableNumber: "table_number",
   notes: "notes",
   sortOrder: "sort_order",
};

// Mapuje tylko obecne pola (działa też dla częściowego patcha w updateGuest).
export const mapGuestToDb = (guest) => {
   const row = {};
   for (const [field, column] of Object.entries(FIELD_TO_COLUMN)) {
      if (guest[field] === undefined) continue;
      row[column] = guest[field] === "" ? null : guest[field];
   }
   // guest_group jest NOT NULL w bazie — pusta grupa to pusty string
   if (row.guest_group === null) row.guest_group = "";
   return row;
};
