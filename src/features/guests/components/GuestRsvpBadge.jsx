import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import { cn } from "@/lib/utils";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuRadioGroup,
   DropdownMenuRadioItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateGuest } from "../api";
import { RSVP_BADGE_CLASSES, RSVP_LABELS, RSVP_STATUSES } from "../constants";

export default function GuestRsvpBadge({ guest }) {
   const dispatch = useAppDispatch();

   async function handleChange(status) {
      if (status === guest.rsvpStatus) return;
      try {
         await dispatch(
            updateGuest({ id: guest.id, changes: { rsvpStatus: status } }),
         ).unwrap();
         toast.success(`Zmieniono status na „${RSVP_LABELS[status]}"`);
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <DropdownMenu>
         <DropdownMenuTrigger
            className={cn(
               "inline-flex h-5 shrink-0 cursor-pointer items-center gap-1 rounded-4xl px-2 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
               RSVP_BADGE_CLASSES[guest.rsvpStatus],
            )}
         >
            {RSVP_LABELS[guest.rsvpStatus]}
            <ChevronDown className="size-3" />
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
               value={guest.rsvpStatus}
               onValueChange={handleChange}
            >
               {RSVP_STATUSES.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                     {RSVP_LABELS[status]}
                  </DropdownMenuRadioItem>
               ))}
            </DropdownMenuRadioGroup>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
