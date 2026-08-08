import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { STATUSES, STATUS_LABELS } from "../constants";

// Filtr statusów żyje w URL-u (?status=quoted,to_check) — brak zaznaczeń
// = wszystkie statusy. Osobne chipsy (a nie zbity segment jak w budżecie),
// bo wybór jest wielokrotny i pięć etykiet nie mieści się w jednym rzędzie
// na telefonie — zawijają się zamiast przycinać tekst
export default function VendorFilters() {
   const [searchParams, setSearchParams] = useSearchParams();
   const statusParam = searchParams.get("status") || "";
   const selected = statusParam ? statusParam.split(",") : [];

   function setStatuses(values) {
      const next = new URLSearchParams(searchParams);
      // porządkujemy wg STATUSES, żeby URL nie zależał od kolejności klikania
      const ordered = STATUSES.filter((status) => values.includes(status));
      if (ordered.length === 0) next.delete("status");
      else next.set("status", ordered.join(","));
      setSearchParams(next);
   }

   return (
      <div className="flex flex-wrap items-center gap-2">
         <ToggleGroup
            type="multiple"
            variant="outline"
            value={selected}
            onValueChange={setStatuses}
            className="flex-wrap justify-start"
         >
            {STATUSES.map((status) => (
               <ToggleGroupItem key={status} value={status}>
                  {STATUS_LABELS[status]}
               </ToggleGroupItem>
            ))}
         </ToggleGroup>
         {selected.length > 0 && (
            <Button
               variant="ghost"
               className="text-muted-foreground"
               onClick={() => setStatuses([])}
            >
               <X />
               Wyczyść
            </Button>
         )}
      </div>
   );
}
