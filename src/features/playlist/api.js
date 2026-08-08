import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { mapPlaylistItemFromDb, mapPlaylistItemToDb } from "./mappers";
import { selectMaxSortOrder } from "./selectors";

export const fetchPlaylistItems = createAsyncThunk(
   "playlist/fetchPlaylistItems",
   async (weddingId, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("playlist_items")
         .select("*")
         .eq("wedding_id", weddingId)
         .order("sort_order", { ascending: true, nullsFirst: false })
         .order("created_at", { ascending: true });
      if (error) return rejectWithValue(error.message);
      return data.map(mapPlaylistItemFromDb);
   },
);

export const addPlaylistItem = createAsyncThunk(
   "playlist/addPlaylistItem",
   async (item, { getState, rejectWithValue }) => {
      // nowy utwór trafia na koniec swojej sekcji, nie całej listy
      const sortOrder = selectMaxSortOrder(getState(), item.category) + 1;
      const { data, error } = await supabase
         .from("playlist_items")
         .insert(mapPlaylistItemToDb({ ...item, sortOrder }))
         .select()
         .single();
      if (error) {
         // 23505 = unikalny indeks na (wedding_id, source, external_id).
         // Wyszukiwarka oznacza już dodane utwory, ale robi to na podstawie
         // stanu wczytanego w przeglądarce — druga osoba mogła dodać ten sam
         // kawałek w międzyczasie
         if (error.code === "23505") {
            return rejectWithValue("Ten utwór jest już na liście.");
         }
         return rejectWithValue(error.message);
      }
      return mapPlaylistItemFromDb(data);
   },
);

export const updatePlaylistItem = createAsyncThunk(
   "playlist/updatePlaylistItem",
   async ({ id, changes }, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("playlist_items")
         .update(mapPlaylistItemToDb(changes))
         .eq("id", id)
         .select()
         .single();
      if (error) return rejectWithValue(error.message);
      return mapPlaylistItemFromDb(data);
   },
);

export const removePlaylistItem = createAsyncThunk(
   "playlist/removePlaylistItem",
   async (id, { rejectWithValue }) => {
      const { error } = await supabase
         .from("playlist_items")
         .delete()
         .eq("id", id);
      if (error) return rejectWithValue(error.message);
      return id;
   },
);
