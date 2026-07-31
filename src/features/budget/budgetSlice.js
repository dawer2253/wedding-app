import { createSlice } from "@reduxjs/toolkit";
import {
   fetchExpenses,
   addExpense,
   updateExpense,
   removeExpense,
   addPayment,
   removePayment,
} from "./api";
import { sortPayments } from "./mappers";

const initialState = {
   items: {},
   ids: [],
   loading: false,
   error: null,
   optimisticBackups: {},
};

const budgetSlice = createSlice({
   name: "budget",
   initialState,
   reducers: {
      resetBudget() {
         return initialState;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchExpenses.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchExpenses.fulfilled, (state, action) => {
            state.loading = false;
            state.items = {};
            state.ids = [];
            for (const expense of action.payload) {
               state.items[expense.id] = expense;
               state.ids.push(expense.id);
            }
         })
         .addCase(fetchExpenses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(addExpense.fulfilled, (state, action) => {
            const { expense } = action.payload;
            if (!state.items[expense.id]) {
               state.ids.push(expense.id);
            }
            state.items[expense.id] = expense;
         })
         // updateExpense — optymistycznie: zmiana od razu, rollback przy błędzie.
         // Backup i patch obejmują TYLKO pola z danego requestu — dzięki temu
         // zagnieżdżone payments (których update z DB nie zwraca) nigdy nie są
         // nadpisywane, a równoległe update'y nie kasują sobie zmian
         .addCase(updateExpense.pending, (state, action) => {
            const { id, changes } = action.meta.arg;
            const existing = state.items[id];
            if (!existing) return;
            const fields = {};
            for (const key of Object.keys(changes)) {
               fields[key] = existing[key];
            }
            state.optimisticBackups[action.meta.requestId] = { id, fields };
            state.items[id] = { ...existing, ...changes };
         })
         .addCase(updateExpense.fulfilled, (state, action) => {
            const { id, changes } = action.meta.arg;
            const expense = action.payload;
            delete state.optimisticBackups[action.meta.requestId];
            const existing = state.items[id];
            // wydatek mógł zostać w międzyczasie optymistycznie usunięty —
            // nie wskrzeszamy go poza listą ids
            if (!existing) return;
            const patch = { updatedAt: expense.updatedAt };
            for (const key of Object.keys(changes)) {
               patch[key] = expense[key];
            }
            state.items[id] = { ...existing, ...patch };
         })
         .addCase(updateExpense.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            delete state.optimisticBackups[action.meta.requestId];
            if (!backup) return;
            const existing = state.items[backup.id];
            if (!existing) return;
            state.items[backup.id] = { ...existing, ...backup.fields };
         })
         // removeExpense — optymistycznie: wiersz znika od razu, wraca przy błędzie
         .addCase(removeExpense.pending, (state, action) => {
            const id = action.meta.arg;
            const index = state.ids.indexOf(id);
            if (index === -1) return;
            state.optimisticBackups[action.meta.requestId] = {
               expense: state.items[id],
               index,
            };
            state.ids.splice(index, 1);
            delete state.items[id];
         })
         .addCase(removeExpense.fulfilled, (state, action) => {
            delete state.optimisticBackups[action.meta.requestId];
         })
         .addCase(removeExpense.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            if (backup) {
               state.items[backup.expense.id] = backup.expense;
               state.ids.splice(
                  Math.min(backup.index, state.ids.length),
                  0,
                  backup.expense.id,
               );
            }
            delete state.optimisticBackups[action.meta.requestId];
         })
         // addPayment — optymistycznie: tymczasowa płatność z id = requestId,
         // fulfilled podmienia ją na wiersz z DB, rejected usuwa
         .addCase(addPayment.pending, (state, action) => {
            const { expenseId, weddingId, amount, paidAt, note } =
               action.meta.arg;
            const expense = state.items[expenseId];
            if (!expense) return;
            expense.payments.push({
               id: action.meta.requestId,
               expenseId,
               weddingId,
               amount,
               paidAt,
               note: note ?? "",
               createdAt: null,
            });
            expense.payments.sort(sortPayments);
         })
         .addCase(addPayment.fulfilled, (state, action) => {
            const expense = state.items[action.meta.arg.expenseId];
            if (!expense) return;
            const index = expense.payments.findIndex(
               (payment) => payment.id === action.meta.requestId,
            );
            if (index === -1) expense.payments.push(action.payload);
            else expense.payments[index] = action.payload;
            expense.payments.sort(sortPayments);
         })
         .addCase(addPayment.rejected, (state, action) => {
            const expense = state.items[action.meta.arg.expenseId];
            if (!expense) return;
            expense.payments = expense.payments.filter(
               (payment) => payment.id !== action.meta.requestId,
            );
         })
         // removePayment — optymistycznie, z przywróceniem na tej samej pozycji
         .addCase(removePayment.pending, (state, action) => {
            const { expenseId, paymentId } = action.meta.arg;
            const expense = state.items[expenseId];
            if (!expense) return;
            const index = expense.payments.findIndex(
               (payment) => payment.id === paymentId,
            );
            if (index === -1) return;
            state.optimisticBackups[action.meta.requestId] = {
               expenseId,
               payment: expense.payments[index],
               index,
            };
            expense.payments.splice(index, 1);
         })
         .addCase(removePayment.fulfilled, (state, action) => {
            delete state.optimisticBackups[action.meta.requestId];
         })
         .addCase(removePayment.rejected, (state, action) => {
            const backup = state.optimisticBackups[action.meta.requestId];
            delete state.optimisticBackups[action.meta.requestId];
            if (!backup) return;
            const expense = state.items[backup.expenseId];
            if (!expense) return;
            expense.payments.splice(
               Math.min(backup.index, expense.payments.length),
               0,
               backup.payment,
            );
         });
   },
});

export const { resetBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
