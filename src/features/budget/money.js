import { todayISO } from "@/lib/date";
import { CHILDREN_FACTORS } from "./constants";

// Cała arytmetyka kwot w groszach (integer) — sumowanie floatów gubi grosze
// (0.1 + 0.2 !== 0.3), a przy porównaniu "zapłacone >= total" to boli
export const toGrosze = (zl) => Math.round((zl ?? 0) * 100);
export const fromGrosze = (grosze) => grosze / 100;

// Liczba sztuk wydatku per_unit — ręczna albo liczona z gości
// (osoba towarzysząca = dodatkowy dorosły, dzieci wg childrenCounting)
export const expenseQuantity = (expense, headcounts) => {
   if (expense.quantitySource === "manual") return expense.quantity ?? 0;
   const scope =
      expense.quantitySource === "confirmed_guests"
         ? headcounts.confirmed
         : headcounts.all;
   const factor = CHILDREN_FACTORS[expense.childrenCounting] ?? 1;
   return scope.adults + scope.children * factor;
};

export const expenseTotalGrosze = (expense, headcounts) => {
   if (expense.pricingType === "per_unit") {
      return Math.round(
         toGrosze(expense.unitPrice) * expenseQuantity(expense, headcounts),
      );
   }
   return toGrosze(expense.totalCost);
};

export const expensePaidGrosze = (expense) =>
   expense.payments.reduce((sum, payment) => sum + toGrosze(payment.amount), 0);

export const expenseRemainingGrosze = (expense, headcounts) =>
   Math.max(
      0,
      expenseTotalGrosze(expense, headcounts) - expensePaidGrosze(expense),
   );

export const isExpensePaid = (expense, headcounts) =>
   expenseTotalGrosze(expense, headcounts) > 0 &&
   expenseRemainingGrosze(expense, headcounts) === 0;

// "87" / "87,5" — do formuł typu "87 os. × 430 zł"
export const formatQuantity = (quantity) =>
   new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(
      quantity,
   );

// Porównanie stringów YYYY-MM-DD działa leksykograficznie poprawnie
export const isExpenseOverdue = (expense, headcounts) =>
   Boolean(expense.dueDate) &&
   expense.dueDate < todayISO() &&
   !isExpensePaid(expense, headcounts);
