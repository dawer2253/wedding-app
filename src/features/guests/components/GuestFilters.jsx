import { useEffect, useState } from "react";
import { List, Search, Table } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Input } from "@/components/ui/input";
import {
   NativeSelect,
   NativeSelectOption,
} from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { setFilter, setViewMode } from "../guestsSlice";
import {
   selectGuestGroups,
   selectGuestsFilter,
   selectGuestsViewMode,
} from "../selectors";
import { NO_GROUP_LABEL, RSVP_LABELS, RSVP_STATUSES } from "../constants";

export default function GuestFilters() {
   const dispatch = useAppDispatch();
   const filter = useAppSelector(selectGuestsFilter);
   const groups = useAppSelector(selectGuestGroups);
   const viewMode = useAppSelector(selectGuestsViewMode);
   const [search, setSearch] = useState(filter.search);

   useEffect(() => {
      const timeout = setTimeout(() => {
         dispatch(setFilter({ search }));
      }, 200);
      return () => clearTimeout(timeout);
   }, [search, dispatch]);

   return (
      <div className="flex flex-wrap items-center gap-2">
         <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Szukaj gościa..."
               className="w-56 pl-8"
            />
         </div>
         <NativeSelect
            value={filter.group}
            onChange={(e) => dispatch(setFilter({ group: e.target.value }))}
            aria-label="Filtr grupy"
         >
            <NativeSelectOption value="all">Wszystkie grupy</NativeSelectOption>
            {groups.map((group) => (
               <NativeSelectOption key={group} value={group}>
                  {group}
               </NativeSelectOption>
            ))}
            <NativeSelectOption value="none">
               {NO_GROUP_LABEL}
            </NativeSelectOption>
         </NativeSelect>
         <NativeSelect
            value={filter.status}
            onChange={(e) => dispatch(setFilter({ status: e.target.value }))}
            aria-label="Filtr statusu"
         >
            <NativeSelectOption value="all">
               Wszystkie statusy
            </NativeSelectOption>
            {RSVP_STATUSES.map((status) => (
               <NativeSelectOption key={status} value={status}>
                  {RSVP_LABELS[status]}
               </NativeSelectOption>
            ))}
         </NativeSelect>
         <ToggleGroup
            type="single"
            variant="outline"
            value={viewMode}
            onValueChange={(value) => value && dispatch(setViewMode(value))}
            className="ml-auto"
         >
            <ToggleGroupItem value="list" aria-label="Widok listy">
               <List />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Widok tabeli">
               <Table />
            </ToggleGroupItem>
         </ToggleGroup>
      </div>
   );
}
