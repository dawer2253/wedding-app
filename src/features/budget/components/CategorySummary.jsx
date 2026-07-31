import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { formatPLN } from "@/lib/currency";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_LABELS } from "../constants";
import { toGrosze } from "../money";
import { selectCategoryTotals } from "../selectors";

export default function CategorySummary() {
   const totals = useAppSelector(selectCategoryTotals);
   const categories = CATEGORIES.filter((category) => totals[category]);

   return (
      <Card>
         <CardHeader>
            <CardTitle>Kategorie</CardTitle>
         </CardHeader>
         <CardContent className="space-y-1">
            {categories.length === 0 && (
               <p className="text-sm text-muted-foreground">
                  Brak wydatków.
               </p>
            )}
            {categories.map((category) => {
               const { planned, paid } = totals[category];
               const Icon = CATEGORY_ICONS[category];
               const plannedGrosze = toGrosze(planned);
               const paidGrosze = toGrosze(paid);
               const percent =
                  plannedGrosze > 0
                     ? Math.min(
                          100,
                          Math.round((paidGrosze / plannedGrosze) * 100),
                       )
                     : 0;
               const isPaid = plannedGrosze > 0 && paidGrosze >= plannedGrosze;
               return (
                  <Link
                     key={category}
                     to={`/budget/list?category=${category}`}
                     className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
                  >
                     <Icon className="size-4.5 shrink-0 text-muted-foreground" />
                     <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2 text-sm">
                           <span className="truncate font-medium">
                              {CATEGORY_LABELS[category]}
                           </span>
                           <span className="shrink-0 text-xs text-muted-foreground">
                              {formatPLN(paid)} / {formatPLN(planned)}
                           </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                           <div
                              className={`h-full rounded-full ${
                                 isPaid ? "bg-green-500" : "bg-primary"
                              }`}
                              style={{ width: `${percent}%` }}
                           />
                        </div>
                     </div>
                  </Link>
               );
            })}
         </CardContent>
      </Card>
   );
}
