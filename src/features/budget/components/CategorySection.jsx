import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { selectGuestHeadcounts } from "@/features/guests/selectors";
import { formatPLN } from "@/lib/currency";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../constants";
import { expensePaidGrosze, expenseTotalGrosze, fromGrosze } from "../money";
import ExpenseRow from "./ExpenseRow";

export default function CategorySection({ category, expenses, onDelete }) {
   const [open, setOpen] = useState(true);
   const headcounts = useAppSelector(selectGuestHeadcounts);
   const Icon = CATEGORY_ICONS[category];

   // suma tego, co widać w sekcji (uwzględnia aktywne filtry)
   let planned = 0;
   let paid = 0;
   for (const expense of expenses) {
      planned += expenseTotalGrosze(expense, headcounts);
      paid += expensePaidGrosze(expense);
   }

   return (
      <Card className="gap-0 py-0">
         <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
         >
            <Icon className="size-4.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">{CATEGORY_LABELS[category]}</span>
            <Badge variant="secondary">{expenses.length}</Badge>
            <span className="ml-auto text-sm text-muted-foreground">
               <span className="font-medium text-foreground">
                  {formatPLN(fromGrosze(paid))}
               </span>{" "}
               / {formatPLN(fromGrosze(planned))}
            </span>
            <ChevronDown
               className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                  open ? "" : "-rotate-90"
               }`}
            />
         </button>
         {open && (
            <div className="divide-y border-t">
               {expenses.map((expense) => (
                  <ExpenseRow
                     key={expense.id}
                     expense={expense}
                     onDelete={onDelete}
                  />
               ))}
            </div>
         )}
      </Card>
   );
}
