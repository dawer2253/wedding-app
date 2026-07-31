import { createSelector } from "@reduxjs/toolkit";
import { selectGuestHeadcounts } from "@/features/guests/selectors";
import { CATEGORIES } from "./constants";
import {
   expensePaidGrosze,
   expenseRemainingGrosze,
   expenseTotalGrosze,
   fromGrosze,
   isExpenseOverdue,
   isExpensePaid,
} from "./money";

const selectItems = (state) => state.budget.items;
const selectIds = (state) => state.budget.ids;

export const selectAllExpenses = createSelector(
   [selectItems, selectIds],
   (items, ids) =>
      ids
         .map((id) => items[id])
         .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? "")),
);

export const selectExpenseById = (state, id) => state.budget.items[id];
export const selectBudgetLoading = (state) => state.budget.loading;
export const selectBudgetError = (state) => state.budget.error;
export const selectExpensesCount = (state) => state.budget.ids.length;

const matchesStatus = (expense, status, headcounts) => {
   if (status === "paid") return isExpensePaid(expense, headcounts);
   if (status === "unpaid") return !isExpensePaid(expense, headcounts);
   if (status === "overdue") return isExpenseOverdue(expense, headcounts);
   return true;
};

// Filtry przychodzą z URL-a (useSearchParams), nie ze slice'a:
// selectFilteredExpenses(state, { status, category })
export const selectFilteredExpenses = createSelector(
   [
      selectAllExpenses,
      selectGuestHeadcounts,
      (_, filter) => filter.status,
      (_, filter) => filter.category,
   ],
   (expenses, headcounts, status, category) =>
      expenses.filter((expense) => {
         if (category && expense.category !== category) return false;
         return matchesStatus(expense, status || "all", headcounts);
      }),
);

// W sekcji: najpierw najbliższy termin (bez terminu na końcu), potem nazwa
const compareInSection = (a, b) => {
   const dueA = a.dueDate || "9999-12-31";
   const dueB = b.dueDate || "9999-12-31";
   if (dueA !== dueB) return dueA.localeCompare(dueB);
   return a.name.localeCompare(b.name, "pl");
};

export const selectExpensesByCategory = createSelector(
   [selectFilteredExpenses],
   (expenses) =>
      CATEGORIES.map((category) => ({
         category,
         expenses: expenses
            .filter((expense) => expense.category === category)
            .sort(compareInSection),
      })).filter((section) => section.expenses.length > 0),
);

// Pozostało = suma reszt per wydatek (nadpłata jednego wydatku nie
// pomniejsza tego, co realnie zostało do zapłacenia przy innych)
export const selectBudgetTotals = createSelector(
   [selectAllExpenses, selectGuestHeadcounts],
   (expenses, headcounts) => {
      let planned = 0;
      let paid = 0;
      let remaining = 0;
      for (const expense of expenses) {
         planned += expenseTotalGrosze(expense, headcounts);
         paid += expensePaidGrosze(expense);
         remaining += expenseRemainingGrosze(expense, headcounts);
      }
      return {
         totalPlanned: fromGrosze(planned),
         totalPaid: fromGrosze(paid),
         totalRemaining: fromGrosze(remaining),
      };
   },
);

export const selectCategoryTotals = createSelector(
   [selectAllExpenses, selectGuestHeadcounts],
   (expenses, headcounts) => {
      const totals = {};
      for (const expense of expenses) {
         const entry = (totals[expense.category] ??= {
            planned: 0,
            paid: 0,
            count: 0,
         });
         entry.planned += expenseTotalGrosze(expense, headcounts);
         entry.paid += expensePaidGrosze(expense);
         entry.count += 1;
      }
      for (const entry of Object.values(totals)) {
         entry.planned = fromGrosze(entry.planned);
         entry.paid = fromGrosze(entry.paid);
      }
      return totals;
   },
);

export const selectOverdueExpenses = createSelector(
   [selectAllExpenses, selectGuestHeadcounts],
   (expenses, headcounts) =>
      expenses.filter((expense) => isExpenseOverdue(expense, headcounts)),
);

// Top 3 niezapłacone z terminem, najbliższe najpierw — zaległe naturalnie
// lądują na górze listy
export const selectUpcomingExpenses = createSelector(
   [selectAllExpenses, selectGuestHeadcounts],
   (expenses, headcounts) =>
      expenses
         .filter(
            (expense) =>
               expense.dueDate && !isExpensePaid(expense, headcounts),
         )
         .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
         .slice(0, 3),
);
