import { useAppSelector } from "@/app/hooks";
import { Card } from "@/components/ui/card";
import { formatPLN } from "@/lib/currency";
import { selectBudgetTotals } from "../selectors";

export default function BudgetTotals() {
   const totals = useAppSelector(selectBudgetTotals);

   const tiles = [
      { label: "Planowane", value: totals.totalPlanned, valueClass: "" },
      {
         label: "Zapłacone",
         value: totals.totalPaid,
         valueClass: "text-green-600 dark:text-green-400",
      },
      {
         label: "Pozostało",
         value: totals.totalRemaining,
         valueClass:
            totals.totalRemaining > 0
               ? "text-orange-600 dark:text-orange-400"
               : "",
      },
   ];

   return (
      <div className="grid grid-cols-3 gap-2 md:gap-3">
         {tiles.map((tile) => (
            <Card key={tile.label} size="sm" className="gap-0.5 px-2.5 md:px-4">
               <p className="truncate text-xs text-muted-foreground">
                  {tile.label}
               </p>
               {/* pełne złote — kwota z groszami nie mieści się w kafelku
                   na 375px; dokładne wartości są w wierszach wydatków */}
               <p
                  className={`truncate text-lg font-semibold md:text-2xl ${tile.valueClass}`}
               >
                  {formatPLN(Math.round(tile.value))}
               </p>
            </Card>
         ))}
      </div>
   );
}
