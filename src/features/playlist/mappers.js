// artworkUrl/previewUrl/externalId przychodzą tylko z wyszukiwarki iTunes —
// dla utworów wpisanych ręcznie zostają puste.
// durationMs zostaje nullem (a nie zerem), żeby odróżnić „nie znamy czasu"
// od utworu zerowej długości
export const mapPlaylistItemFromDb = (row) => ({
   id: row.id,
   weddingId: row.wedding_id,
   category: row.category,
   title: row.title,
   artist: row.artist ?? "",
   album: row.album ?? "",
   artworkUrl: row.artwork_url ?? "",
   previewUrl: row.preview_url ?? "",
   source: row.source,
   externalId: row.external_id ?? "",
   durationMs: row.duration_ms,
   note: row.note ?? "",
   sortOrder: row.sort_order,
   createdAt: row.created_at,
   updatedAt: row.updated_at,
});

const PLAYLIST_FIELD_TO_COLUMN = {
   weddingId: "wedding_id",
   category: "category",
   title: "title",
   artist: "artist",
   album: "album",
   artworkUrl: "artwork_url",
   previewUrl: "preview_url",
   source: "source",
   externalId: "external_id",
   durationMs: "duration_ms",
   note: "note",
   sortOrder: "sort_order",
};

// Mapuje tylko obecne pola (działa też dla częściowego patcha w updatePlaylistItem).
// Puste stringi lądują w bazie jako null
export const mapPlaylistItemToDb = (item) => {
   const row = {};
   for (const [field, column] of Object.entries(PLAYLIST_FIELD_TO_COLUMN)) {
      const value = item[field];
      if (value === undefined) continue;
      row[column] = value === "" ? null : value;
   }
   return row;
};
