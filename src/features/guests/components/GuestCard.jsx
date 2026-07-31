import { Link } from "react-router-dom";
import { Baby, Pencil, Trash2, UserPlus, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardAction,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import GuestRsvpBadge from "./GuestRsvpBadge";

export default function GuestCard({ guest, onDelete }) {
   const hasMeta = guest.hasPlusOne || guest.isChild || guest.dietaryNotes;

   return (
      <Card size="sm">
         <CardHeader>
            <CardTitle>
               {guest.firstName} {guest.lastName}
            </CardTitle>
            {hasMeta && (
               <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
                     <span className="flex max-w-full items-center gap-1">
                        <Utensils className="size-3.5 shrink-0" />
                        <span className="truncate">{guest.dietaryNotes}</span>
                     </span>
                  )}
               </CardDescription>
            )}
            <CardAction>
               <GuestRsvpBadge guest={guest} />
            </CardAction>
         </CardHeader>
         <CardContent className="mt-auto flex items-center justify-end gap-1">
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
         </CardContent>
      </Card>
   );
}
