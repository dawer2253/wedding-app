import { Link } from "react-router-dom";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { NO_GROUP_LABEL } from "../constants";
import GuestRsvpBadge from "./GuestRsvpBadge";

function BoolCell({ value }) {
   return value ? (
      <Check className="size-4 text-green-600 dark:text-green-400" />
   ) : (
      <span className="text-muted-foreground">—</span>
   );
}

export default function GuestTable({ guests, onDelete }) {
   return (
      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead>Gość</TableHead>
                  <TableHead>Grupa</TableHead>
                  <TableHead>Os. tow.</TableHead>
                  <TableHead>Dziecko</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {guests.map((guest) => (
                  <TableRow key={guest.id}>
                     <TableCell className="font-medium">
                        {guest.firstName} {guest.lastName}
                        {guest.hasPlusOne && guest.plusOneName && (
                           <span className="block text-xs font-normal text-muted-foreground">
                              + {guest.plusOneName}
                           </span>
                        )}
                     </TableCell>
                     <TableCell className="text-muted-foreground">
                        {guest.group || NO_GROUP_LABEL}
                     </TableCell>
                     <TableCell>
                        <BoolCell value={guest.hasPlusOne} />
                     </TableCell>
                     <TableCell>
                        <BoolCell value={guest.isChild} />
                     </TableCell>
                     <TableCell>
                        <GuestRsvpBadge guest={guest} />
                     </TableCell>
                     <TableCell className="text-right">
                        <div className="inline-flex gap-1">
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
