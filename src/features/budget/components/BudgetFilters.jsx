import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
   CATEGORY_LABELS,
   STATUS_FILTERS,
   STATUS_FILTER_LABELS,
} from "../constants";

// Filtry żyją w URL-u (?status=...&category=...) — linki z podsumowania
// działają bez dodatkowego stanu, a back przywraca poprzedni widok
export default function BudgetFilters() {
   const [searchParams, setSearchParams] = useSearchParams();
   const status = searchParams.get("status") || "all";
   const category = searchParams.get("category");

   function setStatus(value) {
      if (!value) return;
      const next = new URLSearchParams(searchParams);
      if (value === "all") next.delete("status");
      else next.set("status", value);
      setSearchParams(next);
   }

   function clearCategory() {
      const next = new URLSearchParams(searchParams);
      next.delete("category");
      setSearchParams(next);
   }

   return (
      <div className="flex flex-wrap items-center gap-3">
         <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={status}
            onValueChange={setStatus}
            className="w-full sm:w-fit"
         >
            {STATUS_FILTERS.map((value) => (
               <ToggleGroupItem
                  key={value}
                  value={value}
                  className="flex-1 sm:flex-none"
               >
                  {STATUS_FILTER_LABELS[value]}
               </ToggleGroupItem>
            ))}
         </ToggleGroup>
         {category && (
            <Badge variant="secondary" className="gap-1 pr-1">
               {CATEGORY_LABELS[category] ?? category}
               <button
                  type="button"
                  onClick={clearCategory}
                  aria-label="Wyczyść filtr kategorii"
                  className="rounded-full p-0.5 hover:bg-foreground/10"
               >
                  <X className="size-3" />
               </button>
            </Badge>
         )}
      </div>
   );
}
