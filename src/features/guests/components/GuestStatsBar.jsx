import { useAppSelector } from "@/app/hooks";
import { Card } from "@/components/ui/card";
import { selectGuestStats } from "../selectors";

const TILES = [
   { key: "total", label: "Łącznie osób", valueClass: "" },
   {
      key: "confirmed",
      label: "Potwierdzeni",
      valueClass: "text-green-600 dark:text-green-400",
   },
   {
      key: "pending",
      label: "Oczekują",
      valueClass: "text-amber-600 dark:text-amber-400",
   },
   {
      key: "declined",
      label: "Odmowy",
      valueClass: "text-red-600 dark:text-red-400",
   },
   {
      key: "plusOnes",
      label: "Os. towarzyszące",
      shortLabel: "Os. tow.",
      valueClass: "",
   },
   { key: "children", label: "Dzieci", valueClass: "" },
];

export default function GuestStatsBar() {
   const stats = useAppSelector(selectGuestStats);

   return (
      <div className="grid grid-cols-3 gap-2 md:gap-3 lg:grid-cols-6">
         {TILES.map((tile) => (
            <Card key={tile.key} size="sm" className="gap-0.5 px-2.5 md:px-4">
               <p className="truncate text-xs text-muted-foreground">
                  {tile.shortLabel ? (
                     <>
                        <span className="lg:hidden">{tile.shortLabel}</span>
                        <span className="hidden lg:inline">{tile.label}</span>
                     </>
                  ) : (
                     tile.label
                  )}
               </p>
               <p
                  className={`text-lg font-semibold md:text-2xl ${tile.valueClass}`}
               >
                  {stats[tile.key]}
               </p>
            </Card>
         ))}
      </div>
   );
}
