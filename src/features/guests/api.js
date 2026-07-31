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
         .order("created_at", { ascending: false });
      if (error) return rejectWithValue(error.message);
      return data.map(mapGuestFromDb);
   },
);

export const addGuest = createAsyncThunk(
   "guests/addGuest",
   async (guest, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("guests")
         .insert(mapGuestToDb(guest))
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
