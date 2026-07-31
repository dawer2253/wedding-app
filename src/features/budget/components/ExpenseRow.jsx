import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CircleCheck, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { withSheetParam } from "@/hooks/useSheetParams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { selectGuestHeadcounts } from "@/features/guests/selectors";
import { formatPLN } from "@/lib/currency";
import { formatDate, todayISO } from "@/lib/date";
import { addPayment } from "../api";
import {
   expensePaidGrosze,
   expenseQuantity,
   expenseRemainingGrosze,
   expenseTotalGrosze,
   formatQuantity,
   fromGrosze,
   isExpenseOverdue,
   isExpensePaid,
} from "../money";

export default function ExpenseRow({ expense, onDelete }) {
   const dispatch = useAppDispatch();
   const headcounts = useAppSelector(selectGuestHeadcounts);
   const [searchParams] = useSearchParams();

   const totalGrosze = expenseTotalGrosze(expense, headcounts);
   const paidGrosze = expensePaidGrosze(expense);
   const remainingGrosze = expenseRemainingGrosze(expense, headcounts);
   const paid = isExpensePaid(expense, headcounts);
   const overdue = isExpenseOverdue(expense, headcounts);
   const percent =
      totalGrosze > 0
         ? Math.min(100, Math.round((paidGrosze / totalGrosze) * 100))
         : 0;

   async function handleMarkPaid() {
      try {
         await dispatch(
            addPayment({
               expenseId: expense.id,
               weddingId: expense.weddingId,
               amount: fromGrosze(remainingGrosze),
               paidAt: todayISO(),
               note: "",
            }),
         ).unwrap();
         toast.success("Oznaczono jako zapłacone");
      } catch (err) {
         toast.error(err);
      }
   }

   const barColor = paid
      ? "bg-green-500"
      : overdue
        ? "bg-red-500"
        : "bg-primary";

   return (
      <div className="flex items-center gap-4 px-4 py-3">
         <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
               <span className="truncate font-medium">{expense.name}</span>
               {expense.vendorName && (
                  <span className="truncate text-xs text-muted-foreground">
                     {expense.vendorName}
                  </span>
               )}
               {paid && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                     Zapłacone
                  </Badge>
               )}
               {overdue && <Badge variant="destructive">Zaległy</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
               <span>
                  <span className="font-medium text-foreground">
                     {formatPLN(fromGrosze(paidGrosze))}
                  </span>{" "}
                  z {formatPLN(fromGrosze(totalGrosze))}
               </span>
               {expense.pricingType === "per_unit" && (
                  <span>
                     {formatQuantity(expenseQuantity(expense, headcounts))}{" "}
                     {expense.quantitySource === "manual" ? "szt." : "os."} ×{" "}
                     {formatPLN(expense.unitPrice)}
                  </span>
               )}
               {expense.dueDate && (
                  <span
                     className={
                        overdue
                           ? "font-medium text-red-600 dark:text-red-400"
                           : ""
                     }
                  >
                     Termin: {formatDate(expense.dueDate)}
                  </span>
               )}
            </div>
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
               <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${percent}%` }}
               />
            </div>
         </div>
         <div className="flex shrink-0 items-center gap-1">
            {remainingGrosze > 0 && (
               <Button variant="ghost" size="sm" onClick={handleMarkPaid}>
                  <CircleCheck />
                  Zapłacono
               </Button>
            )}
            <Button asChild variant="ghost" size="icon" aria-label="Edytuj">
               <Link
                  to={{
                     search: withSheetParam(searchParams, "edit", expense.id),
                  }}
               >
                  <Pencil />
               </Link>
            </Button>
            <Button
               variant="ghost"
               size="icon"
               aria-label="Usuń"
               onClick={() => onDelete(expense)}
            >
               <Trash2 />
            </Button>
         </div>
      </div>
   );
}
