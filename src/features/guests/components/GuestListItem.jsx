import { Link } from "react-router-dom";
import { Baby, Pencil, Trash2, UserPlus, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   Item,
   ItemActions,
   ItemContent,
   ItemDescription,
   ItemTitle,
} from "@/components/ui/item";
import GuestRsvpBadge from "./GuestRsvpBadge";

export default function GuestListItem({ guest, onDelete }) {
   const hasMeta = guest.hasPlusOne || guest.isChild || guest.dietaryNotes;

   return (
      <Item variant="outline" size="sm" role="listitem">
         <ItemContent>
            <ItemTitle>
               {guest.firstName} {guest.lastName}
            </ItemTitle>
            {hasMeta && (
               <ItemDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {guest.hasPlusOne && (
                     <span className="flex items-center gap-1">
                        <UserPlus className="size-3.5" />
                        {guest.plusOneName || "z osobą towarzyszącą"}
                     </span>
                  )}
                  {guest.isChild && (
                     <span className="flex items-center gap-1">
                        <Baby className="size-3.5" />
                        dziecko
                     </span>
                  )}
                  {guest.dietaryNotes && (
                     <span className="flex items-center gap-1">
                        <Utensils className="size-3.5 shrink-0" />
                        <span className="truncate">{guest.dietaryNotes}</span>
                     </span>
                  )}
               </ItemDescription>
            )}
         </ItemContent>
         <ItemActions>
            <GuestRsvpBadge guest={guest} />
            <Button asChild variant="ghost" size="icon-sm" aria-label="Edytuj">
               <Link to={`/guests/${guest.id}/edit`}>
                  <Pencil />
               </Link>
            </Button>
            <Button
               variant="ghost"
               size="icon-sm"
               aria-label="Usuń"
               className="text-destructive hover:text-destructive"
               onClick={() => onDelete(guest)}
            >
               <Trash2 />
            </Button>
         </ItemActions>
      </Item>
   );
}
