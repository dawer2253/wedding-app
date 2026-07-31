import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { mapWeddingFromDb } from "./mappers";

export const fetchUserWedding = createAsyncThunk(
   "wedding/fetchUserWedding",
   async (_, { getState, rejectWithValue }) => {
      const userId = getState().auth.user?.id;
      if (!userId) return rejectWithValue("Nie jesteś zalogowany!");

      const { data, error } = await supabase
         .from("wedding_members")
         .select("weddings(*)")
         .eq("user_id", userId);
      if (error) return rejectWithValue(error.message);

      const weddings = data.map((row) => mapWeddingFromDb(row.weddings));
      return weddings;
   },
);

export const createWedding = createAsyncThunk(
   "wedding/createWedding",
   async (weddingData, { getState, rejectWithValue }) => {
      const userId = getState().auth.user?.id;
      if (!userId) return rejectWithValue("Nie jesteś zalogowany!");

      const { data: inviteCode, error: inviteCodeError } = await supabase.rpc(
         "generate_invite_code",
      );

      if (inviteCodeError) return rejectWithValue(inviteCodeError.message);

      const { data, error } = await supabase
         .from("weddings")
         .insert({
            name: weddingData.name,
            wedding_date: weddingData.weddingDate,
            invite_code: inviteCode,
            created_by: userId,
         })
         .select()
         .single();

      if (error) return rejectWithValue(error.message);

      const { error: addWeddingMemberError } = await supabase
         .from("wedding_members")
         .insert({
            wedding_id: data.id,
            user_id: userId,
         });
      if (addWeddingMemberError)
         return rejectWithValue(addWeddingMemberError.message);

      return mapWeddingFromDb(data);
   },
);

export const joinWeddingByCode = createAsyncThunk(
   "wedding/joinWeddingByCode",
   async (weddingCode, { dispatch, rejectWithValue }) => {
      const { error } = await supabase.rpc("join_wedding_by_code", {
         code: weddingCode,
      });
      if (error) return rejectWithValue(error.message);

      await dispatch(fetchUserWedding());
   },
);
