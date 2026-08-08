import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { mapVendorFromDb, mapVendorToDb } from "./mappers";

export const fetchVendors = createAsyncThunk(
   "vendors/fetchVendors",
   async (weddingId, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("vendors")
         .select("*")
         .eq("wedding_id", weddingId)
         .order("created_at", { ascending: true });
      if (error) return rejectWithValue(error.message);
      return data.map(mapVendorFromDb);
   },
);

export const addVendor = createAsyncThunk(
   "vendors/addVendor",
   async (vendor, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("vendors")
         .insert(mapVendorToDb(vendor))
         .select()
         .single();
      if (error) return rejectWithValue(error.message);
      return mapVendorFromDb(data);
   },
);

export const updateVendor = createAsyncThunk(
   "vendors/updateVendor",
   async ({ id, changes }, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("vendors")
         .update(mapVendorToDb(changes))
         .eq("id", id)
         .select()
         .single();
      if (error) return rejectWithValue(error.message);
      return mapVendorFromDb(data);
   },
);

export const removeVendor = createAsyncThunk(
   "vendors/removeVendor",
   async (id, { rejectWithValue }) => {
      const { error } = await supabase.from("vendors").delete().eq("id", id);
      if (error) return rejectWithValue(error.message);
      return id;
   },
);
