import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { selectGuestHeadcounts } from "@/features/guests/selectors";
import { formatPLN } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import {
   expenseRemainingGrosze,
   fromGrosze,
   isExpenseOverdue,
} from "../money";
import { selectUpcomingExpenses } from "../selectors";

export default function UpcomingPayments() {
   const expenses = useAppSelector(selectUpcomingExpenses);
   const headcounts = useAppSelector(selectGuestHeadcounts);

   return (
      <Card>
         <CardHeader>
            <CardTitle>Najbliższe płatności</CardTitle>
         </CardHeader>
         <CardContent>
            {expenses.length === 0 ? (
               <p className="text-sm text-muted-foreground">
                  Brak nadchodzących płatności.
               </p>
            ) : (
               <div className="divide-y">
                  {expenses.map((expense) => {
                     const overdue = isExpenseOverdue(expense, headcounts);
                     return (
                        <Link
                           key={expense.id}
                           to={`/budget/${expense.id}/edit`}
                           className="flex items-center gap-3 px-2 py-2.5 transition-colors hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
                        >
                           <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                 {expense.name}
                              </p>
                              <p
                                 className={`text-xs ${
                                    overdue
                                       ? "font-medium text-red-600 dark:text-red-400"
                                       : "text-muted-foreground"
                                 }`}
                              >
                                 {overdue && (
                                    <TriangleAlert className="mr-1 inline size-3" />
                                 )}
                                 {formatDate(expense.dueDate)}
                              </p>
                           </div>
                           <span className="shrink-0 text-sm font-medium">
                              {formatPLN(
                                 fromGrosze(
                                    expenseRemainingGrosze(
                                       expense,
                                       headcounts,
                                    ),
                                 ),
                              )}
                           </span>
                        </Link>
                     );
                  })}
               </div>
            )}
         </CardContent>
      </Card>
   );
}
