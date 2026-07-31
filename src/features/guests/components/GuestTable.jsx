import { memo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
   DndContext,
   PointerSensor,
   closestCenter,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import {
   SortableContext,
   arrayMove,
   useSortable,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
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
         className="h-7 w-full border-transparent shadow-none hover:border-input"
      />
   );
}

// memo: klik w checkbox/status przerysowuje tylko ten jeden wiersz,
// nie całą tabelę (przy ~120 gościach różnica jest odczuwalna)
const GuestRow = memo(function GuestRow({ guest, onDelete }) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: guest.id });

   return (
      <TableRow
         ref={setNodeRef}
         style={{ transform: CSS.Translate.toString(transform), transition }}
         className={isDragging ? "relative z-10 bg-muted" : undefined}
      >
         <TableCell className="py-1">
            <button
               type="button"
               {...attributes}
               {...listeners}
               aria-label="Zmień kolejność"
               className="flex cursor-grab items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            >
               <GripVertical className="size-4" />
            </button>
         </TableCell>
         <TableCell className="truncate py-1 font-medium">
            {guest.firstName} {guest.lastName}
            {guest.hasPlusOne && guest.plusOneName && (
               <span className="block truncate text-xs font-normal text-muted-foreground">
                  + {guest.plusOneName}
               </span>
            )}
         </TableCell>
         <TableCell className="truncate py-1 text-muted-foreground">
            {guest.group || NO_GROUP_LABEL}
         </TableCell>
         <TableCell className="py-1">
            <ToggleCell
               guest={guest}
               field="hasPlusOne"
               label="Z osobą towarzyszącą"
            />
         </TableCell>
         <TableCell className="py-1">
            <ToggleCell guest={guest} field="isChild" label="Dziecko" />
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
   );
});

export default function GuestTable({ guests, onDelete }) {
   const dispatch = useAppDispatch();
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
   );

   // zapis kolejności "ułamkowo": nowa pozycja dostaje wartość między
   // sąsiadami — jeden UPDATE zamiast przenumerowania całej listy
   function handleDragEnd({ active, over }) {
      if (!over || active.id === over.id) return;
      const oldIndex = guests.findIndex((g) => g.id === active.id);
      const newIndex = guests.findIndex((g) => g.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const moved = arrayMove(guests, oldIndex, newIndex);
      const prev = moved[newIndex - 1]?.sortOrder ?? null;
      const next = moved[newIndex + 1]?.sortOrder ?? null;

      let sortOrder;
      if (prev == null && next == null) return;
      if (prev == null) sortOrder = next - 1;
      else if (next == null) sortOrder = prev + 1;
      else sortOrder = (prev + next) / 2;

      dispatch(updateGuest({ id: active.id, changes: { sortOrder } }))
         .unwrap()
         .catch((err) => toast.error(err));
   }

   return (
      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
         <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
         >
            <Table className="w-full table-fixed">
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-8" />
                     <TableHead className="w-[22%]">Gość</TableHead>
                     <TableHead className="w-[13%]">Grupa</TableHead>
                     <TableHead className="w-[8%] text-center">
                        Os. tow.
                     </TableHead>
                     <TableHead className="w-[8%] text-center">
                        Dziecko
                     </TableHead>
                     <TableHead className="w-[17%]">Telefon</TableHead>
                     <TableHead className="w-[14%]">Status</TableHead>
                     <TableHead className="w-[10%] text-right">Akcje</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  <SortableContext
                     items={guests.map((g) => g.id)}
                     strategy={verticalListSortingStrategy}
                  >
                     {guests.map((guest) => (
                        <GuestRow
                           key={guest.id}
                           guest={guest}
                           onDelete={onDelete}
                        />
                     ))}
                  </SortableContext>
               </TableBody>
            </Table>
         </DndContext>
      </div>
   );
}
