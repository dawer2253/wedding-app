import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

export const initializeAuth = createAsyncThunk(
   "auth/initialize",
   async (_, { rejectWithValue }) => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
         return rejectWithValue(error.message);
      }
      return data.session;
   },
);

export const signUp = createAsyncThunk(
   "auth/signUp",
   async ({ email, password }, { rejectWithValue }) => {
      const { data, error } = await supabase.auth.signUp({
         email,
         password,
      });
      if (error) {
         return rejectWithValue(error.message);
      }
      return data;
   },
);

export const login = createAsyncThunk(
   "auth/login",
   async ({ email, password }, { rejectWithValue }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
         email,
         password,
      });
      if (error) {
         return rejectWithValue(error.message);
      }
      return data;
   },
);

export const signOut = createAsyncThunk(
   "auth/signOut",
   async (_, { rejectWithValue }) => {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
         return rejectWithValue(error.message);
      }
      console.log("siema");
      return null;
   },
);

export const resetPassword = createAsyncThunk(
   "auth/resetPassword",
   async (email, { rejectWithValue }) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
         redirectTo: "http://localhost:5173/reset-password",
      });
      if (error) {
         return rejectWithValue(error.message);
      }
      return data;
   },
);

export const updatePassword = createAsyncThunk(
   "auth/updatePassword",
   async (newPassword, { rejectWithValue }) => {
      const { error } = await supabase.auth.updateUser({
         password: newPassword,
      });
      if (error) {
         return rejectWithValue(error.message);
      }
      return null;
   },
);
