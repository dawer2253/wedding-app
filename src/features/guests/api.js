import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { mapGuestFromDb, mapGuestToDb } from "./mappers";

export const fetchGuests = createAsyncThunk(
   "guests/fetchGuests",
   async (weddingId, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("guests")
         .select("*")
         .eq("wedding_id", weddingId)
         .order("sort_order", { ascending: true, nullsFirst: false })
         .order("created_at", { ascending: true });
      if (error) return rejectWithValue(error.message);
      return data.map(mapGuestFromDb);
   },
);

export const addGuest = createAsyncThunk(
   "guests/addGuest",
   async (guest, { getState, rejectWithValue }) => {
      // nowy gość trafia na koniec listy
      const { items, ids } = getState().guests;
      const maxSortOrder = ids.reduce(
         (max, id) => Math.max(max, items[id]?.sortOrder ?? 0),
         0,
      );
      const { data, error } = await supabase
         .from("guests")
         .insert(
            mapGuestToDb({ group: "", ...guest, sortOrder: maxSortOrder + 1 }),
         )
         .select()
         .single();
      if (error) return rejectWithValue(error.message);
      return mapGuestFromDb(data);
   },
);

export const updateGuest = createAsyncThunk(
   "guests/updateGuest",
   async ({ id, changes }, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("guests")
         .update(mapGuestToDb(changes))
         .eq("id", id)
         .select()
         .single();
      if (error) return rejectWithValue(error.message);
      return mapGuestFromDb(data);
   },
);

export const removeGuest = createAsyncThunk(
   "guests/removeGuest",
   async (id, { rejectWithValue }) => {
      const { error } = await supabase.from("guests").delete().eq("id", id);
      if (error) return rejectWithValue(error.message);
      return id;
   },
);
