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
      <div className="grid gap-3 sm:grid-cols-3">
         {tiles.map((tile) => (
            <Card key={tile.label} size="sm" className="gap-0.5 px-4">
               <p className="text-xs text-muted-foreground">{tile.label}</p>
               <p className={`text-2xl font-semibold ${tile.valueClass}`}>
                  {formatPLN(tile.value)}
               </p>
            </Card>
         ))}
      </div>
   );
}
