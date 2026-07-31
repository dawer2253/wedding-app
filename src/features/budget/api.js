import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/date";
import {
   mapExpenseFromDb,
   mapExpenseToDb,
   mapPaymentFromDb,
   mapPaymentToDb,
} from "./mappers";

export const fetchExpenses = createAsyncThunk(
   "budget/fetchExpenses",
   async (weddingId, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("expenses")
         .select("*, expense_payments(*)")
         .eq("wedding_id", weddingId)
         .order("created_at", { ascending: true });
      if (error) return rejectWithValue(error.message);
      return data.map(mapExpenseFromDb);
   },
);

export const addExpense = createAsyncThunk(
   "budget/addExpense",
   async ({ initialPayment, ...expense }, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("expenses")
         .insert(mapExpenseToDb(expense))
         .select()
         .single();
      if (error) return rejectWithValue(error.message);
      const created = mapExpenseFromDb({ ...data, expense_payments: [] });

      // opcjonalna zaliczka wpisana przy tworzeniu — osobny insert; gdy padnie,
      // wydatek już istnieje, więc nie wywracamy całości, tylko sygnalizujemy
      if (initialPayment > 0) {
         const { data: paymentRow, error: paymentError } = await supabase
            .from("expense_payments")
            .insert(
               mapPaymentToDb({
                  expenseId: created.id,
                  weddingId: created.weddingId,
                  amount: initialPayment,
                  paidAt: todayISO(),
                  note: "Zaliczka",
               }),
            )
            .select()
            .single();
         if (paymentError) return { expense: created, paymentFailed: true };
         created.payments.push(mapPaymentFromDb(paymentRow));
      }
      return { expense: created, paymentFailed: false };
   },
);

export const updateExpense = createAsyncThunk(
   "budget/updateExpense",
   async ({ id, changes }, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("expenses")
         .update(mapExpenseToDb(changes))
         .eq("id", id)
         .select()
         .single();
      if (error) return rejectWithValue(error.message);
      return mapExpenseFromDb(data);
   },
);

export const removeExpense = createAsyncThunk(
   "budget/removeExpense",
   async (id, { rejectWithValue }) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) return rejectWithValue(error.message);
      return id;
   },
);

export const addPayment = createAsyncThunk(
   "budget/addPayment",
   async (payment, { rejectWithValue }) => {
      const { data, error } = await supabase
         .from("expense_payments")
         .insert(mapPaymentToDb(payment))
         .select()
         .single();
      if (error) return rejectWithValue(error.message);
      return mapPaymentFromDb(data);
   },
);

export const removePayment = createAsyncThunk(
   "budget/removePayment",
   async ({ paymentId }, { rejectWithValue }) => {
      const { error } = await supabase
         .from("expense_payments")
         .delete()
         .eq("id", paymentId);
      if (error) return rejectWithValue(error.message);
      return paymentId;
   },
);
