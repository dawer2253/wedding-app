import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { updateGuest } from "../api";
import { NO_GROUP_LABEL } from "../constants";
import GuestRsvpBadge from "./GuestRsvpBadge";

function ToggleCell({ guest, field, label }) {
   const dispatch = useAppDispatch();

   async function handleChange(checked) {
      try {
         await dispatch(
            updateGuest({ id: guest.id, changes: { [field]: checked === true } }),
         ).unwrap();
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <Checkbox
         checked={guest[field]}
         onCheckedChange={handleChange}
         aria-label={label}
         className="mx-auto"
      />
   );
}

function PhoneCell({ guest }) {
   const dispatch = useAppDispatch();

   async function save(event) {
      const next = event.target.value.trim();
      if (next === guest.phone) return;
      try {
         await dispatch(
            updateGuest({ id: guest.id, changes: { phone: next } }),
         ).unwrap();
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <Input
         key={guest.phone}
         defaultValue={guest.phone}
         onBlur={save}
         onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
         placeholder="dodaj numer"
         type="tel"
         className="h-7 w-36 border-transparent shadow-none hover:border-input"
      />
   );
}

export default function GuestTable({ guests, onDelete }) {
   return (
      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-full">Gość</TableHead>
                  <TableHead className="w-40">Grupa</TableHead>
                  <TableHead className="w-24 text-center">Os. tow.</TableHead>
                  <TableHead className="w-24 text-center">Dziecko</TableHead>
                  <TableHead className="w-40">Telefon</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                  <TableHead className="w-24 text-right">Akcje</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {guests.map((guest) => (
                  <TableRow key={guest.id}>
                     <TableCell className="py-1 font-medium">
                        {guest.firstName} {guest.lastName}
                        {guest.hasPlusOne && guest.plusOneName && (
                           <span className="block text-xs font-normal text-muted-foreground">
                              + {guest.plusOneName}
                           </span>
                        )}
                     </TableCell>
                     <TableCell className="py-1 text-muted-foreground">
                        {guest.group || NO_GROUP_LABEL}
                     </TableCell>
                     <TableCell className="py-1 pr-2">
                        <ToggleCell
                           guest={guest}
                           field="hasPlusOne"
                           label="Z osobą towarzyszącą"
                        />
                     </TableCell>
                     <TableCell className="py-1 pr-2">
                        <ToggleCell
                           guest={guest}
                           field="isChild"
                           label="Dziecko"
                        />
                     </TableCell>
                     <TableCell className="py-1">
                        <PhoneCell guest={guest} />
                     </TableCell>
                     <TableCell className="py-1">
                        <GuestRsvpBadge guest={guest} />
                     </TableCell>
                     <TableCell className="py-1 text-right">
                        <div className="inline-flex gap-0.5">
                           <Button
                              asChild
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edytuj"
                           >
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
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
