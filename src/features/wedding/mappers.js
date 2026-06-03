export const mapWeddingFromDb = (row) => ({
   id: row.id,
   name: row.name,
   weddingDate: row.wedding_date,
   inviteCode: row.invite_code,
   createdBy: row.created_by,
   createdAt: row.created_at,
});
